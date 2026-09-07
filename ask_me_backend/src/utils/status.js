const { ValidationError } = require('../errors/AppError');

/**
 * Validates allowed withdrawal state machine transitions.
 */
const validateWithdrawalTransition = (currentStatus, targetStatus) => {
  const current = (currentStatus || 'pending').toLowerCase();
  const next = (targetStatus || '').toLowerCase();

  const normalizedNext = next === 'paid' ? 'completed' : next;

  if (current === normalizedNext) {
    return normalizedNext;
  }

  const allowedTransitions = {
    pending: ['approved', 'processing', 'completed', 'rejected'],
    approved: ['processing', 'completed', 'rejected', 'pending'],
    processing: ['completed', 'approved', 'rejected', 'pending'],
    completed: ['processing', 'approved', 'pending'],
    rejected: ['pending', 'approved', 'processing'],
  };

  const allowed = allowedTransitions[current] || [];
  if (!allowed.includes(normalizedNext)) {
    throw new ValidationError(
      `Invalid withdrawal status transition from '${current}' to '${normalizedNext}'.`
    );
  }

  return normalizedNext;
};

const normalizePaymentStatus = (rawStatus) => {
  const statusStr = String(rawStatus || 'pending').toLowerCase();
  if (['success', 'successful', 'completed', 'paid'].includes(statusStr)) {
    return 'Successful';
  }
  if (['failed', 'fail', 'error'].includes(statusStr)) {
    return 'Failed';
  }
  if (['refunded', 'refund'].includes(statusStr)) {
    return 'Refunded';
  }
  return 'Pending';
};

module.exports = {
  validateWithdrawalTransition,
  normalizePaymentStatus,
};
