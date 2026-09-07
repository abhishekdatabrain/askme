const sequelize = require('../../config/database');
const { Wallet, WalletTransaction, WalletSettlement, Creator, Donation } = require('../../models');
const { Op } = require('sequelize');

/**
 * Helper to parse YYYY-MM month string and return earning_month, settlement_month and date range
 */
const getMonthDateRange = (targetMonthStr) => {
  if (!targetMonthStr || !/^\d{4}-\d{2}$/.test(targetMonthStr)) {
    const err = new Error('Invalid month format. Expected format: YYYY-MM (e.g. 2026-10)');
    err.statusCode = 400;
    throw err;
  }

  const [yearStr, mStr] = targetMonthStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(mStr, 10);

  if (month < 1 || month > 12) {
    const err = new Error('Invalid month number. Must be between 01 and 12.');
    err.statusCode = 400;
    throw err;
  }

  // If target input is Settlement Month (e.g. 2026-10), Earning Month is 2026-09 (1 month prior)
  const earningMonthDate = new Date(Date.UTC(year, month - 2, 1, 0, 0, 0, 0));
  const eY = earningMonthDate.getUTCFullYear();
  const eM = String(earningMonthDate.getUTCMonth() + 1).padStart(2, '0');
  const earningMonth = `${eY}-${eM}`;
  const settlementMonth = targetMonthStr;

  // Earning Period: start of earning month to start of settlement month
  const periodStart = new Date(Date.UTC(eY, earningMonthDate.getUTCMonth(), 1, 0, 0, 0, 0));
  const periodEnd = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));

  return { periodStart, periodEnd, earningMonth, settlementMonth };
};

/**
 * Execute Monthly Wallet Settlement for Creator(s)
 * Idempotent, transaction-safe, row-locked execution.
 * Calculates creator_net_amount + previous_carried_balance = available_amount
 */
