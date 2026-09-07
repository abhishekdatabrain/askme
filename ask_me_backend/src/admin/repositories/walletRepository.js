const { Wallet, WalletTransaction, Creator } = require('../../models');

class WalletRepository {
  async findAndCountAllWallets({ where = {}, limit = 10, offset = 0, order = [['id', 'DESC']] }) {
    return await Wallet.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: [
        {
          model: Creator,
          as: 'creator',
          attributes: ['id', 'full_name', 'username', 'email', 'status'],
          required: false,
        },
      ],
    });
  }

  async findByCreatorId(creatorId, { transaction, lock } = {}) {
    let wallet = await Wallet.findOne({
      where: { creator_id: creatorId },
      transaction,
      lock,
    });

    if (!wallet && transaction) {
      wallet = await Wallet.create(
        {
          creator_id: creatorId,
          total_earnings: 0,
          available_balance: 0,
          pending_balance: 0,
          withdrawn_amount: 0,
        },
        { transaction }
      );
    }
    return wallet;
  }

  async createLedgerTransaction(transactionData, { transaction } = {}) {
    try {
      return await WalletTransaction.create(
        transactionData,
        { transaction }
      );
    } catch (error) {
      console.error("========== WALLET TRANSACTION ERROR ==========");
      console.error("Message:", error.message);
      console.error("Name:", error.name);
      console.error("Parent Message:", error.parent?.message);
      console.error("Detail:", error.parent?.detail);
      console.error("Code:", error.parent?.code);
      console.error("SQL:", error.sql);
      console.error("Data:", transactionData);
      console.error("==============================================");

      throw error;
    }
  }

  async findLedgerTransaction({ where }) {
    return await WalletTransaction.findOne({ where });
  }

  async sumTotalEarnings() {
    return (await Wallet.sum('total_earnings')) || 0;
  }
}

module.exports = new WalletRepository();
