const KYC_STATUS = Object.freeze({
  NOT_SUBMITTED: 'not_submitted',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

const CREATOR_ACCOUNT_STATUS = Object.freeze({
  PENDING: 'pending',
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
});

const WITHDRAWAL_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  PAID: 'completed',
  REJECTED: 'rejected',
});

const PAYMENT_STATUS = Object.freeze({
  CREATED: 'created',
  PENDING: 'pending',
  SUCCESS: 'success',
  SUCCESSFUL: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
});

const WALLET_TRANSACTION_TYPE = Object.freeze({
  DONATION: 'donation',
  COMMISSION: 'commission',
  WITHDRAWAL: 'withdrawal',
  REFUND: 'refund',
  ADJUSTMENT: 'adjustment',
});

// const AUDIT_ACTION = Object.freeze({
//   KYC_APPROVED: 'KYC_APPROVED',
//   KYC_REJECTED: 'KYC_REJECTED',
//   CREATOR_BLOCKED: 'CREATOR_BLOCKED',
//   CREATOR_UNBLOCKED: 'CREATOR_UNBLOCKED',
//   CREATOR_DELETED: 'CREATOR_DELETED',
//   WITHDRAWAL_APPROVED: 'WITHDRAWAL_APPROVED',
//   WITHDRAWAL_REJECTED: 'WITHDRAWAL_REJECTED',
//   WITHDRAWAL_COMPLETED: 'WITHDRAWAL_COMPLETED',
//   WALLET_ADJUSTED: 'WALLET_ADJUSTED',
//   COMMISSION_UPDATED: 'COMMISSION_UPDATED',
//   PLATFORM_SETTINGS_UPDATED: 'PLATFORM_SETTINGS_UPDATED',
// });

module.exports = {
  KYC_STATUS,
  CREATOR_ACCOUNT_STATUS,
  WITHDRAWAL_STATUS,
  PAYMENT_STATUS,
  WALLET_TRANSACTION_TYPE,
  // AUDIT_ACTION,
};
