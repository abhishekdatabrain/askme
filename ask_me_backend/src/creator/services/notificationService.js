const { Notification } = require("../../models");
const { getIO } = require("../../config/socket");
const { Op } = require("sequelize");

/**
 * Helper to trigger & create a Creator Notification in DB
 */
const createCreatorNotificationService = async ({ creatorId, type, title, message, referenceType = null, referenceId = null }) => {
  if (!creatorId) return null;

  const notifRecord = await Notification.create({
    user_id: creatorId,
    creator_id: creatorId,
    type: type || "system_update",
    title: title || "New Notification",
    message: message || "",
    is_read: false,
  });

  const notifObj = {
    id: notifRecord.id,
    creatorId: Number(creatorId),
    type: notifRecord.type,
    title: notifRecord.title,
    message: notifRecord.message,
    referenceType,
    referenceId,
    isRead: false,
    date: notifRecord.created_at || notifRecord.createdAt || new Date().toISOString(),
  };

  try {
    const io = getIO();
    if (io) {
      io.emit(`creator_notification_${creatorId}`, notifObj);
      io.emit("creator_notification", notifObj);
    }
  } catch (e) {}

  return notifObj;
};

/**
 * Get Creator Notifications from Database
 */
const getCreatorNotificationsService = async (creatorId) => {
  if (!creatorId) {
    const err = new Error("Creator ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const excludedTypes = ['creator_registration', 'kyc', 'payout', 'withdrawal_request', 'go_live'];

  const dbRecords = await Notification.findAll({
    where: {
      [Op.or]: [
        { user_id: creatorId },
        { creator_id: creatorId },
      ],
      type: {
        [Op.notIn]: excludedTypes,
      },
    },
    order: [["id", "DESC"]],
    limit: 50,
  });

  const notifications = dbRecords.map((n) => ({
    id: n.id,
    creatorId: n.creator_id || n.user_id,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: !!n.is_read,
    date: n.created_at || n.createdAt || new Date(),
  }));

  return { notifications };
};

/**
 * Mark all creator notifications as read
 */
const markCreatorNotificationsReadService = async (creatorId) => {
  if (!creatorId) {
    const err = new Error("Creator ID is required.");
    err.statusCode = 400;
    throw err;
  }

  await Notification.update(
    { is_read: true },
    {
      where: {
        [Op.or]: [
          { user_id: creatorId },
          { creator_id: creatorId },
        ],
      },
    }
  );

  return { message: "All creator notifications marked as read" };
};

/**
 * Mark single notification as read
 */
const markSingleCreatorNotificationReadService = async (notificationId, creatorId) => {
  if (!notificationId) {
    const err = new Error("Notification ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const notif = await Notification.findByPk(notificationId);
  if (!notif) {
    const err = new Error("Notification not found.");
    err.statusCode = 404;
    throw err;
  }

  if (creatorId && String(notif.creator_id || notif.user_id) !== String(creatorId)) {
    const err = new Error("Unauthorized to access this notification.");
    err.statusCode = 403;
    throw err;
  }

  await notif.update({ is_read: true });

  return { message: "Notification marked as read" };
};

module.exports = {
  createCreatorNotificationService,
  getCreatorNotificationsService,
  markCreatorNotificationsReadService,
  markSingleCreatorNotificationReadService,
};
