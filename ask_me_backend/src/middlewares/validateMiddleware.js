const { ValidationError } = require('../errors/AppError');

/**
 * Express middleware generator to validate req.body, req.query, or req.params against a Joi schema.
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source] || {};
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return next(new ValidationError(errorMessage));
    }

    req[source] = value;
    next();
  };
};

module.exports = {
  validate,
};
