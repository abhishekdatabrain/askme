/**
 * Masking sensitive fields to prevent raw exposure of financial/KYC data in API responses.
 */

const maskPan = (pan) => {
  if (!pan || typeof pan !== 'string') return '';
  const trimmed = pan.trim();
  if (trimmed.length < 4) return 'XXXX';
  return 'XXXXXX' + trimmed.slice(-4);
};

const maskAadhaar = (aadhaar) => {
  if (!aadhaar || typeof aadhaar !== 'string') return '';
  const trimmed = aadhaar.trim();
  if (trimmed.length < 4) return 'XXXX';
  return 'XXXX-XXXX-' + trimmed.slice(-4);
};

const maskBankAccount = (accountNo) => {
  if (!accountNo || typeof accountNo !== 'string') return '';
  const trimmed = accountNo.trim();
  if (trimmed.length < 4) return 'XXXX';
  return 'XXXXXX' + trimmed.slice(-4);
};

module.exports = {
  maskPan,
  maskAadhaar,
  maskBankAccount,
};
