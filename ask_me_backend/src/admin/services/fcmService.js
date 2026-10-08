const { getMessaging } = require('../../config/firebaseAdmin');
const AdminFcmToken = require('../../models/AdminFcmTokenModel');

/**
 * Reusable service to send FCM push notification to all active logged-in Admins
 * @param {Object} params
 * @param {string} params.title Notification Title
 * @param {string} params.body Notification Body text
 * @param {Object} [params.data] Custom payload data (e.g. type: 'CREATOR_REGISTERED', creatorId: '123')
 */
const sendAdminNotification = async ({ title, body, data = {} }) => {
  try {
    console.log(`\n🔔 [FCM SERVICE] Triggered Notification: "${title}" - "${body}"`);

    // 1. Query active admin FCM tokens from DB
    const activeTokenRecords = await AdminFcmToken.findAll({
      where: { is_active: true },
    });

    if (!activeTokenRecords || activeTokenRecords.length === 0) {
      console.log('⚠️ [FCM SERVICE WARNING] No active admin FCM tokens found in DB (admin_fcm_tokens table is empty). Please log into Admin Dashboard and allow browser notification permissions.');
      return { success: false, reason: 'no_tokens' };
    }

    const tokens = activeTokenRecords.map((r) => r.fcm_token).filter(Boolean);
    if (tokens.length === 0) return { success: false, reason: 'no_tokens' };

    const messaging = getMessaging();
    if (!messaging) {
      console.log('[FCM SERVICE NOTICE] Firebase Admin Messaging not initialized. Skipping push dispatch.');
      return { success: false, reason: 'firebase_not_configured' };
    }

    // Convert data values to strings as required by FCM
    const stringifiedData = {};
    Object.keys(data).forEach((key) => {
      stringifiedData[key] = String(data[key]);
    });

    const payload = {
      tokens,
      notification: {
        title,
        body,
      },
      data: stringifiedData,
    };

    const response = await messaging.sendEachForMulticast(payload);
    console.log(`[FCM SERVICE] Push notification sent to ${tokens.length} admin token(s). Success: ${response.successCount}, Failure: ${response.failureCount}`);

    // Clean up invalid or expired tokens
    if (response.failureCount > 0) {
      const tokensToRemove = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errCode = resp.error?.code;
          if (
            errCode === 'messaging/invalid-registration-token' ||
            errCode === 'messaging/registration-token-not-registered' ||
            errCode === 'messaging/invalid-argument'
          ) {
            tokensToRemove.push(tokens[idx]);
          }
        }
      });

      if (tokensToRemove.length > 0) {
        await AdminFcmToken.update(
          { is_active: false },
          { where: { fcm_token: tokensToRemove } }
        );
        console.log(`[FCM SERVICE] Deactivated ${tokensToRemove.length} invalid FCM token(s).`);
      }
    }

    return { success: true, successCount: response.successCount };
  } catch (err) {
    console.error('❌ [FCM SERVICE ERROR] Failed to send admin push notification:', err.message);
    // Notification failure must NOT cause calling operation to fail
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendAdminNotification,
};
