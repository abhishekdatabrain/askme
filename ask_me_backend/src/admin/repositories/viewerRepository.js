const { User, Donation, VipMembership, Creator } = require('../../models');
const { Op } = require('sequelize');

class ViewerRepository {
  async findAndCountAllViewers({ where = {}, limit = 10, offset = 0, order = [['id', 'DESC']] }) {
    // Include user/viewer role condition if not explicitly provided
    const userWhere = { ...where };
    if (!userWhere.role) {
      userWhere.role = { [Op.in]: ['user', 'viewer'] };
    }

    return await User.findAndCountAll({
      where: userWhere,
      limit,
      offset,
      order,
      attributes: ['id', 'name', 'email', 'role', 'created_at', 'updated_at'],
      include: [
        {
          model: Donation,
          as: 'donations',
          attributes: ['id', 'amount', 'payment_status', 'created_at'],
          required: false,
        },
        {
          model: VipMembership,
          as: 'vipMemberships',
          attributes: ['id', 'status'],
          required: false,
        },
      ],
      distinct: true,
    });
  }

  async findById(id) {
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role', 'created_at', 'updated_at'],
    });

    if (!user) return null;

    const userObj = typeof user.toJSON === 'function' ? user.toJSON() : user;

    // Fetch donations matching viewer_id OR viewer_email
    const donationWhere = {
      [Op.or]: [
        { viewer_id: user.id },
        { viewer_email: (user.email || '').toLowerCase() },
      ],
    };

    const donations = await Donation.findAll({
      where: donationWhere,
      attributes: ['id', 'donation_uuid', 'session_id', 'creator_id', 'amount', 'currency', 'message', 'payment_status', 'paid_at', 'is_vip', 'created_at'],
      include: [
        {
          model: Creator,
          as: 'creator',
          attributes: ['id', 'full_name', 'username', 'profile_image'],
          required: false,
        },
      ],
      order: [['id', 'DESC']],
    });

    const vipMemberships = await VipMembership.findAll({
      where: { viewer_id: user.id },
      attributes: ['id', 'creator_id', 'plan_name', 'amount', 'status', 'transaction_id', 'next_billing_date', 'created_at'],
      include: [
        {
          model: Creator,
          as: 'creator',
          attributes: ['id', 'full_name', 'username', 'profile_image'],
          required: false,
        },
      ],
      order: [['id', 'DESC']],
    });

    return {
      ...userObj,
      donations: donations || [],
      vipMemberships: vipMemberships || [],
    };
  }

  async updateRoleOrStatus(id, newRole) {
    return await User.update({ role: newRole }, { where: { id } });
  }

  async count(where = {}) {
    const userWhere = { ...where };
    if (!userWhere.role) {
      userWhere.role = { [Op.in]: ['user', 'viewer'] };
    }
    return await User.count({ where: userWhere });
  }
}

module.exports = new ViewerRepository();
