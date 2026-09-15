const jwt = require('jsonwebtoken');

/**
 * Generate JSON Web Token (JWT)
 * @param {string} id - User ID
 * @param {string} role - User Role
 * @returns {string} JWT Token
 */
const generateToken = (id, role = 'viewer') => {
  const secret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'ask_me_super_secret_jwt_key_2026';
  const expiresIn = process.env.JWT_SECRET_EXPIRES || process.env.JWT_ACCESS_EXPIRES || '7d';

  return jwt.sign(
    { id, role },
    secret,
    {
      expiresIn: String(expiresIn || '7d').trim(),
    }
  );
};

module.exports = generateToken;
