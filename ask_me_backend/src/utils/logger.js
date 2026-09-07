/**
 * Simple structured logger avoiding exposure of sensitive fields (passwords, tokens, PAN, etc.)
 */
const maskSensitiveFields = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sensitiveKeys = ['password', 'token', 'secret', 'pan', 'aadhaar', 'account_number', 'cardNumber'];
  const sanitized = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = maskSensitiveFields(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, JSON.stringify(maskSensitiveFields(meta)));
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, JSON.stringify(maskSensitiveFields(meta)));
  },
  error: (message, error = {}) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, error.stack || error);
  },
};

module.exports = logger;
