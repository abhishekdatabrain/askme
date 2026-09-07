const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middlewares/authMiddleware');
const { validate } = require('../../middlewares/validateMiddleware');
const {
  creatorListQuerySchema,
  creatorIdParamSchema,
  kycReviewSchema,
  withdrawalStatusSchema,
  walletAdjustmentSchema,
  commissionSettingsSchema,
  platformSettingsSchema,
} = require('../validators/adminValidators');

const {
  getDashboardOverview,
  getCreators,
  getCreatorById,
  approveCreatorKyc,
  rejectCreatorKyc,
  toggleBlockCreator,
  deleteCreator,
  getKycList,
  approveKyc,
  rejectKyc,
  getLiveSessions,
  disableLiveSession,
  getPayments,
  getCreatorWallets,
  getCommissionLedger,
  updateCreatorBalance,
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  markWithdrawalPaid,
  updateWithdrawalStatus,
  getCommissionSettings,
  updateCommissionSettings,
  getReportsAnalytics,
  getNotifications,
  markNotificationsRead,
  markSingleNotificationRead,
  getPlatformSettings,
  updatePlatformSettings,
  globalAdminSearch,
  getViewers,
  getViewerById,
  toggleBlockViewer,
  processWithdrawal,
  completeWithdrawal,
  settleMonth,
} = require('../controllers/adminController');

// All Admin Routes require Authentication & Admin Authorization (RBAC)
router.use(protect);
router.use(authorize('admin'));

// 0. Global Admin Search
router.get('/search', globalAdminSearch);

// 1. Dashboard & Analytics Overview
router.get('/dashboard', getDashboardOverview);

// 2. Creator Management
router.get('/creators', validate(creatorListQuerySchema, 'query'), getCreators);
router.get('/creators/:id', getCreatorById);
router.put('/creators/:id/approve-kyc', approveCreatorKyc);
router.put('/creators/:id/reject-kyc', validate(kycReviewSchema, 'body'), rejectCreatorKyc);
router.put('/creators/:id/toggle-block', toggleBlockCreator);
router.put('/creators/:id/block', toggleBlockCreator);
router.post('/creators/:id/block', toggleBlockCreator);
router.delete('/creators/:id', deleteCreator);

// 2.5 Viewer Management
router.get('/viewers', getViewers);
router.get('/viewers/:id', getViewerById);
router.put('/viewers/:id/toggle-block', toggleBlockViewer);
router.put('/viewers/:id/block', toggleBlockViewer);

// 3. KYC Queue Management
router.get('/kyc', getKycList);
router.put('/kyc/:id/approve', approveKyc);
router.put('/kyc/:id/reject', validate(kycReviewSchema, 'body'), rejectKyc);

// 4. Live Session Management
router.get('/live-sessions', getLiveSessions);
router.put('/live-sessions/:id/disable', disableLiveSession);

// 5. Payment & Revenue Tracking
router.get('/payments', getPayments);

// 6. Creator Wallets Management & Monthly Settlement
router.get('/wallets', getCreatorWallets);
router.get('/commission-ledger', getCommissionLedger);
router.put('/wallets/:creatorId/balance', validate(walletAdjustmentSchema, 'body'), updateCreatorBalance);
router.put('/wallets/:id/balance', validate(walletAdjustmentSchema, 'body'), updateCreatorBalance);
router.post('/wallet/settle-month', settleMonth);

// 7. Withdrawals Management
router.get('/withdrawals', getWithdrawals);
router.put('/withdrawals/:id/approve', approveWithdrawal);
router.patch('/withdrawals/:id/approve', approveWithdrawal);
router.put('/withdrawals/:id/process', processWithdrawal);
router.patch('/withdrawals/:id/process', processWithdrawal);
router.put('/withdrawals/:id/complete', completeWithdrawal);
router.patch('/withdrawals/:id/complete', completeWithdrawal);
router.put('/withdrawals/:id/reject', validate(kycReviewSchema, 'body'), rejectWithdrawal);
router.patch('/withdrawals/:id/reject', validate(kycReviewSchema, 'body'), rejectWithdrawal);
router.put('/withdrawals/:id/pay', markWithdrawalPaid);
router.patch('/withdrawals/:id/pay', markWithdrawalPaid);
router.put('/withdrawals/:id/status', validate(withdrawalStatusSchema, 'body'), updateWithdrawalStatus);
router.patch('/withdrawals/:id/status', validate(withdrawalStatusSchema, 'body'), updateWithdrawalStatus);

// 8. Commission Settings
router.get('/commission', getCommissionSettings);
router.put('/commission', validate(commissionSettingsSchema, 'body'), updateCommissionSettings);

// 9. Reports & Analytics
router.get('/reports', getReportsAnalytics);

// 10. Admin Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/mark-read', markNotificationsRead);
router.put('/notifications/:id/read', markSingleNotificationRead);

// 11. Platform Operations & Settings
router.get('/operations', getPlatformSettings);
router.put('/operations', validate(platformSettingsSchema, 'body'), updatePlatformSettings);

module.exports = router;
