const express = require('express');
const router = express.Router();
const {
  registerCreator,
  loginCreator,
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
} = require('../controllers/creatorController');

/**
 * @route   GET /api/creators/live-sessions/:sessionId/messages
 * @desc    Get Chat History for a Live Session
 * @access  Public
 */
router.get('/live-sessions/:sessionId/messages', getSessionMessages);

/**
 * @route   POST /api/creators/live-sessions/chat/reply
 * @desc    Creator Replies to a Viewer Donation
 * @access  Public / Private
 */
router.post('/live-sessions/chat/reply', replyToDonation);

/**
 * @route   GET /api/creators/wallet/withdrawals
 * @desc    Get Creator's Withdrawal Requests history
 * @access  Public / Private
 */
router.get('/wallet/withdrawals', getCreatorWithdrawals);

/**
 * @route   GET /api/creators/bank-account
 * @desc    Get Creator's Bank Account / UPI details
 * @access  Public / Private
 */
router.get('/bank-account', getCreatorBankAccount);

/**
 * @route   POST /api/creators/bank-account
 * @desc    Save/Update Creator's Bank Account / UPI details
 * @access  Public / Private
 */
router.post('/bank-account', saveCreatorBankAccount);

/**
 * @route   POST /api/creators/register
 * @desc    Register a new Creator
 * @access  Public
 */
router.post('/register', registerCreator);

/**
 * @route   POST /api/creators/login
 * @desc    Creator Login against creators table
 * @access  Public
 */
router.post('/login', loginCreator);

/**
 * @route   POST /api/creators/kyc
 * @desc    Submit KYC verification & Bank account details
 * @access  Public / Private
 */
router.post('/kyc', submitKyc);

/**
 * @route   GET /api/creators/kyc/status
 * @desc    Get Creator's KYC Verification status
 * @access  Public / Private
 */
router.get('/kyc/status', getKycStatus);

/**
 * @route   GET /api/creators/profile
 * @desc    Get Creator Profile Management details
 * @access  Public / Private
 */
router.get('/profile', getCreatorProfile);

/**
 * @route   PUT /api/creators/profile
 * @desc    Update Creator Profile details (Image, Bio, Social links, Streaming channels, Payment info)
 * @access  Public / Private
 */
router.put('/profile', updateCreatorProfile);

/**
 * @route   POST /api/creators/live-sessions
 * @desc    Start / Create a new Live Donation Session (Requirement 5.2)
 * @access  Public / Private
 */
router.post('/live-sessions', createLiveSession);

/**
 * @route   GET /api/creators/live-sessions
 * @desc    Get Creator's Live Sessions list
 * @access  Public / Private
 */
router.get('/live-sessions', getLiveSessions);

/**
 * @route   PUT /api/creators/live-sessions/:id/close
 * @desc    Close / End a Live Session
 * @access  Public / Private
 */
router.put('/live-sessions/:id/close', closeLiveSession);
router.put('/live-sessions/:id', closeLiveSession);
router.patch('/live-sessions/:id/close', closeLiveSession);
router.patch('/live-sessions/:id', closeLiveSession);
router.delete('/live-sessions/:id', closeLiveSession);

/**
 * @route   PUT /api/creators/live-sessions/:id/start
 * @desc    Start / Activate a Live Session by ID
 * @access  Public / Private
 */
router.put('/live-sessions/:id/start', startLiveSessionById);

/**
 * @route   GET /api/creators/pay/session/:sessionCode
 * @desc    Get Public Live Session Details by Session Code (for Viewer Payment Page)
 * @access  Public
 */
router.get('/pay/session/:sessionCode', getPublicSessionDetails);

/**
 * @route   POST /api/creators/pay/process
 * @desc    Process Viewer Donation Payment for a Live Session
 * @access  Public
 */
router.post('/pay/process', processViewerDonation);

/**
 * @route   POST /api/creators/pay/webhook
 * @desc    Payment Gateway Webhook Endpoint for Real-Time Donation Confirmation
 * @access  Public
 */
router.post('/pay/webhook', handlePaymentWebhook);

/**
 * @route   GET /api/creators/overlay/data/:identifier
 * @desc    Get Live Stream Overlay Data (QR Code, Creator Name, Support Text) for OBS / Streamlabs
 * @access  Public
 */
router.get('/overlay/data/:identifier', getOverlayData);

/**
 * @route   GET /api/creators/overlay/alerts/:creatorId
 * @desc    Get Latest Donation Alerts for OBS Overlay Animation
 * @access  Public
 */
router.get('/overlay/alerts/:creatorId', getOverlayAlerts);

/**
 * @route   GET /api/creators/wallet/details
 * @desc    Get Creator Wallet Details & Transaction History (Requirement 11)
 * @access  Public / Private
 */
router.get('/wallet/details', getCreatorWalletDetails);

/**
 * @route   POST /api/creators/wallet/withdraw
 * @desc    Submit Payout Withdrawal Request to Creator Bank/UPI (Stage 4 & 5)
 * @access  Public / Private
 */
router.post('/wallet/withdraw', requestWithdrawal);

/**
 * @route   GET /api/creators/notifications
 * @desc    Get Creator Notifications (Requirement 13)
 * @access  Public / Private
 */
router.get('/notifications', getCreatorNotifications);

/**
 * @route   PUT /api/creators/notifications/mark-read
 * @desc    Mark all creator notifications as read
 * @access  Public / Private
 */
router.put('/notifications/mark-read', markCreatorNotificationsRead);

/**
 * @route   PUT /api/creators/notifications/:id/read
 * @desc    Mark single creator notification as read
 * @access  Public / Private
 */
router.put('/notifications/:id/read', markSingleCreatorNotificationRead);

/**
 * @route   PUT /api/creators/donations/:id/status
 * @desc    Update donation status to read or cancelled (Requirement: Tick/Cross actions)
 * @access  Public / Private
 */
router.put('/donations/:id/status', updateDonationStatus);

module.exports = router;





