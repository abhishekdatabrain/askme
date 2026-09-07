const sequelize = require('../../config/database');
const withdrawalRepository = require('../repositories/withdrawalRepository');
const walletRepository = require('../repositories/walletRepository');
const notificationService = require('./notificationService');
const { validateWithdrawalTransition } = require('../../utils/status');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { NotFoundError, ValidationError, ConflictError } = require('../../errors/AppError');
const { WITHDRAWAL_STATUS, WALLET_TRANSACTION_TYPE } = require('../../constants');
const { Op } = require('sequelize');

class WithdrawalService {
  async getWithdrawals(query) {
    const { page, limit, offset } = parsePagination(query);
    const { status, search } = query;

    const where = {};
    if (status && status.toLowerCase() !== 'all' && status.toLowerCase() !== 'withdrawals_all') {
      const s = status.toLowerCase();
      if (s === 'pending' || s === 'withdrawals_pending') where.status = 'pending';
      else if (s === 'approved' || s === 'withdrawals_approved') where.status = 'approved';
      else if (s === 'processing' || s === 'withdrawals_processing') where.status = 'processing';
      else if (s === 'completed' || s === 'withdrawals_completed' || s === 'paid') where.status = 'completed';
      else if (s === 'rejected' || s === 'withdrawals_rejected') where.status = 'rejected';
      else where.status = s;
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { '$creator.full_name$': { [Op.iLike]: q } },
        { '$creator.email$': { [Op.iLike]: q } },
        { transaction_reference: { [Op.iLike]: q } },
      ];
    }

    const { count, rows } = await withdrawalRepository.findAndCountAllWithdrawals({
      where,
      limit,
      offset,
      order: [['id', 'DESC']],
    });

    const withdrawalsList = rows.map((w) => {
      const creator = w.creator || {};
      const bank = w.bankAccount || {};
      const gross = parseFloat(w.amount || 0);

      let bankAccountStr = w.rejection_reason && (w.status === 'pending' || w.status === 'approved' || w.status === 'processing')
        ? w.rejection_reason
        : 'Bank Transfer Requested';

      if (bank.id) {
        bankAccountStr = bank.upi_id
          ? `UPI ID: ${bank.upi_id} (${bank.account_holder_name || ''})`
          : `${bank.bank_name || 'Bank'} A/C: ****${(bank.account_number || '').slice(-4)} (IFSC: ${bank.ifsc_code || 'N/A'}) - ${bank.account_holder_name || ''}`;
      }

      return {
        id: w.withdrawal_uuid || `WTH-${w.id}`,
        rawId: w.id,
        creatorId: w.creator_id,
        creator: creator.full_name || creator.email || `Creator #${w.creator_id}`,
        creatorEmail: creator.email || '',
        amount: gross,
        grossRevenue: `₹${gross.toLocaleString('en-IN')}`,
        payoutAmount: `₹${gross.toLocaleString('en-IN')}`,
        platformCut: `₹0`,
        bankDetails: bankAccountStr,
        status: (w.status || 'pending').toLowerCase(),
        requestedDate: w.requested_at || w.created_at,
        approvedAt: w.approved_at,
        completedAt: w.completed_at,
        transactionReference: w.transaction_reference || null,
        rejectionReason: w.status === 'rejected' ? w.rejection_reason : null,
      };
    });

    const pagination = buildPaginationMeta(count, page, limit);

