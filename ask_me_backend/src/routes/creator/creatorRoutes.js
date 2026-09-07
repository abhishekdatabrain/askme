const express = require('express');
const router = express.Router();
const { protect } = require('../../middlewares/authMiddleware');
const {
  registerCreator,
  loginCreator,
  googleAuthCreator,
  submitKyc,
  getKycStatus,
  getCreatorProfile,
  updateCreatorProfile,
  createLiveSession,
  getLiveSessions,
  closeLiveSession,
  startLiveSessionById,
  getPublicSessionDetails,
  processViewerDonation,
  getOverlayData,
  getOverlayAlerts,
  handlePaymentWebhook,
  getCreatorWalletDetails,
  requestWithdrawal,
  getCreatorWithdrawals,
  getCreatorBankAccount,
  saveCreatorBankAccount,
  getSessionMessages,
  replyToDonation,
  getCreatorNotifications,
  markCreatorNotificationsRead,
  markSingleCreatorNotificationRead,
  updateDonationStatus,
  verifyCreatorUpi,
  getSessionQuestions,
  getCreatorMembershipPlans,
  createCreatorMembershipPlan,
  updateCreatorMembershipPlan,
  deleteCreatorMembershipPlan,
  getCreatorSubscribers,
} = require('../../creator/controllers/creatorController');

/**
 * Public Authentication Routes
 */
router.post('/register', registerCreator);
router.post('/login', loginCreator);
router.post('/google-auth', googleAuthCreator);

/**
 * Public Viewer Payment & Overlay Routes
 */
router.get('/pay/session/:sessionCode', getPublicSessionDetails);
router.post('/pay/process', processViewerDonation);
router.post('/pay/webhook', handlePaymentWebhook);
router.get('/overlay/data/:identifier', getOverlayData);
router.get('/overlay/alerts/:creatorId', getOverlayAlerts);
router.get('/live-sessions/:sessionId/messages', getSessionMessages);
router.post('/verify-upi', verifyCreatorUpi);

/**
 * Private Creator Routes (JWT Protected)
 */
// KYC
router.post('/kyc', protect, submitKyc);
router.get('/kyc/status', protect, getKycStatus);

// Profile
router.get('/profile', protect, getCreatorProfile);
router.get('/profile/:id', protect, getCreatorProfile);
router.get('/profile/creator/:creatorId', protect, getCreatorProfile);
router.put('/profile', protect, updateCreatorProfile);
router.put('/profile/:id', protect, updateCreatorProfile);

// Bank Account & UPI
router.get('/bank-account', protect, getCreatorBankAccount);
router.post('/bank-account', protect, saveCreatorBankAccount);

// Live Sessions Management
router.post('/live-sessions', protect, createLiveSession);
router.get('/live-sessions', protect, getLiveSessions);
router.put('/live-sessions/:id/close', protect, closeLiveSession);
router.put('/live-sessions/:id', protect, closeLiveSession);
router.patch('/live-sessions/:id/close', protect, closeLiveSession);
router.patch('/live-sessions/:id', protect, closeLiveSession);
router.delete('/live-sessions/:id', protect, closeLiveSession);
router.put('/live-sessions/:id/start', protect, startLiveSessionById);
router.get('/live-sessions/:sessionId/questions', protect, getSessionQuestions);
router.post('/live-sessions/chat/reply', protect, replyToDonation);

// Wallet & Withdrawals
router.get('/wallet/details', protect, getCreatorWalletDetails);
router.post('/wallet/withdraw', protect, requestWithdrawal);
router.post('/wallet/withdrawals', protect, requestWithdrawal);
router.get('/wallet/withdrawals', protect, getCreatorWithdrawals);

// Notifications & Donation Status Updates
router.get('/notifications', protect, getCreatorNotifications);
router.put('/notifications/mark-read', protect, markCreatorNotificationsRead);
router.put('/notifications/:id/read', protect, markSingleCreatorNotificationRead);
router.put('/donations/:id/status', protect, updateDonationStatus);

// Membership Tier Plans & Subscribers
router.get('/memberships/plans', getCreatorMembershipPlans);
router.post('/memberships/plans', protect, createCreatorMembershipPlan);
router.put('/memberships/plans/:id', protect, updateCreatorMembershipPlan);
router.delete('/memberships/plans/:id', protect, deleteCreatorMembershipPlan);
router.get('/memberships/subscribers', protect, getCreatorSubscribers);

module.exports = router;
