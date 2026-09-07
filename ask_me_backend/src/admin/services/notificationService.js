const notificationRepository = require('../repositories/notificationRepository');
const { getIO } = require('../../config/socket');

class NotificationService {
  async getAdminNotifications() {
    const dbNotifs = await notificationRepository.findAll({ limit: 50 });

    const notifications = dbNotifs.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
      isRead: Boolean(n.is_read),
      status: n.is_read ? 'read' : 'unread',
      type: n.type || 'system',
      createdAt: n.created_at,
    }));

    return notifications;
  }

  async markNotificationsRead() {
    await notificationRepository.markAllAsRead();
    return { success: true };
  }

  async markSingleNotificationRead(id) {
    await notificationRepository.markSingleAsRead(id);
    return { success: true };
  }

  async createNotification({ creatorId = null, userId = null, type, title, message }, { transaction } = {}) {
    const adminOnlyTypes = [
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
    const isAdminAlert = adminOnlyTypes.includes(type);

    const notifRecord = await notificationRepository.createNotification({
      creator_id: isAdminAlert ? null : creatorId,
      user_id: userId || null,
      type,
      title,
      message,
      is_read: false,
    }, { transaction });

    // Emit real-time Socket.io event strictly according to recipient
    try {
      const io = getIO();
      if (io) {
        if (isAdminAlert) {
          // Broadcast to Admin clients ONLY for admin-related events
          io.emit('admin_notification', {
            id: notifRecord.id,
            title: notifRecord.title,
            message: notifRecord.message,
            type: notifRecord.type,
            time: 'Just now',
            isRead: false,
            status: 'unread',
            createdAt: notifRecord.created_at || new Date().toISOString(),
          });
        }

        // Broadcast to Creator clients ONLY if it's a creator-targeted notification
        const targetCreatorId = creatorId || userId;
        if (targetCreatorId && !isAdminAlert) {
          const creatorNotifObj = {
            id: notifRecord.id,
            creatorId: Number(targetCreatorId),
            type: notifRecord.type,
            title: notifRecord.title,
            message: notifRecord.message,
            isRead: false,
            date: notifRecord.created_at || notifRecord.createdAt || new Date().toISOString(),
          };
          io.emit(`creator_notification_${targetCreatorId}`, creatorNotifObj);
          io.emit('creator_notification', creatorNotifObj);
        }
      }
    } catch (e) {
      console.warn('Socket emit warning for notification:', e.message);
    }

    return notifRecord;
  }
}

module.exports = new NotificationService();

