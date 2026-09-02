const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
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
} = require('../controllers/adminController');

// All Admin Routes require Authentication & Admin Authorization
router.use(protect);
router.use(authorize('admin'));

// 1. Dashboard & Analytics Overview
router.get('/dashboard', getDashboardOverview);


// 2. Creator Management
router.get('/creators', getCreators);
router.get('/creators/:id', getCreatorById);
router.put('/creators/:id/approve-kyc', approveCreatorKyc);
router.put('/creators/:id/reject-kyc', rejectCreatorKyc);
router.put('/creators/:id/toggle-block', toggleBlockCreator);
router.put('/creators/:id/block', toggleBlockCreator);
router.post('/creators/:id/block', toggleBlockCreator);
router.delete('/creators/:id', deleteCreator);

// 3. KYC Approval Management
router.get('/kyc', getKycList);
router.put('/kyc/:id/approve', approveKyc);
router.put('/kyc/:id/reject', rejectKyc);

// 4. Live Session Management
router.get('/live-sessions', getLiveSessions);
router.put('/live-sessions/:id/disable', disableLiveSession);

// 5. Payment & Revenue Tracking
router.get('/payments', getPayments);

// 6. Creator Wallets Management
router.get('/wallets', getCreatorWallets);
router.get('/commission-ledger', getCommissionLedger);
router.put('/wallets/:id/balance', updateCreatorBalance);

// 7. Withdrawals Management
router.get('/withdrawals', getWithdrawals);
router.put('/withdrawals/:id/approve', approveWithdrawal);
router.patch('/withdrawals/:id/approve', approveWithdrawal);
router.put('/withdrawals/:id/reject', rejectWithdrawal);
router.patch('/withdrawals/:id/reject', rejectWithdrawal);
router.put('/withdrawals/:id/pay', markWithdrawalPaid);
router.patch('/withdrawals/:id/pay', markWithdrawalPaid);
router.put('/withdrawals/:id/status', updateWithdrawalStatus);
router.patch('/withdrawals/:id/status', updateWithdrawalStatus);

// 8. Commission Settings
router.get('/commission', getCommissionSettings);
router.put('/commission', updateCommissionSettings);

// 9. Reports & Analytics
router.get('/reports', getReportsAnalytics);

// 10. Admin Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/mark-read', markNotificationsRead);
router.put('/notifications/:id/read', markSingleNotificationRead);

// 11. Platform Operations & Settings
router.get('/operations', getPlatformSettings);
router.put('/operations', updatePlatformSettings);

module.exports = router;
