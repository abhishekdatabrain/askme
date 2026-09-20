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
 * Mask phone number for security in production logs (e.g., 919876****10)
 */
const maskPhone = (phone) => {
  if (!phone || phone.length < 8) return '****';
  return `${phone.slice(0, 5)}****${phone.slice(-2)}`;
};

/**
 * Core function to send WhatsApp Message / Template via Fonada WABA API
 */
const sendWhatsAppTemplate = async ({ to, templateName, variables = [], buttonsPayload = null, text = null }) => {
  console.log(variables, "variables")
  if (!to) {
    console.warn('[WhatsApp Service] Recipient phone number missing.');
    return { success: false, error: 'Recipient phone number missing' };
  }

  let cleanPhone = String(to).replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const logPhone = process.env.NODE_ENV === 'production' ? maskPhone(cleanPhone) : cleanPhone;
  const provider = (process.env.WHATSAPP_PROVIDER || 'fonada').toLowerCase();

  console.log(`[WhatsApp Service] Sending alert to ${logPhone} via provider "${provider}" [Template: ${templateName || 'default'}]`);

  try {
    if (provider === 'fonada' || process.env.FONADA_USER_ID) {
      const urlStr = process.env.FONADA_API_URL;
      const userId = process.env.FONADA_USER_ID;
      const password = process.env.FONADA_PASSWORD;
      const wabaNumber = process.env.FONADA_WABA_NUMBER;
      // const defaultTemplate = process.env.FONADA_TEMPLATE_NAME || 'askme_login_otp';
      const targetTemplate = templateName;

      const sendFonadaRequest = (targetTemplate) => {
        const varArr = Array.isArray(variables) ? variables : (variables ? [variables] : []);
        const firstVar = varArr[0] || '';
        console.log(varArr, firstVar, "firstVar")

        const defaultMsgText = (targetTemplate && varArr.length > 0) ? String(varArr[0]) : (text || 'Askme Alert');

        // const fields = {
        //   userid: userId,
        //   password: password,
        //   wabaNumber: wabaNumber,
        //   output: 'json',
        //   mobile: cleanPhone,
        //   msgType: targetTemplate ? 'TEMPLATE' : 'TEXT',
        //   templateName: targetTemplate,
        //   msg: defaultMsgText,
        // };
        const fields = {
          userid: userId,
          password: password,
          wabaNumber: wabaNumber,
          output: 'json',
          mobile: cleanPhone,
          sendMethod: 'quick',
          msgType: targetTemplate ? 'TEMPLATE' : 'TEXT',
          templateName: targetTemplate,
          msg: defaultMsgText,
          variables: String(varArr[0] || '').trim(),
        };

        if (varArr.length > 0) {
          fields.variables = String(varArr[0]).trim();
          fields.bodyVariables = JSON.stringify(varArr);
        }

        if (buttonsPayload) {
          fields.buttonsPayload =
            typeof buttonsPayload === 'string'
              ? buttonsPayload
              : JSON.stringify(buttonsPayload);
        }
        console.log("Fonada Fields:", fields);

        // if (varArr.length > 0) {
        //   console.log(varArr, "varArr")
        //   fields.variables = varArr.join(',');
        //   fields.bodyVariables = JSON.stringify(varArr);
        //   fields.buttonsPayload = JSON.stringify(varArr);
        // }
        if (varArr.length > 0) {
          fields.variables = String(varArr[0]).trim();
          // fields.variables = varArr.join(',');
          // fields.bodyVariables = JSON.stringify(varArr);
        }
        if (buttonsPayload) {
          fields.buttonsPayload = typeof buttonsPayload === 'string' ? buttonsPayload : JSON.stringify(buttonsPayload);
        }
        console.log("Fonada Fields:", fields);

        const boundary = '--------------------------' + Date.now().toString(16);
        let postBody = '';

        for (const [key, val] of Object.entries(fields)) {
          if (val === undefined || val === null) continue;
          postBody += `--${boundary}\r\n`;
          postBody += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
          postBody += `${val}\r\n`;
        }
        postBody += `--${boundary}--\r\n`;

        return new Promise((resolve) => {
          const https = require('https');
          const parsedUrl = new URL(urlStr);

          const req = https.request(
            {
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
            },
            (res) => {
              let body = '';
              res.on('data', (chunk) => { body += chunk; });
              res.on('end', () => {
                let parsed;
                try {
                  console.log();
                  parsed = JSON.parse(body);
                } catch (e) {
                  parsed = { body };
                }
                const isSuccess = res.statusCode === 200 && (parsed?.status === 'success' || parsed?.msgId || !parsed?.error);
                console.log(`[WhatsApp Service] Fonada Response [${isSuccess ? 'SUCCESS' : 'FAILED'}]:`, res.statusCode, parsed);
                resolve({
                  success: isSuccess,
                  data: parsed,
                  ...(isSuccess ? {} : { error: parsed?.error || parsed?.message || 'Fonada API Error' }),
                });
              });
            }
          );

          req.on('error', (err) => {
            console.error('[WhatsApp Service] Request Error:', err.message);
            resolve({ success: false, error: err.message });
          });

          req.write(postBody);
          console.log("========== FONADA ==========");
          console.log("template:", targetTemplate);
          console.log("variables:", JSON.stringify(fields.variables));
          console.log("variables length:", String(fields.variables).length);
          console.log("bodyVariables:", fields.bodyVariables);
          console.log("============================");
          req.end();
        });
      };

      return await sendFonadaRequest(targetTemplate);
    } else if (provider === 'meta' && process.env.META_WHATSAPP_TOKEN && process.env.META_WHATSAPP_PHONE_ID) {
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

    return { success: false, error: 'No active WhatsApp provider configured' };
  } catch (err) {
    console.error('[WhatsApp Service] Unexpected error:', err.message);
    return { success: false, error: err.message };
  }
};

const sendWhatsAppMessage = sendWhatsAppTemplate;

// ==========================================================
// 11 OFFICIAL ASKME WHATSAPP TEMPLATE HELPER FUNCTIONS
// ==========================================================

/**
 * 1. Login OTP (Template: askme_login_otp)
 */
const sendLoginOtpWhatsApp = async ({ phone, otp, expiresMinutes = 5 }) => {
  if (!phone || !otp) return null;

  console.log("WhatsApp OTP:", otp, phone);

  const text = `Your Askme verification code is ${otp}. Use this code to log in to your Askme account.`;

  return await sendWhatsAppMessage({
    to: phone,
    templateName: "otptemp",
    variables: [String(otp)]
  });

};

/**
 * 2. Your Ask Was Listed (Template: askme_ask_listed)
 */
const sendAskListedWhatsApp = async ({ viewerPhone, creatorName, sessionCode }) => {
  if (!viewerPhone) return null;
  const host = creatorName || '';
  console.log(host, "host");
  const text = host;
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


/**
 * 4. Your Ask Was Answered (Template: askme_ask_answered)
 */


/**
 * 5. Your Ask Was Rejected (Template: askme_ask_rejected)
 */


/**
 * 6. Followed Creator Scheduled a Live (Template: askme_followed_creator_live_scheduled)
 */


/**
 * 7. Followed Creator Is Live (Template: askme_creator_live)
 */
const sendCreatorIsLiveWhatsApp = async ({ followerPhone, creatorId, creator, creatorName: passedName, sessionTitle, sessionCode }) => {
  if (!followerPhone) return null;

  let resolvedCreator = creator;
  if (!resolvedCreator && creatorId) {
    try {
      const { Creator } = require('../models');
      resolvedCreator = await Creator.findByPk(creatorId).catch(() => null);
    } catch (e) {
      resolvedCreator = null;
    }
  }

  const activeCreator = resolvedCreator || (passedName && typeof passedName === 'object' ? passedName : null);
  const rawName = activeCreator?.display_name || activeCreator?.full_name || activeCreator?.username || (typeof passedName === 'string' ? passedName : 'Creator');
  const creatorName = String(rawName).split('|')[0].trim();

  const activeCreatorId = creatorId || activeCreator?.id || 'N/A';

  console.log("WhatsApp Creator Live:", {
    creatorId: activeCreatorId,
    creatorName,
    templateVariables: [creatorName, creatorName]
  });

  const origin = process.env.FRONTEND_URL || "http://localhost:3000";
  const liveUrl = sessionCode ? `${origin}/live/${sessionCode}` : `${origin}/live`;

  return sendWhatsAppTemplate({
    to: followerPhone,
    text: `🔴 ${creatorName} is LIVE on Askme!`,
    variables: [creatorName],
    templateName: ASKME_TEMPLATES.CREATOR_LIVE,
    buttonsPayload: { button1: liveUrl },
  });
};

/**
 * 8. Withdrawal Request Received (Template: askme_withdrawal_requested)
 */


/**
 * 9. Withdrawal Successful (Template: askme_withdrawal_success)
 */


/**
 * 10. Withdrawal Failed (Template: askme_withdrawal_failed)
 */


/**
 * 11. Important Account/KYC Action Required (Template: askme_action_required)
 */


module.exports = {
  ASKME_TEMPLATES,
  sendWhatsAppTemplate,
  sendWhatsAppMessage,
  sendLoginOtpWhatsApp,
  sendAskListedWhatsApp,
  sendCreatorIsLiveWhatsApp,
  // Backward compatibility aliases
  sendGoLiveWhatsAppAlert: sendCreatorIsLiveWhatsApp,
};
