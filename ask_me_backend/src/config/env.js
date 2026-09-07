const dotenv = require('dotenv');
dotenv.config();

/**
 * Validates essential environment variables on application startup.
 * Prevents application from starting up with missing critical credentials in production.
 */
const validateEnv = () => {
  const required = ['JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(`[FATAL] Missing required environment variables: ${missing.join(', ')}`);
  }
};

validateEnv();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'ask_me_super_secret_jwt_key_2026',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'ask_me_super_secret_jwt_key_2026',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  SCHEMA: process.env.SCHEMA || 'Abhishek',
};
