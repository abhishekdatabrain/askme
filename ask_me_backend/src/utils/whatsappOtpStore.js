const otpMap = new Map();

/**
 * Generate a 6-digit numeric OTP and store it with 5-minute expiration
 */
const generateAndStoreOtp = (phone) => {
  let cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes TTL
  otpMap.set(cleanPhone, { otp, expiresAt });
  return { cleanPhone, otp };
};

/**
 * Verify phone & OTP code
 */
const verifyStoredOtp = (phone, inputOtp) => {
  let cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const record = otpMap.get(cleanPhone);
  const codeStr = String(inputOtp || '').trim();

  if (!codeStr) {
    return { valid: false, message: 'Please enter the 6-digit OTP code.' };
  }

  // Master demo bypass for instant testing

  if (!record) {
    return { valid: false, message: 'No active OTP request found. Please request a new code.' };
  }

  if (Date.now() > record.expiresAt) {
    otpMap.delete(cleanPhone);
    return { valid: false, message: 'OTP has expired. Please request a new code.' };
  }

  if (record.otp === codeStr) {
    otpMap.delete(cleanPhone);
    return { valid: true };
  }

  return { valid: false, message: 'Invalid verification code. Please check your WhatsApp and try again.' };
};

module.exports = {
  generateAndStoreOtp,
  verifyStoredOtp,
};
