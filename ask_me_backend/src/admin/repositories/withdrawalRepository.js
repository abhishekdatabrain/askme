const { WithdrawalRequest, Creator, CreatorBankAccount, Wallet } = require('../../models');

class WithdrawalRepository {
  async findAndCountAllWithdrawals({ where = {}, limit = 10, offset = 0, order = [['id', 'DESC']] }) {
    return await WithdrawalRequest.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: [
        {
          model: Creator,
          as: 'creator',
          attributes: ['id', 'full_name', 'email', 'username'],
          required: false,
        },
        {
          model: CreatorBankAccount,
          as: 'bankAccount',
          required: false,
        },
        {
          model: Wallet,
          as: 'wallet',
          required: false,
        },
      ],
      distinct: true,
    });
  }

  async findById(id, { transaction, lock } = {}) {
    const isNum = !isNaN(id) && Number.isInteger(Number(id));
    const whereClause = isNum ? { id: Number(id) } : { withdrawal_uuid: id };

    // PostgreSQL does NOT allow FOR UPDATE (lock) on queries containing outer joins (include required: false)
    if (lock) {
      const withdrawal = await WithdrawalRequest.findOne({
        where: whereClause,
        transaction,
        lock,
      });

      if (withdrawal) {
        const [creator, bankAccount, wallet] = await Promise.all([
          Creator.findByPk(withdrawal.creator_id, { transaction }),
          withdrawal.bank_account_id ? CreatorBankAccount.findByPk(withdrawal.bank_account_id, { transaction }) : null,
          Wallet.findOne({ where: { creator_id: withdrawal.creator_id }, transaction }),
        ]);

        withdrawal.setDataValue('creator', creator);
        withdrawal.setDataValue('bankAccount', bankAccount);
        withdrawal.setDataValue('wallet', wallet);
      }

      return withdrawal;
    }

    return await WithdrawalRequest.findOne({
      where: whereClause,
      include: [
        { model: Creator, as: 'creator', required: false },
        { model: CreatorBankAccount, as: 'bankAccount', required: false },
        { model: Wallet, as: 'wallet', required: false },
      ],
      transaction,
    });
  }

  async updateWithdrawal(withdrawalInstance, updateData, { transaction } = {}) {
    return await withdrawalInstance.update(updateData, { transaction });
  }

  async countPending() {
    return await WithdrawalRequest.count({ where: { status: 'pending' } });
  }

  async sumPendingAmount() {
    return (await WithdrawalRequest.sum('amount', { where: { status: 'pending' } })) || 0;
  }

  async sumApprovedAmount() {
    return (
      (await WithdrawalRequest.sum('amount', {
        where: { status: ['approved', 'completed', 'paid', 'processing'] },
      })) || 0
    );
  }
}

module.exports = new WithdrawalRepository();