const settleMonthService = async ({ month, creatorId = null }) => {
  // If month not specified, default to current month as settlement_month (settling previous month earnings)
  let targetSettlementMonth = month;
  if (!targetSettlementMonth) {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    targetSettlementMonth = `${y}-${m}`;
  }

  const { periodStart, periodEnd, earningMonth, settlementMonth } = getMonthDateRange(targetSettlementMonth);

  // Get target creators
  const creatorWhere = {};
  if (creatorId) {
    creatorWhere.id = creatorId;
  }

  const creators = await Creator.findAll({
    where: creatorWhere,
    attributes: ['id', 'full_name', 'email', 'status'],
  });

  if (creators.length === 0) {
    return {
      status: 'success',
      month: settlementMonth,
      earningMonth,
      totalCreators: 0,
      settledCount: 0,
      alreadySettledCount: 0,
      totalSettledAmount: 0,
      settlements: [],
    };
  }

  const results = [];
  let settledCount = 0;
  let alreadySettledCount = 0;
  let totalSettledAmount = 0;

  for (const creator of creators) {
    const t = await sequelize.transaction();

    try {
      // 1. Ensure Wallet exists and lock row
      const [wallet] = await Wallet.findOrCreate({
        where: { creator_id: creator.id },
        defaults: {
          creator_id: creator.id,
          total_earnings: 0,
          available_balance: 0,
          pending_balance: 0,
          withdrawn_amount: 0,
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      // 2. Check Idempotency: Has this creator/settlement_month already been settled?
      const existingSettlement = await WalletSettlement.findOne({
        where: {
          creator_id: creator.id,
          settlement_month: settlementMonth,
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (existingSettlement) {
        await t.commit();
        alreadySettledCount++;
        results.push({
          creatorId: creator.id,
          creatorName: creator.full_name,
          earningMonth: existingSettlement.earning_month || earningMonth,
          settlementMonth,
          status: 'already_settled',
          netAmount: parseFloat(existingSettlement.creator_net_amount || existingSettlement.net_amount || 0),
          previousCarriedBalance: parseFloat(existingSettlement.previous_carried_balance || 0),
          availableAmount: parseFloat(existingSettlement.available_amount || 0),
          withdrawnAmount: parseFloat(existingSettlement.withdrawn_amount || 0),
          remainingAmount: parseFloat(existingSettlement.remaining_amount || 0),
          hasWithdrawn: Boolean(existingSettlement.has_withdrawn),
          settledAt: existingSettlement.settled_at,
          message: `Settlement cycle ${settlementMonth} for ${creator.full_name} was already created on ${existingSettlement.settled_at}.`,
        });
        continue;
      }

      // 3. Find previous settlement cycle record to get carried-forward remaining balance
      const prevSettlement = await WalletSettlement.findOne({
        where: {
          creator_id: creator.id,
          settlement_month: { [Op.lt]: settlementMonth }
        },
        order: [['settlement_month', 'DESC']],
        transaction: t,
      });

      const previousCarriedBalance = prevSettlement
        ? parseFloat(prevSettlement.remaining_amount || 0)
        : parseFloat(wallet.available_balance || 0);

      // 4. Calculate Net Eligible Earnings for Earning Month
      const donationTxns = await WalletTransaction.findAll({
        where: {
          creator_id: creator.id,
          transaction_type: 'donation',
          direction: 'credit',
          created_at: {
            [Op.gte]: periodStart,
            [Op.lt]: periodEnd,
          },
        },
        attributes: ['amount'],
        transaction: t,
      });

      const creatorNetEarning = donationTxns.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

      const donations = await Donation.findAll({
        where: {
          creator_id: creator.id,
          payment_status: 'success',
          created_at: {
            [Op.gte]: periodStart,
            [Op.lt]: periodEnd,
          },
        },
        attributes: ['amount'],
        transaction: t,
      });

      const grossEarning = donations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
      const platformCommission = Math.max(0, grossEarning - creatorNetEarning);

      // Total Available Amount = Creator Net Earning for month + Carried Forward Balance
      const availableAmount = creatorNetEarning + previousCarriedBalance;
      const initialWithdrawnAmount = 0;
      const initialRemainingAmount = availableAmount;

      const settlementRef = `SETTLEMENT-${settlementMonth}-CREATOR-${creator.id}`;

      // 5. Update Wallet available_balance to availableAmount
      const balBeforeAvailable = parseFloat(wallet.available_balance || 0);
      await wallet.update({
        available_balance: availableAmount,
      }, { transaction: t });

      // Ledger Entry for Settlement Execution
      await WalletTransaction.create({
        wallet_id: wallet.id,
        creator_id: creator.id,
        transaction_type: 'adjustment',
        direction: 'credit',
        amount: creatorNetEarning,
        balance_before: balBeforeAvailable,
        balance_after: availableAmount,
        description: `Settlement ${settlementMonth} (Earnings ${earningMonth}: ₹${creatorNetEarning.toFixed(2)} + Carried Bal: ₹${previousCarriedBalance.toFixed(2)} = Available: ₹${availableAmount.toFixed(2)})`,
        reference: settlementRef,
      }, { transaction: t });

      // 6. Create Settlement Record with Carried Balance and Single-Withdrawal Flag
      const settlementRecord = await WalletSettlement.create({
        creator_id: creator.id,
        wallet_id: wallet.id,
        earning_month: earningMonth,
        settlement_month: settlementMonth,
        period_start: periodStart,
        period_end: periodEnd,
        gross_amount: grossEarning,
        total_earning: grossEarning,
        commission_amount: platformCommission,
        platform_commission: platformCommission,
        net_amount: creatorNetEarning,
        creator_net_amount: creatorNetEarning,
        previous_carried_balance: previousCarriedBalance,
        available_amount: availableAmount,
        withdrawn_amount: initialWithdrawnAmount,
        remaining_amount: initialRemainingAmount,
        has_withdrawn: false,
        status: 'available',
        settlement_status: 'available',
        settled_at: new Date(),
        reference: settlementRef,
      }, { transaction: t });

      await t.commit();

      settledCount++;
      totalSettledAmount += availableAmount;

      results.push({
        creatorId: creator.id,
        creatorName: creator.full_name,
        earningMonth,
        settlementMonth,
        status: 'settled',
        grossEarning,
        platformCommission,
        creatorNetEarning,
        previousCarriedBalance,
        availableAmount,
        withdrawnAmount: 0,
        remainingAmount: availableAmount,
        hasWithdrawn: false,
        settledAt: settlementRecord.settled_at,
      });

    } catch (err) {
      if (t && !t.finished) await t.rollback();
      results.push({
        creatorId: creator.id,
        creatorName: creator.full_name,
        month: settlementMonth,
        status: 'error',
        error: err.message,
      });
    }
  }

  return {
    status: 'success',
    month: settlementMonth,
    earningMonth,
    totalCreators: creators.length,
    settledCount,
    alreadySettledCount,
    totalSettledAmount,
    settlements: results,
  };
};

module.exports = {
  settleMonthService,
  getMonthDateRange,
};
