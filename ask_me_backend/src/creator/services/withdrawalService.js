const sequelize = require("../../config/database");
const { Wallet, WithdrawalRequest, WalletTransaction, Creator, CreatorBankAccount, KycVerification, WalletSettlement } = require("../../models");
const { parsePagination, buildPaginationMeta } = require("../../utils/pagination");
const { Op } = require("sequelize");

/**
 * Submit Payout Withdrawal Request (Creator Module)
 * Enforces KYC validation, available balance check, 1 withdrawal per settlement cycle, row locking, and debit.
 */
const requestWithdrawalService = async (creatorId, data) => {
  if (!creatorId) {
    const err = new Error("Creator ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const { amount, bankAccountId, bankAccountInfo, bankName, accountNumber } = data;
  const parsedAmount = parseFloat(amount || 0);

  const minLimit = 500;
  if (isNaN(parsedAmount) || parsedAmount < minLimit) {
    const err = new Error(`Minimum withdrawal limit is ₹${minLimit}.00.`);
    err.statusCode = 400;
    throw err;
  }

  // 1. Verify Creator exists and is active
  const creator = await Creator.findByPk(creatorId);
  if (!creator) {
    const err = new Error("Creator account not found.");
    err.statusCode = 404;
    throw err;
  }

  if (creator.status === "blocked" || creator.status === "suspended") {
    const err = new Error("Account is restricted from requesting payouts.");
    err.statusCode = 403;
    throw err;
  }

  // 2. Verify KYC Verification Status
  const kyc = await KycVerification.findOne({ where: { creator_id: creatorId } });
  const kycStatus = String(kyc?.status || creator.kyc_status || 'pending').toLowerCase();
  if (kycStatus !== 'approved' && kycStatus !== 'verified') {
    const err = new Error("KYC verification is required before requesting payout withdrawals.");
    err.statusCode = 400;
    throw err;
  }

  // 3. Verify Bank Account Details
  let targetBankAccountId = bankAccountId || null;
  let bankSummary = bankAccountInfo || (bankName ? `${bankName} (A/C: ****${(accountNumber || "").slice(-4)})` : null);

  if (targetBankAccountId) {
    const bankAccount = await CreatorBankAccount.findOne({
      where: { id: targetBankAccountId, creator_id: creatorId },
    });
    if (bankAccount) {
      bankSummary = bankAccount.upi_id
        ? `UPI: ${bankAccount.upi_id}`
        : `${bankAccount.bank_name || 'Bank'} A/C: ****${(bankAccount.account_number || '').slice(-4)}`;
    }
  } else {
    const defaultBank = await CreatorBankAccount.findOne({
      where: { creator_id: creatorId, is_primary: true },
    });
    if (defaultBank) {
      targetBankAccountId = defaultBank.id;
      bankSummary = defaultBank.upi_id
        ? `UPI: ${defaultBank.upi_id}`
        : `${defaultBank.bank_name || 'Bank'} A/C: ****${(defaultBank.account_number || '').slice(-4)}`;
    }
  }

  // 4. Locate Settlement Record & Enforce 1 Withdrawal Per Settlement Cycle Rule
  const now = new Date();
  const currentSettlementMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

  let settlement = await WalletSettlement.findOne({
    where: {
      creator_id: creatorId,
      settlement_month: currentSettlementMonth,
    },
  });

  if (!settlement) {
    // If no settlement record for current month yet, check most recent settlement
    settlement = await WalletSettlement.findOne({
      where: { creator_id: creatorId },
      order: [['settlement_month', 'DESC']],
    });
  }

  const targetSettlementMonth = settlement ? settlement.settlement_month : currentSettlementMonth;

  if (settlement) {
    const existingWithdrawalInCycle = await WithdrawalRequest.findOne({
      where: {
        creator_id: creatorId,
        settlement_month: targetSettlementMonth,
        status: { [Op.in]: ['pending', 'approved', 'processing', 'completed'] },
      },
    });

    if (settlement.has_withdrawn || existingWithdrawalInCycle) {
      const err = new Error("Withdrawal already processed for this settlement cycle.");
      err.statusCode = 400;
      throw err;
    }
  }

  // 5. Database Transaction for Atomic Execution
  const transaction = await sequelize.transaction();

  try {
    const [wallet] = await Wallet.findOrCreate({
      where: { creator_id: creatorId },
      defaults: {
        creator_id: creatorId,
        total_earnings: 0,
        available_balance: 0,
        pending_balance: 0,
        withdrawn_amount: 0,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const availableBal = parseFloat(wallet.available_balance || 0);
    if (availableBal < parsedAmount) {
      const err = new Error(`Insufficient available balance. Available: ₹${availableBal.toFixed(2)}, Requested: ₹${parsedAmount.toFixed(2)}`);
      err.statusCode = 400;
      throw err;
    }

    // Debit available_balance upon withdrawal creation
    const newAvailable = availableBal - parsedAmount;
    await wallet.update(
      { available_balance: newAvailable },
      { transaction }
    );

    // Update WalletSettlement cycle tracking
    if (settlement) {
      const settlRec = await WalletSettlement.findByPk(settlement.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (settlRec) {
        const curWithdrawn = parseFloat(settlRec.withdrawn_amount || 0);
        const newWithdrawn = curWithdrawn + parsedAmount;
        const availAmt = parseFloat(settlRec.available_amount || availableBal);
        const newRemaining = Math.max(0, availAmt - newWithdrawn);

        await settlRec.update({
          withdrawn_amount: newWithdrawn,
          remaining_amount: newRemaining,
          has_withdrawn: true,
        }, { transaction });
      }
    }

    const finalBankDetails = bankSummary || "Bank Transfer Requested";

    const withdrawalRecord = await WithdrawalRequest.create(
      {
        creator_id: creatorId,
        wallet_id: wallet.id,
        settlement_id: settlement ? settlement.id : null,
        settlement_month: targetSettlementMonth,
        bank_account_id: targetBankAccountId,
        amount: parsedAmount,
        net_amount: parsedAmount,
        status: "pending",
        rejection_reason: finalBankDetails,
        requested_at: new Date(),
      },
      { transaction }
    );

    await WalletTransaction.create(
      {
        wallet_id: wallet.id,
        creator_id: creatorId,
        withdrawal_id: withdrawalRecord.id,
        transaction_type: "withdrawal",
        direction: "debit",
        amount: parsedAmount,
        balance_before: availableBal,
        balance_after: newAvailable,
        description: `Payout Withdrawal Request (Cycle ${targetSettlementMonth})`,
        reference: withdrawalRecord.withdrawal_uuid,
      },
      { transaction }
    );

    await transaction.commit();

    try {
      const adminNotificationService = require("../../admin/services/notificationService");
      const creatorName = creator.name || creator.email || `Creator #${creatorId}`;
      await adminNotificationService.createNotification({
        creatorId,
        type: "payout",
        title: "New Withdrawal Request",
        message: `${creatorName} requested a payout withdrawal of ₹${parsedAmount.toLocaleString()}.`,
      });
    } catch (notifErr) {
      console.warn("Notice: Withdrawal admin notification bypassed:", notifErr.message);
    }

    return {
      withdrawalId: withdrawalRecord.withdrawal_uuid,
      rawId: withdrawalRecord.id,
      settlementMonth: targetSettlementMonth,
      amount: parsedAmount,
      bankDetails: finalBankDetails,
      status: "pending",
      requestedAt: withdrawalRecord.requested_at,
    };
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
};

/**
 * Get Creator Withdrawal Requests History
 */
const getCreatorWithdrawalsService = async (creatorId, queryParams = {}) => {
  if (!creatorId) {
    const err = new Error("Creator ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const { search, status } = queryParams;
  const { page, limit, offset } = parsePagination(queryParams);

  const whereCondition = { creator_id: creatorId };

  if (status && status !== "All" && status !== "all") {
    whereCondition.status = status.toLowerCase();
  }

  if (search && String(search).trim()) {
    const rawSearch = String(search).trim();
    const searchTerm = `%${rawSearch}%`;
    const orConditions = [
      { rejection_reason: { [Op.iLike]: searchTerm } },
      { transaction_reference: { [Op.iLike]: searchTerm } },
      { status: { [Op.iLike]: searchTerm } },
      sequelize.where(
        sequelize.cast(sequelize.col("withdrawal_requests.withdrawal_uuid"), "TEXT"),
        { [Op.iLike]: searchTerm }
      ),
    ];

    if (/^\d+$/.test(rawSearch)) {
      orConditions.push({ id: rawSearch });
    }

    whereCondition[Op.or] = orConditions;
  }

  const { count, rows: records } = await WithdrawalRequest.findAndCountAll({
    where: whereCondition,
    order: [["id", "DESC"]],
    limit,
    offset,
  });

  const withdrawals = records.map((w) => ({
    id: w.withdrawal_uuid || `WTH-${w.id}`,
    rawId: w.id,
    settlementMonth: w.settlement_month || 'Current',
    amount: parseFloat(w.amount || 0),
    netAmount: parseFloat(w.net_amount || w.amount || 0),
    bankDetails: w.rejection_reason && ["pending", "approved", "processing"].includes(w.status)
      ? w.rejection_reason
      : "Bank Account / UPI Settlement",
    status: (w.status || "pending").toLowerCase(),
    requestedDate: w.requested_at || w.createdAt,
    approvedAt: w.approved_at,
    completedAt: w.completed_at,
    transactionReference: w.transaction_reference || null,
    rejectionReason: w.status === "rejected" ? w.rejection_reason : null,
  }));

  const pagination = buildPaginationMeta(count, page, limit);

  return {
    withdrawals,
    pagination,
  };
};

module.exports = {
  requestWithdrawalService,
  getCreatorWithdrawalsService,
};
