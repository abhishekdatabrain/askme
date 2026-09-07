/**
 * Production-Grade Creator Controller
 * Maps incoming HTTP requests to Creator Services, normalizing input parameters,
 * enforcing authorization ownership, and returning standardized API responses.
 */

const { getAuthenticatedCreatorId, normalizeCreatorInput } = require("../../utils/normalizeInput")
const {
  registerCreatorService,
  loginCreatorService,
  googleAuthCreatorService,
  getCreatorProfileService,
  updateCreatorProfileService,
  getCreatorBankAccountService,
  saveCreatorBankAccountService,
  verifyCreatorUpiService,
} = require("../services/creatorService");
const {
  submitKycService,
  getKycStatusService,
} = require("../services/kycService");
const {
  createLiveSessionService,
  getLiveSessionsService,
  closeLiveSessionService,
  startLiveSessionByIdService,
  getPublicSessionDetailsService,
  getSessionQuestionsService,
} = require("../services/liveSessionService");
const {
  processViewerDonationService,
  handlePaymentWebhookService,
} = require("../services/paymentService");
const {
  getCreatorWalletDetailsService,
} = require("../services/walletService");
const {
  requestWithdrawalService,
  getCreatorWithdrawalsService,
} = require("../services/withdrawalService");
const {
  getSessionMessagesService,
  replyToDonationService,
  getOverlayDataService,
  getOverlayAlertsService,
  updateDonationStatusService,
} = require("../services/chatService");
const {
  createCreatorNotificationService,
  getCreatorNotificationsService,
  markCreatorNotificationsReadService,
  markSingleCreatorNotificationReadService,
} = require("../services/notificationService");
const {
  getCreatorMembershipPlansService,
  createCreatorMembershipPlanService,
  updateCreatorMembershipPlanService,
  deleteCreatorMembershipPlanService,
  getCreatorSubscribersService,
} = require("../services/membershipService");

/**
 * Register a new Creator
 */
