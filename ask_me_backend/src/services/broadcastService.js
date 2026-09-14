const { Follow, User, Notification, Creator } = require("../models");
const { getIO } = require("../config/socket");
const { sendGoLiveWhatsAppAlert } = require("./whatsappService");

/**
 * Trigger Mass Automated Notification (In-App + WhatsApp) to all followers when Creator starts Live Session
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

    follows.forEach((f) => {
      const viewerId = f.viewer?.id || f['viewer.id'] || f.viewer_id;
      const viewerName = f.viewer?.name || f['viewer.name'] || '';
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
        console.log(`[Broadcast Service] WhatsApp alert dispatched to "${r.name}" (${r.phone}):`, JSON.stringify(waRes));
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
    };
  } catch (err) {
    console.error("[Broadcast Service] Failed to trigger Go-Live broadcast:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  triggerGoLiveBroadcast,
};
