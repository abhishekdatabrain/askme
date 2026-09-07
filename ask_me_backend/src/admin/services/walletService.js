const sequelize = require('../../config/database');
const walletRepository = require('../repositories/walletRepository');
const creatorRepository = require('../repositories/creatorRepository');
const paymentRepository = require('../repositories/paymentRepository');
const commissionService = require('./commissionService');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { addMoney, subtractMoney, calculateCommission, calculateCreatorShare, normalizeMoney } = require('../../utils/money');
const { NotFoundError, ValidationError } = require('../../errors/AppError');
const { WALLET_TRANSACTION_TYPE } = require('../../constants');
const { Op } = require('sequelize');

class WalletService {
  async getCreatorWallets(query) {
    const { page, limit, offset } = parsePagination(query);
    const { search } = query;

    const where = {};
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { '$creator.full_name$': { [Op.iLike]: q } },
        { '$creator.username$': { [Op.iLike]: q } },
        { '$creator.email$': { [Op.iLike]: q } },
      ];
    }

    const { count, rows } = await walletRepository.findAndCountAllWallets({
      where,
      limit,
      offset,
      order: [['id', 'DESC']],
    });

    const commissionConfig = await commissionService.getCommissionSettings();
    const commPercent = parseFloat(commissionConfig.platformCommissionPercent || 15);

    const wallets = await Promise.all(
      rows.map(async (w) => {
        const creator = w.creator || {};
        const creatorId = creator.id || w.creator_id;
        let gross = parseFloat(w.total_earnings || 0);
        const available = parseFloat(w.available_balance || 0);
        const withdrawn = parseFloat(w.withdrawn_amount || 0);

        // If total_earnings is 0, check if there are actual successful donations for THIS specific creator
        if (gross === 0 && creatorId) {
          try {
            const { Donation } = require('../../models');
            const creatorDonations = (await Donation.sum('amount', {
              where: { creator_id: creatorId, payment_status: 'success' }
            })) || 0;
            gross = parseFloat(creatorDonations);
          } catch (err) {
            gross = 0;
          }
        }

        const platformCut = calculateCommission(gross, commPercent);
        const creatorNet = calculateCreatorShare(gross, commPercent);
        const cleanUsername = String(creator.username || `creator_${creatorId}`).replace(/^@+/, '');
        const pending = parseFloat(w.pending_balance || 0);

        return {
          creatorId,
          creatorName: creator.full_name || `Creator #${creatorId}`,
          handle: `@${cleanUsername}`,
          email: creator.email || 'N/A',
          grossEarnings: gross,
          platformCommission: platformCut,
          netCreatorShare: creatorNet,
          withdrawnTotal: withdrawn,
          withdrawnAmount: withdrawn,
          availableBalance: available,
          pendingBalance: pending,
          settlementStatus: String(creator.kyc_status || '').toLowerCase() === 'approved' ? 'Settled' : '',
        };
      })
    );

    const pagination = buildPaginationMeta(count, page, limit);

    return {
      wallets,
      pagination,
      total: wallets.length,
      totalCount: count,
    };
  }

  async getCommissionLedger(query) {
    const { page, limit, offset } = parsePagination(query);

    const { count, rows } = await paymentRepository.findAndCountAllPayments({
      where: { payment_status: 'success' },
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    const commissionConfig = await commissionService.getCommissionSettings();
    const commPercent = parseFloat(commissionConfig.platformCommissionPercent || 15);

    const ledger = rows.map((d) => {
      const creator = d.creator || {};
      const gross = parseFloat(d.amount || 0);
      const platformCut = calculateCommission(gross, commPercent);
      const creatorNet = calculateCreatorShare(gross, commPercent);

      return {
        transactionId: d.donation_uuid || `TXN-${d.id}`,
        rawId: d.id,
        creator: creator.full_name || creator.email || `Creator #${d.creator_id}`,
        viewerName: d.anonymous ? 'Anonymous Supporter' : (d.viewer_name || 'Anonymous Supporter'),
        amount: gross,
        platformCut15: platformCut,
        creatorNet85: creatorNet,
        timestamp: d.paid_at || d.created_at,
        status: d.payment_status === 'success' ? 'Successful' : 'Successful',
      };
    });

    return { ledger, pagination: buildPaginationMeta(count, page, limit) };
  }

  async adjustWalletBalance(creatorId, body, adminId, req) {
    const { type = 'credit', amount, reason, availableBalance, bonusCredit } = body;

    const creator = await creatorRepository.findById(creatorId);
    if (!creator) {
      throw new NotFoundError('Creator not found for wallet adjustment');
    }

    let updatedWallet = null;

    await sequelize.transaction(async (transaction) => {
      const wallet = await walletRepository.findByCreatorId(creatorId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const balanceBefore = parseFloat(wallet.available_balance || 0);
      let adjustmentAmount = 0;

      if (amount !== undefined && amount !== null && !isNaN(parseFloat(amount))) {
        adjustmentAmount = normalizeMoney(amount);
      } else if (availableBalance !== undefined || bonusCredit !== undefined) {
        const targetAvailable = parseFloat(availableBalance || 0);
        const targetBonus = parseFloat(bonusCredit || 0);
        adjustmentAmount = normalizeMoney(targetAvailable + targetBonus - balanceBefore);
      }

      if (type === 'debit' && adjustmentAmount > 0) {
        adjustmentAmount = -adjustmentAmount;
      }

      const balanceAfter = balanceBefore + adjustmentAmount;

      if (balanceAfter < 0) {
        throw new ValidationError('Wallet adjustment result cannot be negative balance');
      }

      const newTotalEarnings = wallet.total_earnings < balanceAfter ? balanceAfter : wallet.total_earnings;

      await wallet.update(
        {
          available_balance: balanceAfter,
          total_earnings: newTotalEarnings,
        },
        { transaction }
      );

      const reference = `ADJUST-${creatorId}-${Date.now()}`;
      await walletRepository.createLedgerTransaction(
        {
          wallet_id: wallet.id,
          creator_id: creatorId,
          transaction_type: WALLET_TRANSACTION_TYPE.ADJUSTMENT,
          direction: adjustmentAmount >= 0 ? 'credit' : 'debit',
          amount: Math.abs(adjustmentAmount),
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          description: reason || `Wallet adjustment by Admin #${adminId || 'System'}`,
          reference,
        },
        { transaction }
      );

      updatedWallet = wallet.toJSON();
    });

    return {
      message: `Wallet balance for creator #${creatorId} updated to ₹${parseFloat(updatedWallet.available_balance).toFixed(2)}`,
      wallet: updatedWallet,
    };
  }
}

module.exports = new WalletService();
