const { DonationSession, Creator } = require('../../models');

class DonationSessionRepository {
  async findAndCountAllSessions({ where = {}, limit = 10, offset = 0, order = [['created_at', 'DESC']] }) {
    return await DonationSession.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: [
        {
          model: Creator,
          as: 'creator',
          attributes: ['id', 'full_name', 'username', 'email'],
          required: false,
        },
      ],
      distinct: true,
    });
  }

  async findById(id) {
    const cleanId = String(id).replace(/^SESS-|^SES-/, '');
    return await DonationSession.findByPk(cleanId);
  }

  async countActiveStreamers() {
    return await DonationSession.count({ where: { status: 'active' } });
  }
}

module.exports = new DonationSessionRepository();
