const { AppError } = require('../errors/AppError');
const logger = require('../utils/logger');

/**
 * 404 Not Found Middleware
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Resource Not Found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
};

/**
 * Global Error Handler Middleware
 * Distinguishes operational AppErrors from internal server bugs.
 * Conceals database credentials, stack traces, and internal ORM errors in production.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.errorCode || 'INTERNAL_ERROR';

  // Handle Sequelize Unique Constraint Error (e.g. duplicate email)
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTRY';
    message = err.errors && err.errors.length > 0
      ? err.errors[0].message
      : 'A record with this value already exists.';
  }

  // Handle Sequelize Model Validation Errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.errors
      ? err.errors.map((e) => e.message).join(', ')
      : 'Validation failed for database constraints.';
  }

  // Handle General Sequelize Database Errors
  if (err.name === 'SequelizeDatabaseError') {
    statusCode = 500;
    errorCode = 'DATABASE_ERROR';
    message = 'A database operation error occurred.';
    logger.error('Database Query Error:', err);
  }

  // Log error
  if (statusCode >= 500) {
    logger.error(`[SERVER ERROR] ${req.method} ${req.originalUrl}:`, err);
  } else {
    logger.warn(`[CLIENT ERROR] ${req.method} ${req.originalUrl}: ${message}`, { statusCode, errorCode });
  }

  return res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    code: errorCode,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = {
  notFound,
  errorHandler,
};
