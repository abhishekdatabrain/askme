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
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  markWithdrawalPaid,
  getCommissionSettings,
  updateCommissionSettings,
  getReportsAnalytics,
  getNotifications,
  markNotificationsRead,
  getPlatformSettings,
  updatePlatformSettings,
} = require('../controllers/adminController');

// All Admin Routes require Authentication & Admin Authorization
router.use(protect);
router.use(authorize('admin'));

// 1. Dashboard Overview
router.get('/dashboard', getDashboardOverview);

// 2. Creator Management
router.get('/creators', getCreators);
router.get('/creators/:id', getCreatorById);
router.put('/creators/:id/approve-kyc', approveCreatorKyc);
router.put('/creators/:id/reject-kyc', rejectCreatorKyc);
router.put('/creators/:id/block', toggleBlockCreator);
router.delete('/creators/:id', deleteCreator);

// 3. KYC Queue
router.get('/kyc', getKycList);
router.put('/kyc/:id/approve', approveKyc);
router.put('/kyc/:id/reject', rejectKyc);

// 4. Live Sessions
router.get('/live-sessions', getLiveSessions);
router.put('/live-sessions/:id/disable', disableLiveSession);

// 5. Payment Transactions
router.get('/payments', getPayments);

// 6. Wallets & Commission Ledger
router.get('/wallets/creators', getCreatorWallets);
router.get('/wallets/ledger', getCommissionLedger);

// 7. Withdrawals & Payouts
router.get('/withdrawals', getWithdrawals);
router.put('/withdrawals/:id/approve', approveWithdrawal);
router.put('/withdrawals/:id/reject', rejectWithdrawal);
router.put('/withdrawals/:id/mark-paid', markWithdrawalPaid);

// 8. Commission Settings
router.get('/commission', getCommissionSettings);
router.put('/commission', updateCommissionSettings);

// 9. Reports & Analytics
router.get('/reports', getReportsAnalytics);

// 10. Admin Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/mark-read', markNotificationsRead);

// 11. Platform Operations & Settings
router.get('/operations', getPlatformSettings);
router.put('/operations', updatePlatformSettings);

module.exports = router;
