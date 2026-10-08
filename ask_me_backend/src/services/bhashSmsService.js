const dotenv = require('dotenv');
dotenv.config();
const http = require('http');
const https = require('https');

/**
 * BhashSMS Gateway Integration Service
 * Endpoint: http://bhashsms.com/api/sendmsg.php
 */

/**
 * Send SMS OTP / Message via BhashSMS API
 * @param {Object} params
 * @param {string} params.phone Target 10-digit mobile number
 * @param {string} params.otp OTP Verification code
 * @param {string} [params.text] Optional custom SMS text message
 */
const sendBhashSms = async ({ phone, otp, text }) => {
  if (!phone) {
    console.warn('[Bhash SMS Service] Target phone number missing.');
    return { success: false, error: 'Target phone number missing' };
  }

  let cleanPhone = String(phone).replace(/[^0-9]/g, '');
  if (cleanPhone.length > 10) {
    cleanPhone = cleanPhone.slice(-10);
  }

  if (cleanPhone.length !== 10) {
    console.warn('[Bhash SMS Service] Invalid 10-digit phone number format:', phone);
    return { success: false, error: 'Invalid 10-digit phone number format' };
  }

  const user = (process.env.BHASH_SMS_USER || 'FuturePast_SMS').trim();
  const pass = (process.env.BHASH_SMS_PASS || '').trim();
  const sender = (process.env.BHASH_SMS_SENDER || 'FTRPST').trim();
  const baseUrl = (process.env.BHASH_SMS_BASE_URL || 'http://bhashsms.com/api/sendmsg.php').trim();

  // DLT Approved OTP Template registered for FTRPST / FuturePast_SMS
  const defaultText = `Hello Test OTP ${otp}`;
  const smsContent = text || defaultText;

  const queryParams = new URLSearchParams({
    user,
    pass,
    sender,
    phone: cleanPhone,
    text: smsContent,
    priority: 'ndnd',
    stype: 'normal',
  });

  const fullUrl = `${baseUrl}?${queryParams.toString()}`;

  console.log(`[Bhash SMS Service] Dispatching SMS to ${cleanPhone} [OTP: ${otp || 'N/A'}]`);

  return new Promise((resolve) => {
    try {
      const isHttps = fullUrl.startsWith('https');
      const httpModule = isHttps ? https : http;

      const req = httpModule.get(fullUrl, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          const body = responseData.trim();
          console.log(`[Bhash SMS Response] Status: ${res.statusCode}, Body: ${body}`);
          const isSuccess = res.statusCode >= 200 && res.statusCode < 300 && (body.startsWith('S.') || (!/incorrect|deactivated|invalid|error|fail/i.test(body) && body.length < 30));
          if (!isSuccess) {
            console.error(`❌ [Bhash SMS Error Response]: ${body}`);
          }
          resolve({
            success: isSuccess,
            response: body,
            statusCode: res.statusCode,
          });
        });
      });

      req.on('error', (err) => {
        console.error('❌ [Bhash SMS Network Error]:', err.message);
        resolve({ success: false, error: err.message });
      });

      req.setTimeout(10000, () => {
        req.destroy();
        console.error('❌ [Bhash SMS Timeout Error]: Request timed out after 10s');
        resolve({ success: false, error: 'Request timeout' });
      });
    } catch (err) {
      console.error('❌ [Bhash SMS Exception]:', err.message);
      resolve({ success: false, error: err.message });
    }
  });
};

module.exports = {
  sendBhashSms,
};
