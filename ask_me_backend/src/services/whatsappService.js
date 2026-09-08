const dotenv = require('dotenv');
dotenv.config();

/**
 * Official Askme WhatsApp Notification Service
 * Supports:
 * 1. Fonada WABA API (https://waba.fonada.com/api/SendMsgOld)
 * 2. Meta Cloud API
 * 3. Twilio WhatsApp API
 * 4. Dev Fallback / Mock Mode
 */

const ASKME_TEMPLATES = {
  LOGIN_OTP: 'askme_login_otp',
  ASK_LISTED: 'askme_ask_listed',
  NEW_ASK_RECEIVED: 'askme_new_ask_received',
  ASK_ANSWERED: 'askme_ask_answered',
  ASK_REJECTED: 'askme_ask_rejected',
  LIVE_SCHEDULED: 'askme_followed_creator_live_schedule',
  CREATOR_LIVE: 'askme_creator_live',
  WITHDRAWAL_REQUESTED: 'askme_withdrawal_requested',
  WITHDRAWAL_SUCCESS: 'askme_withdrawal_success',
  WITHDRAWAL_FAILED: 'askme_withdrawal_failed',
  ACTION_REQUIRED: 'askme_action_required',
};

/**
 * Core function to send WhatsApp Message via configured provider (Fonada, Meta, Twilio, or Mock)
 */
const sendWhatsAppMessage = async ({ to, text, templateName = null, buttonsPayload = null }) => {
  if (!to || !text) {
    console.warn('[WhatsApp Service] Recipient phone number or message text missing.');
    return { success: false, reason: 'Recipient or text missing' };
  }

  // Format recipient phone number (remove +, spaces, hyphens -> e.g. 917428336366)
  let cleanPhone = String(to).replace(/[^0-9]/g, '');

  // Ensure country code e.g. 91 for India if 10 digits
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const provider = (process.env.WHATSAPP_PROVIDER || 'fonada').toLowerCase();

  console.log(`[WhatsApp Service] Sending alert to ${cleanPhone} via provider "${provider}" [Template: ${templateName || 'default'}]`);

  try {
    // ==========================================
    // 1. FONADA WABA API INTEGRATION
    // ==========================================
    if (provider === 'fonada' || (process.env.FONADA_USER_ID && process.env.FONADA_PASSWORD)) {
      const urlStr = process.env.FONADA_API_URL || 'https://waba.fonada.com/api/SendMsgOld';

      const userId = process.env.FONADA_USER_ID || '';
      const password = process.env.FONADA_PASSWORD || '';
      const wabaNumber = process.env.FONADA_WABA_NUMBER || '';
      const defaultTemplate = process.env.FONADA_TEMPLATE_NAME || '';

      const sendFonadaRequest = (targetTemplate) => {
        const fields = {
          userid: userId,
          password: password,
          wabaNumber: wabaNumber,
          output: 'json',
          mobile: cleanPhone,
          sendMethod: 'quick',
          msgType: 'TEXT',
          templateName: targetTemplate,
          msg: text,
        };

        if (buttonsPayload) {
          fields.buttonsPayload = typeof buttonsPayload === 'string' ? buttonsPayload : JSON.stringify(buttonsPayload);
        }

        const boundary = '--------------------------' + Date.now().toString(16);
        let postBody = '';
        for (const [key, val] of Object.entries(fields)) {
          postBody += `--${boundary}\r\n`;
          postBody += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
          postBody += `${val}\r\n`;
        }
        postBody += `--${boundary}--\r\n`;

        return new Promise((resolve) => {
          const https = require('https');
          const parsedUrl = new URL(urlStr);

          const req = https.request({
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'POST',
            rejectUnauthorized: false,
            headers: {
              'Content-Type': `multipart/form-data; boundary=${boundary}`,
              'Content-Length': Buffer.byteLength(postBody),
              'Cookie': 'SERVERID=webC1',
            },
          }, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
              try {
                resolve(JSON.parse(body));
              } catch (e) {
                resolve({ status: res.statusCode, body });
              }
            });
          });

          req.on('error', (err) => {
            resolve({ error: err.message });
          });

          req.write(postBody);
          req.end();
        });
      };

      const requestedTemplate = templateName || process.env.FONADA_TEMPLATE_NAME || defaultTemplate;
      let resData = await sendFonadaRequest(requestedTemplate);

      // If requested template does not exist on Fonada account, automatically retry with fallback template ('testing')
      if (resData?.error && String(resData.error).includes('template is not exists')) {
        const fallbackTemplate = process.env.FONADA_TEMPLATE_NAME || 'testing';
        if (fallbackTemplate !== requestedTemplate) {
          console.warn(`[WhatsApp Service] Template "${requestedTemplate}" not found on Fonada. Retrying with fallback template "${fallbackTemplate}"...`);
          resData = await sendFonadaRequest(fallbackTemplate);
        }
      }

      console.log('[WhatsApp Service] Fonada API Response:', resData);
      return { success: !resData?.error, provider: 'fonada', response: resData };
    }

    // ==========================================
    // 2. META CLOUD API INTEGRATION
    // ==========================================
    else if (provider === 'meta' && process.env.META_WHATSAPP_TOKEN && process.env.META_WHATSAPP_PHONE_ID) {
      const url = `https://graph.facebook.com/v18.0/${process.env.META_WHATSAPP_PHONE_ID}/messages`;

      const payload = templateName
        ? {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
          },
        }
        : {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: { preview_url: true, body: text },
        };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.META_WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('[WhatsApp Service] Meta Cloud API error:', data);
        return { success: false, provider: 'meta', error: data };
      }

      return { success: true, provider: 'meta', messageId: data.messages?.[0]?.id };
    }

    // ==========================================
    // 3. TWILIO WHATSAPP API INTEGRATION
    // ==========================================
    else if (provider === 'twilio' && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
      const toNumber = `whatsapp:+${cleanPhone}`;

      const params = new URLSearchParams();
      params.append('From', fromNumber);
      params.append('To', toNumber);
      params.append('Body', text);

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('[WhatsApp Service] Twilio API error:', data);
        return { success: false, provider: 'twilio', error: data };
      }

      return { success: true, provider: 'twilio', messageId: data.sid };
    }

    // ==========================================
    // 4. FALLBACK MOCK MODE
    // ==========================================
    else {
      console.log(`[WhatsApp Mock Alert] 📲 Message to +${cleanPhone}: "${text}"`);
      return {
        success: true,
        provider: 'mock',
        note: 'Simulated success in development mode.',
      };
    }
  } catch (err) {
    console.error('[WhatsApp Service] Unexpected error:', err.message);
    return { success: false, error: err.message };
  }
};

