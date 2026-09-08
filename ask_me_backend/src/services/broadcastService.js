const { Follow, User, Notification, Creator } = require("../models");
const { getIO } = require("../config/socket");
const { sendGoLiveWhatsAppAlert } = require("./whatsappService");

/**
 * Trigger Mass Automated Notification (In-App + WhatsApp) to all followers when Creator starts Live Session
 */
const triggerGoLiveBroadcast = async ({ creatorId, sessionId, title, sessionCode }) => {
  if (!creatorId) return null;

  try {
    // 1. Fetch Creator Info
    const creator = await Creator.findByPk(creatorId).catch(() => null);
    const creatorName = creator?.full_name || creator?.name || "Creator Host";

    // 2. Fetch all followers of this creator
    const follows = await Follow.findAll({
      where: { creator_id: creatorId },
      include: [
        {
          model: User,
          as: "viewer",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
    });

    if (!follows || follows.length === 0) {
      console.log(`[Broadcast Service] Creator ID ${creatorId} has 0 followers in DB. Skipping mass broadcast.`);
      return { followersCount: 0 };
    }

    console.log(`[Broadcast Service] Triggering mass Go-Live alert for Creator "${creatorName}" to ${follows.length} followers!`);

    const followerUserIds = [];
    const notificationRecords = [];

    follows.forEach((f) => {
      const viewer = f.viewer;
      if (viewer && viewer.id) {
        followerUserIds.push(viewer.id);

        notificationRecords.push({
          user_id: viewer.id,
          creator_id: creatorId,
          session_id: null,
          type: "go_live",
          title: `🔴 ${creatorName} is NOW LIVE!`,
          message: `"${title || "Live Broadcast"}" has started! Join the live stream and ask your questions.`,
          is_read: false,
        });
      }
    });

    // 3. Bulk Insert In-App Notifications for Followers
    if (notificationRecords.length > 0) {
      await Notification.bulkCreate(notificationRecords, { ignoreDuplicates: true }).catch((err) => {
        console.warn("[Broadcast Service] Bulk insert notifications notice:", err.message);
      });
    }

    // 4. Socket.io Live Broadcast Event
    try {
      const io = getIO();
      if (io) {
        io.emit("broadcast_go_live", {
          creatorId,
          creatorName,
          sessionId,
          sessionCode,
          title,
          startedAt: new Date(),
        });
      }
    } catch (e) {}

    // 5. Trigger Async WhatsApp Alerts to followers with valid phone numbers via Fonada / WhatsApp Service
    const whatsappPromises = follows.map(async (f) => {
      const phone = f.viewer?.phone;
      if (phone) {
        console.log(`[Broadcast Service] Sending WhatsApp Go-Live alert to follower "${f.viewer?.name}" (${phone})`);
        try {
          const waRes = await sendGoLiveWhatsAppAlert({
            followerPhone: phone,
            followerName: f.viewer?.name,
            creatorName,
            sessionTitle: title,
            sessionCode,
          });
          console.log(`[Broadcast Service] WhatsApp alert dispatched to "${f.viewer?.name}" (${phone}):`, JSON.stringify(waRes));
          return waRes;
        } catch (err) {
          console.warn(`[Broadcast Service] WhatsApp alert error for phone ${phone}:`, err.message);
          return { success: false, error: err.message };
        }
      } else {
        console.warn(`[Broadcast Service] Follower ID ${f.viewer?.id} has no phone number on file.`);
        return null;
      }
    });

    await Promise.allSettled(whatsappPromises);

    return {
      success: true,
      followersCount: follows.length,
      notifiedUsersCount: followerUserIds.length,
    };
  } catch (err) {
    console.error("[Broadcast Service] Failed to trigger Go-Live broadcast:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  triggerGoLiveBroadcast,
};
