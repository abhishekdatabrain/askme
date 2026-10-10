const { Follow, User, Notification, Creator } = require("../models");
const { getIO } = require("../config/socket");
const { sendGoLiveWhatsAppAlert } = require("./whatsappService");
const { sendGoLiveEmailToFollowersAsync } = require("./emailService");

/**
 * Trigger Mass Automated Notification (In-App + WhatsApp + Email) to all followers when Creator starts Live Session
 */
const triggerGoLiveBroadcast = async ({ creatorId, sessionId, title, sessionCode }) => {
  if (!creatorId) return null;

  try {
    // 1. Fetch Creator Info from verified single Creator record
    const creator = await Creator.findByPk(creatorId).catch(() => null);
    const creatorName = creator?.display_name || creator?.full_name || creator?.username || "Creator";

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
      raw: true
    });

    if (!follows || follows.length === 0) {
      console.log(`[Broadcast Service] Creator ID ${creatorId} has 0 followers in DB. Skipping mass broadcast.`);
      return { followersCount: 0 };
    }

    console.log(`[Broadcast Service] Triggering mass Go-Live alert for Creator "${creatorName}" to ${follows.length} followers!`);

    const followerUserIds = [];
    const notificationRecords = [];
    const recipients = [];
    const emailFollowers = [];

    follows.forEach((f) => {
      const viewerId = f.viewer?.id || f['viewer.id'] || f.viewer_id;
      const viewerName = f.viewer?.name || f['viewer.name'] || '';
      const viewerEmail = f.viewer?.email || f['viewer.email'];
      console.log(viewerEmail,"viewerEmail");
      const viewerPhone = f.viewer?.phone || f['viewer.phone'];

      if (viewerId) {
        followerUserIds.push(viewerId);

        notificationRecords.push({
          user_id: viewerId,
          creator_id: creatorId,
          session_id: null,
          type: "go_live",
          title: `🔴 ${creatorName} is NOW LIVE!`,
          message: `"${title}" has started! Join the live stream and ask your questions.`,
          is_read: false,
        });
      }

      if (viewerPhone) {
        recipients.push({ phone: viewerPhone, name: viewerName });
      }

      if (viewerEmail) {
        emailFollowers.push({ name: viewerName, email: viewerEmail });
      }
    });

    // 1. Bulk Insert In-App Notifications for all followers into DB
    if (notificationRecords.length > 0) {
      await Notification.bulkCreate(notificationRecords).catch((err) => {
        console.error('[Broadcast Service] Notification DB bulkCreate error:', err.message);
      });
      console.log(`[Broadcast Service] Saved ${notificationRecords.length} in-app Go-Live notifications to DB.`);
    }

    // 2. Real-time Socket.io Push Notifications to online follower viewers
    try {
      const io = getIO();
      if (io) {
        followerUserIds.forEach((viewerId) => {
          // Push live notification alert to individual user socket channel
          io.to(`user_${viewerId}`).emit('notification', {
            type: 'go_live',
            title: `🔴 ${creatorName} is NOW LIVE!`,
            message: `"${title}" has started! Join the live stream and ask your questions.`,
            creatorId,
            sessionId,
            sessionCode,
          });

          io.to(`user_${viewerId}`).emit('creator_live', {
            creatorId,
            creatorName,
            sessionTitle: title,
            sessionCode,
          });
        });

        // Broadcast to global feed
        io.emit('creator_went_live', {
          creatorId,
          creatorName,
          sessionTitle: title,
          sessionCode,
        });

        console.log(`[Broadcast Service] Socket.io push notification emitted to ${followerUserIds.length} follower viewer(s).`);
      }
    } catch (socketErr) {
      console.warn('[Broadcast Service] Socket push notification error:', socketErr.message);
    }

    // 3. Send FCM Push Notification to all follower devices
    try {
      const { sendFollowersLiveNotification } = require("../admin/services/fcmService");
      await sendFollowersLiveNotification({
        followerUserIds,
        title: `🔴 ${creatorName} is NOW LIVE!`,
        body: `"${title}" has started! Join the live stream and ask your questions.`,
        data: {
          type: "GO_LIVE",
          creatorId: String(creatorId),
          sessionId: String(sessionId || ""),
          sessionCode: String(sessionCode || ""),
          creatorName: String(creatorName),
          url: sessionCode ? `/pay/${sessionCode}` : "/viewers/notifications",
        },
      });
    } catch (fcmErr) {
      console.warn("[Broadcast Service] FCM followers push notification warning:", fcmErr.message);
    }

    // 4. Send Go-Live Email to all followers asynchronously
    sendGoLiveEmailToFollowersAsync({
      followers: emailFollowers,
      creatorName,
      sessionTitle: title,
      sessionCode,
    });

    // Recipients list contains ONLY followers (viewers)
    const whatsappPromises = recipients.map(async (r) => {
      console.log(`[Broadcast Service] Sending WhatsApp Go-Live alert to "${r.name}" (${r.phone})`);
      try {
        const waRes = await sendGoLiveWhatsAppAlert({
          followerPhone: r.phone,
          followerName: r.name,
          creatorId,
          creator,
          creatorName,
          sessionTitle: title,
          sessionCode,
        });
        return waRes;
      } catch (err) {
        console.warn(`[Broadcast Service] WhatsApp alert error for phone ${r.phone}:`, err.message);
        return { success: false, error: err.message };
      }
    });

    await Promise.allSettled(whatsappPromises);

    return {
      success: true,
      followersCount: follows.length,
      notifiedUsersCount: followerUserIds.length,
      emailsSentCount: emailFollowers.length,
    };
  } catch (err) {
    console.error("[Broadcast Service] Failed to trigger Go-Live broadcast:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  triggerGoLiveBroadcast,
};
