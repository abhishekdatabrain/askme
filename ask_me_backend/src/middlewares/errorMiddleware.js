/**
 * 404 Not Found Middleware
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global Error Handler Middleware (handles Sequelize ORM errors)
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Sequelize Unique Constraint Error (e.g. duplicate email)
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = err.errors && err.errors.length > 0
      ? err.errors[0].message
      : 'A record with this field already exists.';
  }

  // Handle Sequelize Model Validation Errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors
      ? err.errors.map((e) => e.message).join(', ')
      : 'Validation failed for model fields.';
  }

  // Handle General Sequelize Database Errors
  if (err.name === 'SequelizeDatabaseError') {
    statusCode = 400;
    message = `Database query error: ${err.message}`;
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
