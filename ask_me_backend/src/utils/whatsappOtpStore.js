const crypto = require('crypto');

const otpMap = new Map(); // cleanPhone -> { hashedOtp, expiresAt, lastSentAt, requestCount, windowStart }

const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds resend cooldown
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes rate limit window
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 requests per 15 min window

/**
 * Hash OTP code using SHA-256 so plain text is never stored
 */
function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp || '').trim()).digest('hex');
}

/**
 * Generate a 6-digit numeric OTP and store it hashed with 5-minute expiration,
 * resend cooldown, and rate limiting.
 */
const generateAndStoreOtp = (phone) => {
  let cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const now = Date.now();

  // Special instant trial number bypass (never blocked by rate limits or cooldowns)
  if (cleanPhone.endsWith('9999999999')) {
    const fixedOtp = '123456';
    const hashedOtp = hashOtp(fixedOtp);
    otpMap.set(cleanPhone, {
      hashedOtp,
      expiresAt: now + 24 * 60 * 60 * 1000,
      lastSentAt: 0,
      requestCount: 0,
      windowStart: 0,
    });
    return { cleanPhone, otp: fixedOtp };
  }

  const existing = otpMap.get(cleanPhone);

  if (existing) {
    // 1. Enforce Resend Cooldown
    if (existing.lastSentAt && (now - existing.lastSentAt) < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
      const err = new Error(`Please wait ${waitSec} second${waitSec > 1 ? 's' : ''} before requesting a new OTP.`);
      err.statusCode = 429;
      throw err;
    }

    // 2. Enforce Rate Limiting
    let windowStart = existing.windowStart || now;
    let requestCount = existing.requestCount || 0;

    if (now - windowStart > RATE_LIMIT_WINDOW_MS) {
      windowStart = now;
      requestCount = 1;
    } else {
      requestCount += 1;
      if (requestCount > MAX_REQUESTS_PER_WINDOW) {
        const err = new Error(`Too many OTP requests. Please try again after 15 minutes.`);
        err.statusCode = 429;
        throw err;
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = hashOtp(otp);
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes TTL

    otpMap.set(cleanPhone, {
      hashedOtp,
      expiresAt,
      lastSentAt: now,
      requestCount,
      windowStart,
    });

    return { cleanPhone, otp };
  }

  // New OTP request record
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = hashOtp(otp);
  const expiresAt = now + 5 * 60 * 1000; // 5 minutes TTL

  otpMap.set(cleanPhone, {
    hashedOtp,
    expiresAt,
    lastSentAt: now,
    requestCount: 1,
    windowStart: now,
  });

  return { cleanPhone, otp };
};

/**
 * Verify phone & OTP code using SHA-256 hash comparison
 */
const verifyStoredOtp = (phone, inputOtp) => {
  let cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  // Instant trial dummy number bypass (9999999999)
  if (cleanPhone.endsWith('9999999999')) {
    return { valid: true };
  }

  const record = otpMap.get(cleanPhone);
  const codeStr = String(inputOtp || '').trim();

  if (!codeStr) {
    return { valid: false, message: 'Please enter the 6-digit OTP code.' };
  }

  if (!record) {
    return { valid: false, message: 'No active OTP request found. Please request a new code.' };
  }

  if (Date.now() > record.expiresAt) {
    otpMap.delete(cleanPhone);
    return { valid: false, message: 'OTP has expired. Please request a new code.' };
  }

  const inputHash = hashOtp(codeStr);

  if (record.hashedOtp === inputHash) {
    otpMap.delete(cleanPhone);
    return { valid: true };
  }

  return { valid: false, message: 'Invalid verification code. Please check your WhatsApp and try again.' };
};

module.exports = {
  generateAndStoreOtp,
  verifyStoredOtp,
};