// ==========================================================
// 11 OFFICIAL ASKME WHATSAPP TEMPLATE HELPER FUNCTIONS
// ==========================================================

/**
 * 1. Login OTP (Template: askme_login_otp)
 */
const sendLoginOtpWhatsApp = async ({ phone, otp, expiresMinutes = 5 }) => {
  if (!phone || !otp) return null;
  const text = `🔐 Your Askme verification code is ${otp}\n\nUse this code to log in to your Askme account.\n\nThis code expires in ${expiresMinutes} minutes. Do not share this code with anyone.`;
  return sendWhatsAppMessage({
    to: phone,
    text,
    templateName: ASKME_TEMPLATES.LOGIN_OTP,
    buttonsPayload: { button1: 'Copy Code' },
  });
};

/**
 * 2. Your Ask Was Listed (Template: askme_ask_listed)
 */
const sendAskListedWhatsApp = async ({ viewerPhone, creatorName, sessionCode }) => {
  if (!viewerPhone) return null;
  const host = creatorName || 'Creator';
  const text = `✅ Your Ask is now listed\n\nYour question has been published on ${host}'s Askme profile.\n\nWe'll let you know when ${host} answers it.`;
  return sendWhatsAppMessage({
    to: viewerPhone,
    text,
    templateName: ASKME_TEMPLATES.ASK_LISTED,
    buttonsPayload: { button1: 'View Ask' },
  });
};

/**
 * 3. You Have a New Ask (Template: askme_new_ask_received)
 */
const sendNewAskReceivedWhatsApp = async ({ creatorPhone, viewerName }) => {
  if (!creatorPhone) return null;
  const sender = viewerName || 'A supporter';
  const text = `💬 You have a new Ask!\n\n${sender} has sent you a question on Askme.\n\nTap below to view and answer it.`;
  return sendWhatsAppMessage({
    to: creatorPhone,
    text,
    templateName: ASKME_TEMPLATES.NEW_ASK_RECEIVED,
    buttonsPayload: { button1: 'Answer Ask' },
  });
};

/**
 * 4. Your Ask Was Answered (Template: askme_ask_answered)
 */
const sendAskAnsweredWhatsApp = async ({ viewerPhone, creatorName, sessionCode }) => {
  if (!viewerPhone) return null;
  const host = creatorName || 'Creator';
  const text = `🎉 ${host} answered your Ask!\n\nYour question has been answered by ${host} on Askme.\n\nTap below to see the answer.`;
  return sendWhatsAppMessage({
    to: viewerPhone,
    text,
    templateName: ASKME_TEMPLATES.ASK_ANSWERED,
    buttonsPayload: { button1: 'View Answer' },
  });
};

/**
 * 5. Your Ask Was Rejected (Template: askme_ask_rejected)
 */
const sendAskRejectedWhatsApp = async ({ viewerPhone, creatorName }) => {
  if (!viewerPhone) return null;
  const host = creatorName || 'Creator';
  const text = `⚠️ Your Ask was not accepted\n\nYour question to ${host} was rejected because it was found to be abusive or inappropriate.\n\nPlease review Askme's community guidelines before submitting another Ask.`;
  return sendWhatsAppMessage({
    to: viewerPhone,
    text,
    templateName: ASKME_TEMPLATES.ASK_REJECTED,
    buttonsPayload: { button1: 'View Guidelines' },
  });
};

