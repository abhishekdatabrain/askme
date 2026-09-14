const jwt = require('jsonwebtoken');

/**
 * Generate JSON Web Token (JWT)
 * @param {string} id - User ID
 * @param {string} role - User Role
 * @returns {string} JWT Token
 */
const generateToken = (id, role = 'viewer') => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'ask_me_default_jwt_secret',
    {
      expiresIn: process.env.JWT_SECRET_EXPIRES,
    }
  );
};

module.exports = generateToken;
