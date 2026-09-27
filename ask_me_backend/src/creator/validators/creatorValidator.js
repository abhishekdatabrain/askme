/**
 * Centralized Request Validator for Creator Module
 */

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim().toLowerCase());
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return { valid: false, message: 'Password is required.' };
  if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters long.' };
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (!hasLetter || !hasSpecial) {
    return { valid: false, message: 'Password must contain letters (A–Z/a–z) and at least one special character.' };
  }
  return { valid: true };
};

const validateIFSC = (ifsc) => {
  if (!ifsc) return true; // Optional field in some forms, but if provided must match
  const rawIfsc = String(ifsc).trim().toUpperCase();
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(rawIfsc);
};

const validateUPI = (upiId) => {
  if (!upiId) return { valid: false, message: 'UPI ID is required.' };
  const cleanUpi = String(upiId).trim().toLowerCase();
  if (/\s/.test(cleanUpi)) {
    return { valid: false, message: 'UPI ID should not contain spaces.' };
  }
  const parts = cleanUpi.split('@');
  if (parts.length !== 2) {
    return { valid: false, message: 'The UPI ID could not be verified. Please enter a valid UPI ID.' };
  }
  const [uname, handle] = parts;
  const unameRegex = /^[a-zA-Z0-9._-]+$/;
  if (!uname || !unameRegex.test(uname)) {
    return { valid: false, message: 'The UPI ID could not be verified. Please enter a valid UPI ID.' };
  }
  const validHandles = [
    'upi', 'okicici', 'oksbi', 'okaxis', 'ybl', 'paytm', 'icici', 'sbi',
    'axisbank', 'kotak', 'ibl', 'airtel', 'barodampay', 'federal', 'mahb',
    'indus', 'postbank', 'dlb', 'hsbc', 'unionbank', 'hdfcbank', 'pnb', 'rbl', 'yesbank'
  ];
  if (!validHandles.includes(handle)) {
    return { valid: false, message: 'The UPI ID could not be verified. Please enter a valid UPI ID.' };
  }
  return { valid: true, cleanUpi };
};

const validatePAN = (pan) => {
  if (!pan) return true;
  let cleaned = String(pan).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
  if (cleaned.length === 10) {
    let chars = cleaned.split('');
    for (let i = 0; i < 5; i++) {
      if (chars[i] === '0') chars[i] = 'O';
    }
    for (let i = 5; i < 9; i++) {
      if (chars[i] === 'O') chars[i] = '0';
    }
    if (chars[9] === '0') chars[9] = 'O';
    cleaned = chars.join('');
  }
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(cleaned);
};

module.exports = {
  validateEmail,
  validatePassword,
  validateIFSC,
  validateUPI,
  validatePAN,
};