    return {
      withdrawals: withdrawalsList,
      requests: withdrawalsList,
      pagination,
      total: withdrawalsList.length,
      totalCount: count,
    };
  }

  async updateWithdrawalStatus(id, body, adminId, req) {
    const { status, rejectionReason, transactionReference } = body;
    let postCommitNotif = null;
    let updatedWithdrawalResult = null;

    await sequelize.transaction(async (transaction) => {
      const withdrawal = await withdrawalRepository.findById(id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!withdrawal) {
        throw new NotFoundError('Withdrawal request not found');
      }

      const previousStatus = (withdrawal.status || 'pending').toLowerCase();
      const normalizedStatus = validateWithdrawalTransition(previousStatus, status);

      // Idempotency: If transition is a no-op (e.g. already completed or already rejected)
      if (previousStatus === normalizedStatus) {
        updatedWithdrawalResult = withdrawal;
        return;
      }

      const amount = parseFloat(withdrawal.amount || 0);
      const creatorId = withdrawal.creator_id;

      const wallet = await walletRepository.findByCreatorId(creatorId, { transaction, lock: transaction.LOCK.UPDATE });
      if (!wallet) {
        throw new NotFoundError('Creator wallet not found');
      }

      const updateData = {
        status: normalizedStatus,
      };

      if (adminId) {
        updateData.admin_id = adminId;
      }

      if (normalizedStatus === WITHDRAWAL_STATUS.APPROVED) {
        updateData.approved_at = new Date();

        postCommitNotif = {
          creatorId,
          type: 'withdrawal_approved',
          title: 'Payout Withdrawal Approved! ✅',
          message: `Your payout withdrawal request for ₹${amount.toFixed(2)} has been approved.`,
        };

      } else if (normalizedStatus === WITHDRAWAL_STATUS.PROCESSING) {
        postCommitNotif = {
          creatorId,
          type: 'withdrawal_processing',
          title: 'Payout Withdrawal Processing ⏳',
          message: `Your payout withdrawal request for ₹${amount.toFixed(2)} is now being processed by payout banking gateways.`,
        };

      } else if (normalizedStatus === WITHDRAWAL_STATUS.COMPLETED) {
        // Only increment withdrawn_amount once upon transition to COMPLETED
        if (previousStatus !== WITHDRAWAL_STATUS.COMPLETED) {
          const currentWithdrawn = parseFloat(wallet.withdrawn_amount || 0);
          const newWithdrawn = currentWithdrawn + amount;

          await wallet.update({
            withdrawn_amount: newWithdrawn,
          }, { transaction });

          const ref = transactionReference || withdrawal.transaction_reference || `PAYOUT-SETTLED-${withdrawal.id}`;

          const availableBal = parseFloat(wallet.available_balance || 0);

          await walletRepository.createLedgerTransaction({
            wallet_id: wallet.id,
            creator_id: creatorId,
            withdrawal_id: withdrawal.id,
            transaction_type: WALLET_TRANSACTION_TYPE.WITHDRAWAL,
            direction: 'debit',
            amount,
            balance_before: availableBal,
            balance_after: availableBal,
            description: `Payout Completed & Transferred to Bank Account (Ref: ${ref})`,
            reference: ref,
          }, { transaction });
        }

        updateData.completed_at = new Date();
        updateData.transaction_reference = transactionReference || withdrawal.transaction_reference || `TXN-PAYOUT-${withdrawal.id}`;

        postCommitNotif = {
          creatorId,
          type: 'withdrawal_approved',
          title: 'Payout Settled & Completed! 💰',
          message: `Your payout withdrawal request for ₹${amount.toFixed(2)} has been completed & transferred.`,
        };

      } else if (normalizedStatus === WITHDRAWAL_STATUS.REJECTED || normalizedStatus === 'cancelled') {
        // Only refund available_balance once upon transition to REJECTED
        if (previousStatus !== WITHDRAWAL_STATUS.REJECTED && previousStatus !== 'cancelled') {
          if (previousStatus === WITHDRAWAL_STATUS.COMPLETED) {
            throw new ConflictError('Cannot reject an already completed/paid withdrawal request.');
          }

          const currentAvailable = parseFloat(wallet.available_balance || 0);
          const newAvailable = currentAvailable + amount;

          await wallet.update({
            available_balance: newAvailable,
          }, { transaction });

          // Reset WalletSettlement tracking so creator can re-attempt withdrawal if rejected
          if (withdrawal.settlement_id || withdrawal.settlement_month) {
            const { WalletSettlement } = require('../../models');
            const settlWhere = withdrawal.settlement_id
              ? { id: withdrawal.settlement_id }
              : { creator_id: creatorId, settlement_month: withdrawal.settlement_month };

            const settlRec = await WalletSettlement.findOne({ where: settlWhere, transaction, lock: transaction.LOCK.UPDATE });
            if (settlRec) {
              const curW = parseFloat(settlRec.withdrawn_amount || 0);
              const newW = Math.max(0, curW - amount);
              const availA = parseFloat(settlRec.available_amount || newAvailable);
              const newRem = Math.min(availA, parseFloat(settlRec.remaining_amount || 0) + amount);

              await settlRec.update({
                withdrawn_amount: newW,
                remaining_amount: newRem,
                has_withdrawn: false,
              }, { transaction });
            }
          }

          await walletRepository.createLedgerTransaction({
            wallet_id: wallet.id,
            creator_id: creatorId,
            withdrawal_id: withdrawal.id,
            transaction_type: WALLET_TRANSACTION_TYPE.REFUND,
            direction: 'credit',
            amount,
            balance_before: currentAvailable,
            balance_after: newAvailable,
            description: `Withdrawal Request Rejected (Amount Refunded to Available Balance & Settlement Cycle Reset)`,
            reference: `REFUND-WTH-${withdrawal.id}`,
          }, { transaction });
        }

        updateData.rejection_reason = rejectionReason || body.reason || 'Detail mismatch';

        postCommitNotif = {
          creatorId,
          type: 'withdrawal_rejected',
          title: 'Payout Withdrawal Rejected ❌',
          message: `Your payout withdrawal request for ₹${amount.toFixed(2)} was rejected. Reason: ${updateData.rejection_reason}`,
        };
      }

      await withdrawalRepository.updateWithdrawal(withdrawal, updateData, { transaction });
      updatedWithdrawalResult = withdrawal;
    });

    if (postCommitNotif) {
      await notificationService.createNotification(postCommitNotif).catch(() => { });
    }

    return {
      id: updatedWithdrawalResult.withdrawal_uuid || `WTH-${updatedWithdrawalResult.id}`,
      status: updatedWithdrawalResult.status,
      completedAt: updatedWithdrawalResult.completed_at,
      approvedAt: updatedWithdrawalResult.approved_at,
    };
  }
}

module.exports = new WithdrawalService();