/**
 * 6. Followed Creator Scheduled a Live (Template: askme_followed_creator_live_scheduled)
 */
const sendLiveScheduledWhatsApp = async ({ followerPhone, creatorName, date, time }) => {
  if (!followerPhone) return null;
  const host = creatorName || 'Creator';
  const text = `${host} has scheduled a Live\n\n${host} is going Live on Askme on ${date || ''} at ${time || ''}.\n\nSet a reminder so you don't miss it.`;
  return sendWhatsAppMessage({
    to: followerPhone,
    text,
    templateName: ASKME_TEMPLATES.LIVE_SCHEDULED,
    buttonsPayload: { button1: 'Set Reminder' },
  });
};

/**
 * 7. Followed Creator Is Live (Template: askme_creator_live)
 */
const sendCreatorIsLiveWhatsApp = async ({ followerPhone, creatorName, sessionCode }) => {
  if (!followerPhone) return null;
  const host = creatorName || 'Creator';
  const text = host;
  return sendWhatsAppMessage({
    to: followerPhone,
    text,
    templateName: ASKME_TEMPLATES.CREATOR_LIVE,
    buttonsPayload: { button1: 'Join Live' },
  });
};

/**
 * 8. Withdrawal Request Received (Template: askme_withdrawal_requested)
 */
const sendWithdrawalRequestedWhatsApp = async ({ creatorPhone, amount, requestId }) => {
  if (!creatorPhone) return null;
  const text = `💸 Withdrawal request received\n\nWe've received your withdrawal request of ₹${amount || '0'}.\n\nRequest ID: ${requestId || 'REQ-001'}\n\nWe'll notify you when your withdrawal is processed.`;
  return sendWhatsAppMessage({
    to: creatorPhone,
    text,
    templateName: ASKME_TEMPLATES.WITHDRAWAL_REQUESTED,
    buttonsPayload: { button1: 'View Withdrawal' },
  });
};

/**
 * 9. Withdrawal Successful (Template: askme_withdrawal_success)
 */
const sendWithdrawalSuccessWhatsApp = async ({ creatorPhone, amount, requestId }) => {
  if (!creatorPhone) return null;
  const text = `✅ Withdrawal successful\n\nYour withdrawal of ₹${amount || '0'} has been processed successfully.\n\nRequest ID: ${requestId || 'REQ-001'}`;
  return sendWhatsAppMessage({
    to: creatorPhone,
    text,
    templateName: ASKME_TEMPLATES.WITHDRAWAL_SUCCESS,
    buttonsPayload: { button1: 'View Transaction' },
  });
};

/**
 * 10. Withdrawal Failed (Template: askme_withdrawal_failed)
 */
const sendWithdrawalFailedWhatsApp = async ({ creatorPhone, amount, reason }) => {
  if (!creatorPhone) return null;
  const text = `⚠️ Withdrawal could not be completed\n\nYour withdrawal of ₹${amount || '0'} could not be processed.\n\nReason: ${reason || 'Bank details mismatch'}\n\nPlease review your details and try again.`;
  return sendWhatsAppMessage({
    to: creatorPhone,
    text,
    templateName: ASKME_TEMPLATES.WITHDRAWAL_FAILED,
    buttonsPayload: { button1: 'Try Again' },
  });
};

/**
 * 11. Important Account/KYC Action Required (Template: askme_action_required)
 */
const sendActionRequiredWhatsApp = async ({ userPhone, actionName }) => {
  if (!userPhone) return null;
  const action = actionName || 'KYC Verification';
  const text = `⚠️ Action required on your Askme account\n\nPlease complete ${action} to continue using this feature.\n\nTap below to continue.`;
  return sendWhatsAppMessage({
    to: userPhone,
    text,
    templateName: ASKME_TEMPLATES.ACTION_REQUIRED,
    buttonsPayload: { button1: 'Take Action' },
  });
};

module.exports = {
  ASKME_TEMPLATES,
  sendWhatsAppMessage,
  sendLoginOtpWhatsApp,
  sendAskListedWhatsApp,
  sendNewAskReceivedWhatsApp,
  sendAskAnsweredWhatsApp,
  sendAskRejectedWhatsApp,
  sendLiveScheduledWhatsApp,
  sendCreatorIsLiveWhatsApp,
  sendWithdrawalRequestedWhatsApp,
  sendWithdrawalSuccessWhatsApp,
  sendWithdrawalFailedWhatsApp,
  sendActionRequiredWhatsApp,
  // Backward compatibility aliases
  sendGoLiveWhatsAppAlert: sendCreatorIsLiveWhatsApp,
  sendQuestionAnsweredWhatsAppAlert: sendAskAnsweredWhatsApp,
};
