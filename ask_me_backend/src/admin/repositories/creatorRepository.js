const { Creator, CreatorProfile, CreatorSocialLink, Wallet } = require('../../models');

class CreatorRepository {
  async findAndCountAllCreators({ where = {}, limit = 10, offset = 0, order = [['id', 'DESC']] }) {
    return await Creator.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: [
        {
          model: CreatorProfile,
          as: 'profile',
          attributes: ['id', 'kyc_status', 'bio', 'is_payment_enabled', 'streaming_platform'],
          required: false,
        },
        {
          model: Wallet,
          as: 'wallet',
          attributes: ['id', 'total_earnings', 'available_balance', 'pending_balance', 'withdrawn_amount'],
          required: false,
        },
        {
          model: CreatorSocialLink,
          as: 'socialLinks',
          attributes: ['id', 'platform', 'profile_url'],
          required: false,
        },
      ],
      distinct: true,
    });
  }

  async findById(id, { transaction } = {}) {
    return await Creator.findByPk(id, {
      include: [
        { model: CreatorProfile, as: 'profile', required: false },
        { model: Wallet, as: 'wallet', required: false },
        { model: CreatorSocialLink, as: 'socialLinks', required: false },
      ],
      transaction,
    });
  }

  async updateStatus(id, status, { transaction } = {}) {
    return await Creator.update({ status }, { where: { id }, transaction });
  }

  async count(where = {}) {
    return await Creator.count({ where });
  }
}

module.exports = new CreatorRepository();
