const { Notification } = require('../../models');
const { Op } = require('sequelize');

const ADMIN_NOTIFICATION_TYPES = [
  'creator_registration',
  'creator_reg',
  'kyc',
  'kyc_request',
  'kyc_submission',
  'payout',
  'withdrawal_request',
  'withdrawal',
  'security'
];

class NotificationRepository {
  async findAll({ limit = 50, offset = 0 } = {}) {
    return await Notification.findAll({
      where: {
        type: {
          [Op.in]: ADMIN_NOTIFICATION_TYPES,
        },
      },
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
  }

  async createNotification(notificationData, { transaction } = {}) {
    return await Notification.create(notificationData, { transaction });
  }

  async markAllAsRead() {
    return await Notification.update(
      { is_read: true },
      {
        where: {
          is_read: false,
          type: {
            [Op.in]: ADMIN_NOTIFICATION_TYPES,
          },
        },
      }
    );
  }

  async markSingleAsRead(id) {
    return await Notification.update(
      { is_read: true },
      { where: { id } }
    );
  }
}

module.exports = new NotificationRepository();

