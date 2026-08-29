const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Admin = require('../models/AdminModel');
const CreatorsModel = require('../models/CreatorsModel');

/**
 * Dynamic Authentication Middleware: Verify JWT Token across all secrets and fetch user from PostgreSQL DB
 */
const protect = async (req, res, next) => {
  try {
    let token = null;

    // Get Authorization header
    const authHeader = req.headers.authorization;

    console.log("Authorization Header:", authHeader);

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    console.log("Token:", token);

    if (!token || token === "undefined" || token === "null") {
      return res.status(401).json({
        status: "fail",
        message: "Access denied. Authorization token is required.",
      });
    }

    // Verify JWT
    let decoded = null;

    const secrets = [
      process.env.JWT_SECRET,
      process.env.JWT_ACCESS_SECRET,
      "ask_me_super_secret_jwt_key_2026",
      "ask_me_default_jwt_secret",
    ].filter(Boolean);

    for (const secret of secrets) {
      try {
        decoded = jwt.verify(token, secret);
        break;
      } catch (error) {
        // Try next secret
      }
    }

    // DO NOT use jwt.decode() fallback
    if (!decoded) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid or expired token. Please log in again.",
      });
    }

    console.log("Decoded JWT:", decoded);

    const userId = decoded.id || decoded.userId || decoded.user_id;

    if (!userId) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid token. User ID not found.",
      });
    }

    const tokenRole = String(decoded.role || "").toLowerCase();

    let user = null;

    // Creator
    if (tokenRole === "creator") {
      user = await CreatorsModel.findByPk(userId);
    }

    // Admin
    else if (tokenRole === "admin" || tokenRole === "superadmin") {
      user = await Admin.findByPk(userId);
    }

    // Normal viewer/user
    else {
      user = await User.findByPk(userId);
    }

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User account not found.",
      });
    }

    // Attach authenticated user
    req.user = user;

    next();

  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error);

    return res.status(401).json({
      status: "fail",
      message: "Invalid or expired token. Please log in again.",
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


module.exports = {
  protect,
  authorize,
  restrictTo: authorize,
};
