const adminDashboardService = require('../services/adminDashboardService');
const creatorAdminService = require('../services/creatorAdminService');
const kycService = require('../services/kycService');
const liveSessionAdminService = require('../services/liveSessionAdminService');
const paymentAdminService = require('../services/paymentAdminService');
const walletService = require('../services/walletService');
const withdrawalService = require('../services/withdrawalService');
const commissionService = require('../services/commissionService');
const notificationService = require('../services/notificationService');
const platformSettingsService = require('../services/platformSettingsService');
const adminSearchService = require('../services/adminSearchService');
const viewerAdminService = require('../services/viewerAdminService');
const monthlySettlementService = require('../services/monthlySettlementService');

const getDashboardOverview = async (req, res, next) => {
  try {
    const data = await adminDashboardService.getOverview();
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

const getCreators = async (req, res, next) => {
  try {
    const result = await creatorAdminService.getCreators(req.query);
    return res.status(200).json({
      status: 'success',
      results: result.results,
      totalCount: result.totalCount,
      pagination: result.pagination,
      data: { creators: result.creators, pagination: result.pagination },
    });
  } catch (error) {
    next(error);
  }
};

const getCreatorById = async (req, res, next) => {
  try {
    const creator = await creatorAdminService.getCreatorById(req.params.id);
    return res.status(200).json({ status: 'success', data: { creator } });
  } catch (error) {
    next(error);
  }
};

const approveCreatorKyc = async (req, res, next) => {
  try {
    const adminId = req.user?.id;
    const result = await kycService.approveKyc(req.params.id, adminId, req);
    return res.status(200).json({
      status: 'success',
      message: 'Creator KYC Approved successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const rejectCreatorKyc = async (req, res, next) => {
  try {
    const adminId = req.user?.id;
    const result = await kycService.rejectKyc(req.params.id, adminId, req.body.reason, req);
    return res.status(200).json({
      status: 'success',
      message: 'Creator KYC Rejected',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const toggleBlockCreator = async (req, res, next) => {
  try {
    const adminId = req.user?.id;
    const result = await creatorAdminService.toggleBlockCreator(req.params.id, adminId, req);
    return res.status(200).json({
      status: 'success',
      message: `Creator status updated to ${result.status === 'blocked' ? 'Blocked' : 'Active'}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCreator = async (req, res, next) => {
  try {
    const adminId = req.user?.id;
    await creatorAdminService.deleteCreator(req.params.id, adminId, req);
    return res.status(200).json({
      status: 'success',
      message: 'Creator deleted successfully from database',
    });
  } catch (error) {
    next(error);
  }
};

const getKycList = async (req, res, next) => {
  try {
    const result = await kycService.getKycList(req.query);
    return res.status(200).json({
      status: 'success',
      results: result.results,
      totalCount: result.totalCount,
      pagination: result.pagination,
      data: { kycApplications: result.kycApplications, submissions: result.submissions, pagination: result.pagination },
    });
  } catch (error) {
    next(error);
  }
};

const approveKyc = async (req, res, next) => {
  try {
    const adminId = req.user?.id;
    const result = await kycService.approveKyc(req.params.id, adminId, req);
    return res.status(200).json({ status: 'success', message: 'KYC approved successfully', data: result });
  } catch (error) {
    next(error);
  }
};

const rejectKyc = async (req, res, next) => {
  try {
    const adminId = req.user?.id;
    const result = await kycService.rejectKyc(req.params.id, adminId, req.body.reason, req);
    return res.status(200).json({ status: 'success', message: 'KYC document rejected successfully', data: result });
  } catch (error) {
    next(error);
  }
};

const getLiveSessions = async (req, res, next) => {
  try {
    const result = await liveSessionAdminService.getLiveSessions(req.query);
    return res.status(200).json({
      status: 'success',
      total: result.total,
      totalCount: result.totalCount,
      pagination: result.pagination,
      data: { sessions: result.sessions, pagination: result.pagination },
    });
  } catch (error) {
    next(error);
  }
};

const disableLiveSession = async (req, res, next) => {
  try {
    const result = await liveSessionAdminService.disableLiveSession(req.params.id);
    return res.status(200).json({ status: 'success', message: `Session status updated to ${result.qrStatus}`, data: result });
  } catch (error) {
    next(error);
  }
};

const getPayments = async (req, res, next) => {
  try {
    const result = await paymentAdminService.getPayments(req.query);
    return res.status(200).json({
      status: 'success',
      total: result.total,
      totalCount: result.totalCount,
      pagination: result.pagination,
      data: { payments: result.payments, transactions: result.transactions, pagination: result.pagination },
    });
  } catch (error) {
    next(error);
  }
};

const getCreatorWallets = async (req, res, next) => {
  try {
    const result = await walletService.getCreatorWallets(req.query);
    return res.status(200).json({
      status: 'success',
      total: result.total,
      totalCount: result.totalCount,
      pagination: result.pagination,
      data: { wallets: result.wallets, pagination: result.pagination },
    });
  } catch (error) {
    next(error);
  }
};

const getCommissionLedger = async (req, res, next) => {
  try {
    const result = await walletService.getCommissionLedger(req.query);
    return res.status(200).json({ status: 'success', data: { ledger: result.ledger } });
  } catch (error) {
    next(error);
  }
};

const updateCreatorBalance = async (req, res, next) => {
  try {
    const adminId = req.user?.id;
    const result = await walletService.adjustWalletBalance(req.params.creatorId || req.params.id, req.body, adminId, req);
    return res.status(200).json({ status: 'success', message: result.message, data: { wallet: result.wallet } });
  } catch (error) {
    next(error);
  }
};

const getWithdrawals = async (req, res, next) => {
  try {
    const result = await withdrawalService.getWithdrawals(req.query);
    return res.status(200).json({
      status: 'success',
      total: result.total,
      totalCount: result.totalCount,
      pagination: result.pagination,
      data: { withdrawals: result.withdrawals, requests: result.requests, pagination: result.pagination },
    });
  } catch (error) {
    next(error);
  }
};

const updateWithdrawalStatus = async (req, res, next) => {
  try {
    const adminId = req.user?.id;
    const result = await withdrawalService.updateWithdrawalStatus(req.params.id, req.body, adminId, req);
    return res.status(200).json({
      status: 'success',
      message: `Withdrawal request status updated to '${result.status}'!`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const approveWithdrawal = async (req, res, next) => {
  req.body.status = 'approved';
  return updateWithdrawalStatus(req, res, next);
};

const rejectWithdrawal = async (req, res, next) => {
  req.body.status = 'rejected';
  return updateWithdrawalStatus(req, res, next);
};

const markWithdrawalPaid = async (req, res, next) => {
  req.body.status = 'completed';
  return updateWithdrawalStatus(req, res, next);
};

const getCommissionSettings = async (req, res, next) => {
  try {
    const settings = await commissionService.getCommissionSettings();
    return res.status(200).json({ status: 'success', data: { commissionSettings: settings } });
  } catch (error) {
    next(error);
  }
};

const updateCommissionSettings = async (req, res, next) => {
  try {
    const adminId = req.user?.id;
    const updated = await commissionService.updateCommissionSettings(req.body, adminId, req);
    return res.status(200).json({
      status: 'success',
      message: 'Commission settings saved to commission_settings database table successfully',
      data: { commissionSettings: updated },
    });
  } catch (error) {
    next(error);
  }
};

const getReportsAnalytics = async (req, res, next) => {
  try {
    const data = await paymentAdminService.getReportsAnalytics(req.query);
    return res.status(200).json({
      status: 'success',
      totalCount: data.pagination.totalCount,
      pagination: data.pagination,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getAdminNotifications();
    return res.status(200).json({ status: 'success', data: { notifications } });
  } catch (error) {
    next(error);
  }
};

const markNotificationsRead = async (req, res, next) => {
  try {
    await notificationService.markNotificationsRead();
    return res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

const markSingleNotificationRead = async (req, res, next) => {
  try {
    await notificationService.markSingleNotificationRead(req.params.id);
    return res.status(200).json({ status: 'success', message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

const getPlatformSettings = async (req, res, next) => {
  try {
    const settings = await platformSettingsService.getSettings();
    return res.status(200).json({ status: 'success', data: { settings } });
  } catch (error) {
    next(error);
  }
};

const updatePlatformSettings = async (req, res, next) => {
  try {
    const adminId = req.user?.id;
    const settings = await platformSettingsService.updateSettings(req.body, adminId, req);
    return res.status(200).json({ status: 'success', message: 'Platform settings updated successfully', data: { settings } });
  } catch (error) {
    next(error);
  }
};

const globalAdminSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    const results = await adminSearchService.globalSearch(q);
    return res.status(200).json({ status: 'success', data: results });
  } catch (error) {
    next(error);
  }
};

const getViewers = async (req, res, next) => {
  try {
    const result = await viewerAdminService.getViewers(req.query);
    return res.status(200).json({
      status: 'success',
      results: result.results,
      totalCount: result.totalCount,
      pagination: result.pagination,
      data: { viewers: result.viewers, pagination: result.pagination },
    });
  } catch (error) {
    next(error);
  }
};

const getViewerById = async (req, res, next) => {
  try {
    const viewer = await viewerAdminService.getViewerById(req.params.id);
    return res.status(200).json({ status: 'success', data: { viewer } });
  } catch (error) {
    next(error);
  }
};

const toggleBlockViewer = async (req, res, next) => {
  try {
    const adminId = req.user?.id;
    const result = await viewerAdminService.toggleBlockViewer(req.params.id, adminId);
    return res.status(200).json({
      status: 'success',
      message: `Viewer status updated to ${result.status}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const processWithdrawal = async (req, res, next) => {
  req.body.status = 'processing';
  return updateWithdrawalStatus(req, res, next);
};

const completeWithdrawal = async (req, res, next) => {
  req.body.status = 'completed';
  return updateWithdrawalStatus(req, res, next);
};

const settleMonth = async (req, res, next) => {
  try {
    const { month, creatorId } = req.body;
    const result = await monthlySettlementService.settleMonthService({ month, creatorId });
    return res.status(200).json({
      status: 'success',
      message: `Monthly settlement execution for ${result.month} completed.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
  processWithdrawal,
  completeWithdrawal,
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
  settleMonth,
};