const registerCreator = async (req, res, next) => {
  try {
    const result = await registerCreatorService(req.body);
    return res.status(201).json({
      status: "success",
      message: "Creator registered successfully.",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Creator Login
 */
const loginCreator = async (req, res, next) => {
  try {
    const result = await loginCreatorService(req.body);
    return res.status(200).json({
      status: "success",
      message: "Creator login successful!",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Google Auth Creator Login / Register
 */
const googleAuthCreator = async (req, res, next) => {
  try {
    const result = await googleAuthCreatorService(req.body);
    return res.status(200).json({
      status: "success",
      message: "Creator Google authentication successful!",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Submit KYC Application
 */
const submitKyc = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req) || req.body.creatorId || req.body.creator_id;
    if (!creatorId) {
      return res.status(400).json({ status: "fail", message: "Creator authentication required." });
    }
    const result = await submitKycService(creatorId, req.body);
    return res.status(201).json({
      status: "success",
      message: "KYC Application & Payout Details submitted successfully! Under admin verification.",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Get KYC Verification Status
 */
const getKycStatus = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req) || req.query.creatorId || req.query.creator_id;
    if (!creatorId) {
      return res.status(400).json({ status: "fail", message: "Creator authentication required." });
    }
    const result = await getKycStatusService(creatorId);
    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Get Creator Profile
 */
const getCreatorProfile = async (req, res, next) => {
  try {
    const inputs = normalizeCreatorInput(req.body, req.query, req.params);
    const creatorId = getAuthenticatedCreatorId(req) || inputs.creatorId;
    if (!creatorId) {
      return res.status(400).json({ status: "fail", message: "Creator ID is required." });
    }
    const result = await getCreatorProfileService(creatorId);
    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Update Creator Profile
 */
const updateCreatorProfile = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req) || req.body.creatorId;
    if (!creatorId) {
      return res.status(400).json({ status: "fail", message: "Creator authentication required." });
    }
    const result = await updateCreatorProfileService(creatorId, req.body);
    return res.status(200).json({
      status: "success",
      message: "Profile management settings saved successfully!",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Start / Create a new Live Session
 */
const createLiveSession = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req) || req.body.creatorId;
    if (!creatorId) {
      return res.status(400).json({ status: "fail", message: "Creator authentication required." });
    }
    const result = await createLiveSessionService(creatorId, req.body);
    return res.status(201).json({
      status: "success",
      message: "Live Donation Session created successfully!",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Get Creator Live Sessions List
 */
const getLiveSessions = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req) || req.query.creatorId;
    if (!creatorId) {
      return res.status(400).json({ status: "fail", message: "Creator authentication required." });
    }
    const result = await getLiveSessionsService(creatorId, req.query);
    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Close Live Session
 */
const closeLiveSession = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req);
    const { id } = req.params;
    const result = await closeLiveSessionService(id, creatorId);
    return res.status(200).json({
      status: "success",
      message: "Live session closed successfully",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Start Live Session by ID
 */
const startLiveSessionById = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req);
    const { id } = req.params;
    const result = await startLiveSessionByIdService(id, creatorId);
    return res.status(200).json({
      status: "success",
      message: `Live session is now LIVE!`,
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Get Public Live Session Details
 */
const getPublicSessionDetails = async (req, res, next) => {
  try {
    const { sessionCode } = req.params;
    const result = await getPublicSessionDetailsService(sessionCode);
    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Process Viewer Donation
 */
const processViewerDonation = async (req, res, next) => {
  try {
    const result = await processViewerDonationService(req.body, req.user);
    return res.status(200).json({
      status: "success",
      message: `Payment of ₹${result.amount.toFixed(2)} completed successfully!`,
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Payment Gateway Webhook
 */
const handlePaymentWebhook = async (req, res, next) => {
  try {
    const result = await handlePaymentWebhookService(req.body, req.headers);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(200).json({ status: "success", message: "Webhook processed" });
  }
};

/**
 * Get OBS Overlay Data
 */
const getOverlayData = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const result = await getOverlayDataService(identifier);
    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Get OBS Overlay Alerts
 */
const getOverlayAlerts = async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    const result = await getOverlayAlertsService(creatorId, req.query);
    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Get Creator Wallet Details & Transaction History
 */
const getCreatorWalletDetails = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req) || req.query.creatorId;
    if (!creatorId) {
      return res.status(400).json({ status: "fail", message: "Creator authentication required." });
    }
    const result = await getCreatorWalletDetailsService(creatorId, req.query);
    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Request Payout Withdrawal
 */
const requestWithdrawal = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req) || req.body.creatorId;
    if (!creatorId) {
      return res.status(400).json({ status: "fail", message: "Creator authentication required." });
    }
    const result = await requestWithdrawalService(creatorId, req.body);
    return res.status(200).json({
      status: "success",
      message: `Payout withdrawal request of ₹${result.amount.toFixed(2)} submitted successfully! Admin will settle to your bank account.`,
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Get Creator Withdrawals History
 */
const getCreatorWithdrawals = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req) || req.query.creatorId;
    if (!creatorId) {
      return res.status(400).json({ status: "fail", message: "Creator authentication required." });
    }
    const result = await getCreatorWithdrawalsService(creatorId, req.query);
    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Get Creator Saved Bank Account
 */
const getCreatorBankAccount = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req) || req.query.creatorId;
    if (!creatorId) {
      return res.status(400).json({ status: "fail", message: "Creator authentication required." });
    }
    const bankAccount = await getCreatorBankAccountService(creatorId);
    return res.status(200).json({
      status: "success",
      data: { bankAccount },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Save Creator Bank Account
 */
const saveCreatorBankAccount = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req) || req.body.creatorId;
    if (!creatorId) {
      return res.status(400).json({ status: "fail", message: "Creator authentication required." });
    }
    const bankAccount = await saveCreatorBankAccountService(creatorId, req.body);
    return res.status(200).json({
      status: "success",
      message: "Bank account / payout details saved successfully!",
      data: { bankAccount },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Verify UPI ID
 */
const verifyCreatorUpi = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req) || req.body.creatorId;
    const result = await verifyCreatorUpiService(creatorId, req.body.upiId);
    return res.status(200).json({
      status: "success",
      message: "UPI ID Verified",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Get Session Chat Messages
 */
const getSessionMessages = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const result = await getSessionMessagesService(sessionId);
    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Reply to Viewer Donation
 */
const replyToDonation = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req) || req.body.creatorId;
    const result = await replyToDonationService(creatorId, req.body);
    return res.status(200).json({
      status: "success",
      message: "Donation reply sent successfully!",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Trigger & Create Creator Notification
 */
const createCreatorNotification = async (payload) => {
  return await createCreatorNotificationService(payload);
};

/**
 * Get Creator Notifications
 */
const getCreatorNotifications = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req) || req.query.creatorId;
    if (!creatorId) {
      return res.status(400).json({ status: "fail", message: "Creator authentication required." });
    }
    const result = await getCreatorNotificationsService(creatorId);
    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Mark all creator notifications read
 */
const markCreatorNotificationsRead = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req) || req.query.creatorId || req.body.creatorId;
    if (!creatorId) {
      return res.status(400).json({ status: "fail", message: "Creator authentication required." });
    }
    const result = await markCreatorNotificationsReadService(creatorId);
    return res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Mark single creator notification read
 */
const markSingleCreatorNotificationRead = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req);
    const { id } = req.params;
    const result = await markSingleCreatorNotificationReadService(id, creatorId);
    return res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Update Donation Status ('read' or 'cancelled')
 */
const updateDonationStatus = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req);
    const { id } = req.params;
    const { status } = req.body;
    const result = await updateDonationStatusService(id, status, creatorId);
    return res.status(200).json({
      status: "success",
      message: `Donation status updated to ${status}`,
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Get Session Questions / Donations
 */
const getSessionQuestions = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const result = await getSessionQuestionsService(sessionId, req.query);
    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Get Creator Membership Tier Plans
 */
const getCreatorMembershipPlans = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req) || req.query.creatorId;
    const result = await getCreatorMembershipPlansService(creatorId);
    return res.status(200).json({
      status: "success",
      total: result.plans.length,
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Create Creator Membership Plan
 */
const createCreatorMembershipPlan = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req) || req.body.creatorId;
    if (!creatorId) {
      return res.status(400).json({ status: "fail", message: "Creator authentication required." });
    }
    const result = await createCreatorMembershipPlanService(creatorId, req.body);
    return res.status(201).json({
      status: "success",
      message: "New Membership Tier created & published live!",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Update Creator Membership Plan
 */
const updateCreatorMembershipPlan = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req);
    const { id } = req.params;
    const result = await updateCreatorMembershipPlanService(creatorId, id, req.body);
    return res.status(200).json({
      status: "success",
      message: "Membership Tier updated successfully!",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Delete Creator Membership Plan
 */
const deleteCreatorMembershipPlan = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req);
    const { id } = req.params;
    const result = await deleteCreatorMembershipPlanService(creatorId, id);
    return res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

/**
 * Get Creator Active Subscribers
 */
const getCreatorSubscribers = async (req, res, next) => {
  try {
    const creatorId = getAuthenticatedCreatorId(req) || req.query.creatorId;
    if (!creatorId) {
      return res.status(400).json({ status: "fail", message: "Creator authentication required." });
    }
    const result = await getCreatorSubscribersService(creatorId);
    return res.status(200).json({
      status: "success",
      total: result.total,
      data: { subscribers: result.subscribers },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ status: "fail", message: error.message });
    }
    next(error);
  }
};

module.exports = {
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
  createCreatorNotification,
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
};