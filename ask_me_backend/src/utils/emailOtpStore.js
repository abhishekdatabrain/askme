const emailOtpMap = new Map();

/**
 * Generate a 6-digit numeric OTP and store it with 10-minute expiration
 */
const generateAndStoreEmailOtp = (email) => {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes TTL
  emailOtpMap.set(cleanEmail, { otp, expiresAt });
  return { cleanEmail, otp };
};

/**
 * Verify email & OTP code
 */
const verifyStoredEmailOtp = (email, inputOtp) => {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const record = emailOtpMap.get(cleanEmail);
  const codeStr = String(inputOtp || '').trim();

  if (!cleanEmail) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }

  if (!codeStr) {
    return { valid: false, message: 'Please enter the 6-digit OTP code.' };
  }

  if (!record) {
    return { valid: false, message: 'No active OTP request found for this email. Please request a new code.' };
  }

  if (Date.now() > record.expiresAt) {
    emailOtpMap.delete(cleanEmail);
    return { valid: false, message: 'OTP has expired (valid for 10 minutes). Please request a new code.' };
  }

  if (record.otp === codeStr) {
    emailOtpMap.delete(cleanEmail);
    return { valid: true };
  }

  return { valid: false, message: 'Invalid verification code. Please check your email and try again.' };
};

module.exports = {
  generateAndStoreEmailOtp,
  verifyStoredEmailOtp,
};
