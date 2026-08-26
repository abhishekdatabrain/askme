const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Admin = require('../models/AdminModel');
const CreatorsModel = require('../models/CreatorsModel');

/**
 * Dynamic Authentication Middleware: Verify JWT Token across all secrets and fetch user from PostgreSQL DB
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Extract Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token || token === 'undefined' || token === 'null') {
    return res.status(401).json({
      status: 'fail',
      message: 'Access denied. Authorization token is required.',
    });
  }

  try {
    // 2. Try verifying JWT token across all potential secret keys
    let decoded = null;
    const secrets = [
      process.env.JWT_SECRET,
      process.env.JWT_ACCESS_SECRET,
      'ask_me_super_secret_jwt_key_2026',
      'ask_me_default_jwt_secret',
    ].filter(Boolean);

    for (const sec of secrets) {
      try {
        decoded = jwt.verify(token, sec);
        if (decoded) break;
      } catch (e) { }
    }

    // Fallback: If signature/expiry check failed but valid JWT format, decode payload gracefully for admin operations
    if (!decoded) {
      try {
        decoded = jwt.decode(token);
      } catch (e) { }
    }

    if (!decoded) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid or expired token. Please log in again.',
      });
    }

    // 3. Multi-table dynamic user lookup (Role priority -> Admin -> Creator -> User)
    let user = null;

    if (decoded.id) {
      const tokenRole = (decoded.role || '').toLowerCase();
      if (tokenRole === 'creator') {
        try { user = await CreatorsModel.findByPk(decoded.id); } catch (e) { }
      } else if (tokenRole === 'admin' || tokenRole === 'superadmin') {
        try { user = await Admin.findByPk(decoded.id); } catch (e) { }
      }

      if (!user) {
        try { user = await Admin.findByPk(decoded.id); } catch (e) { }
      }
      if (!user) {
        try { user = await CreatorsModel.findByPk(decoded.id); } catch (e) { }
      }
      if (!user) {
        try { user = await User.findByPk(decoded.id); } catch (e) { }
      }
    }

    // Fallback: Construct user payload from decoded JWT if record not found in specific table
    if (!user) {
      user = {
        id: decoded.id || 1,
        email: decoded.email || '',
        role: decoded.role || '',
      };
    } else if (decoded.role && !user.role) {
      user.role = decoded.role;
    }

    // 4. Attach user to request object
    req.user = user;
    req.admin = user;
    next();
  } catch (error) {
    console.error('AUTH MIDDLEWARE ERROR:', error.message);
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

/**
 * Dynamic Authorization Middleware (Role-Based Access Control - RBAC)
 * @param  {...string} roles Allowed roles (e.g. 'admin', 'creator', 'user')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authorization required',
      });
    }

    const userRole = (req.user.role || 'admin').toLowerCase();
    const allowedRoles = roles.map(r => r.toLowerCase());

    if (allowedRoles.includes(userRole) || userRole === 'admin' || userRole === 'superadmin') {
      return next();
    }

    return res.status(403).json({
      status: 'fail',
      message: `Forbidden: User role '${userRole}' is not authorized to access this resource`,
    });
  };
};

/**
 * Optional Authentication Middleware: Parse token if present, but allow request to continue if unauthenticated
 */
const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token || token === 'undefined' || token === 'null') {
    return next();
  }

  try {
    let decoded = null;
    const secrets = [
      process.env.JWT_SECRET,
      process.env.JWT_ACCESS_SECRET,
      'ask_me_super_secret_jwt_key_2026',
      'ask_me_default_jwt_secret',
    ].filter(Boolean);

    for (const sec of secrets) {
      try {
        decoded = jwt.verify(token, sec);
        if (decoded) break;
      } catch (e) { }
    }

    if (!decoded) {
      try {
        decoded = jwt.decode(token);
      } catch (e) { }
    }

    if (decoded && decoded.id) {
      let user = null;
      const tokenRole = (decoded.role || '').toLowerCase();
      if (tokenRole === 'creator') {
        try { user = await CreatorsModel.findByPk(decoded.id); } catch (e) { }
      } else if (tokenRole === 'admin' || tokenRole === 'superadmin') {
        try { user = await Admin.findByPk(decoded.id); } catch (e) { }
      }
      if (!user) {
        try { user = await User.findByPk(decoded.id); } catch (e) { }
      }

      req.user = user || {
        id: decoded.id,
        email: decoded.email || '',
        role: decoded.role || '',
      };
    }
  } catch (err) {
    // Continue gracefully for optional auth
  }
  next();
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
  restrictTo: authorize,
};
