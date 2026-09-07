const Joi = require('joi');

const creatorListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('', null).trim(),
  status: Joi.string().allow('', null).trim(),
  sortBy: Joi.string().valid('id', 'created_at', 'full_name', 'username').default('id'),
  sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC'),
});

const creatorIdParamSchema = Joi.object({
  id: Joi.alternatives().try(Joi.number().integer().positive(), Joi.string().guid()).required(),
});

const kycReviewSchema = Joi.object({
  reason: Joi.string().max(500).allow('', null),
});

const withdrawalStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'processing', 'completed', 'paid', 'rejected').required(),
  rejectionReason: Joi.string().max(500).allow('', null),
  transactionReference: Joi.string().max(255).allow('', null),
});

const walletAdjustmentSchema = Joi.object({
  type: Joi.string().valid('credit', 'debit').default('credit'),
  amount: Joi.number().positive().required(),
  reason: Joi.string().min(3).max(500).required(),
  availableBalance: Joi.number().min(0).optional(),
  bonusCredit: Joi.number().min(0).optional(),
});

const commissionSettingsSchema = Joi.object({
  platformCommissionPercent: Joi.number().min(0).max(100).optional(),
  commission_percentage: Joi.number().min(0).max(100).optional(),
  minWithdrawalLimit: Joi.number().min(0).optional(),
  minimum_withdrawal_amount: Joi.number().min(0).optional(),
  currency: Joi.string().max(10).default('INR'),
});

const platformSettingsSchema = Joi.object({
  broadcastMessage: Joi.string().max(1000).allow('', null),
  maintenanceMode: Joi.boolean().optional(),
  razorpayKey: Joi.string().allow('', null),
  payuMerchantId: Joi.string().allow('', null),
});

module.exports = {
  creatorListQuerySchema,
  creatorIdParamSchema,
  kycReviewSchema,
  withdrawalStatusSchema,
  walletAdjustmentSchema,
  commissionSettingsSchema,
  platformSettingsSchema,
};
