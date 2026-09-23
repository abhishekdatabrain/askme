// AskMe Frontend Central API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/adminauth/login`,
    REGISTER: `${API_BASE_URL}/adminauth/register`,
    CREATOR_REGISTER: `${API_BASE_URL}/auth/creator/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  CREATORS: {
    REGISTER: `${API_BASE_URL}/creators/register`,
    LOGIN: `${API_BASE_URL}/creators/login`,
    GOOGLE_AUTH: `${API_BASE_URL}/creators/google-auth`,
    WHATSAPP_SEND_OTP: `${API_BASE_URL}/creators/whatsapp-otp/send`,
    WHATSAPP_VERIFY_OTP: `${API_BASE_URL}/creators/whatsapp-otp/verify`,
    TRUECALLER_AUTH: `${API_BASE_URL}/creators/truecaller-auth`,
    LIST: `${API_BASE_URL}/admin/creators`,
    SUBMIT_KYC: `${API_BASE_URL}/creators/kyc`,
    KYC_STATUS: `${API_BASE_URL}/creators/kyc/status`,
    PROFILE: `${API_BASE_URL}/creators/profile`,
    LIVE_SESSIONS: `${API_BASE_URL}/creators/live-sessions`,
    PAY_SESSION: `${API_BASE_URL}/creators/pay/session`,
    PAY_PROCESS: `${API_BASE_URL}/creators/pay/process`,
    OVERLAY_DATA: `${API_BASE_URL}/creators/overlay/data`,
    OVERLAY_ALERTS: `${API_BASE_URL}/creators/overlay/alerts`,
    WALLET_DETAILS: `${API_BASE_URL}/creators/wallet/details`,
    WALLET_WITHDRAW: `${API_BASE_URL}/creators/wallet/withdraw`,
    WALLET_WITHDRAWALS: `${API_BASE_URL}/creators/wallet/withdrawals`,
    BANK_ACCOUNT: `${API_BASE_URL}/creators/bank-account`,
    CHAT_MESSAGES: `${API_BASE_URL}/creators/live-sessions`,
    CHAT_REPLY: `${API_BASE_URL}/creators/live-sessions/chat/reply`,
    NOTIFICATIONS: `${API_BASE_URL}/creators/notifications`,
    DONATION_STATUS: `${API_BASE_URL}/creators/donations`,
    VERIFY_UPI: `${API_BASE_URL}/creators/verify-upi`,
    VERIFY_PAN: `${API_BASE_URL}/creators/kyc/verify-pan`,
    VERIFY_BANK: `${API_BASE_URL}/creators/kyc/verify-bank`,
    MEMBERSHIPS_PLANS: `${API_BASE_URL}/creators/memberships/plans`,
    MEMBERSHIPS_SUBSCRIBERS: `${API_BASE_URL}/creators/memberships/subscribers`,
  },
  ADMIN: {
    DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
    SEARCH: `${API_BASE_URL}/admin/search`,
    CREATORS: `${API_BASE_URL}/admin/creators`,
    VIEWERS: `${API_BASE_URL}/admin/viewers`,
    KYC: `${API_BASE_URL}/admin/kyc`,
    LIVE_SESSIONS: `${API_BASE_URL}/admin/live-sessions`,
    PAYMENTS: `${API_BASE_URL}/admin/payments`,
    WALLETS: `${API_BASE_URL}/admin/wallets`,
    SETTLE_MONTH: `${API_BASE_URL}/admin/wallet/settle-month`,
    WITHDRAWALS: `${API_BASE_URL}/admin/withdrawals`,
    COMMISSION: `${API_BASE_URL}/admin/commission`,
    REPORTS: `${API_BASE_URL}/admin/reports`,
    NOTIFICATIONS: `${API_BASE_URL}/admin/notifications`,
    OPERATIONS: `${API_BASE_URL}/admin/operations`,
    MEMBERSHIPS_OVERVIEW: `${API_BASE_URL}/admin/memberships/overview`,
    MEMBERSHIPS_PLANS: `${API_BASE_URL}/admin/memberships/plans`,
    MEMBERSHIPS_SUBSCRIPTIONS: `${API_BASE_URL}/admin/memberships/subscriptions`,
    MEMBERSHIPS_CREATORS: `${API_BASE_URL}/admin/memberships/creators`,
    MEMBERSHIPS_ASSIGN: `${API_BASE_URL}/admin/memberships/assign`,
  },
  VIEWERS: {
    REGISTER: `${API_BASE_URL}/viewers/register`,
    LOGIN: `${API_BASE_URL}/viewers/login`,
    GOOGLE_AUTH: `${API_BASE_URL}/viewers/google-auth`,
    WHATSAPP_SEND_OTP: `${API_BASE_URL}/viewers/whatsapp-otp/send`,
    WHATSAPP_VERIFY_OTP: `${API_BASE_URL}/viewers/whatsapp-otp/verify`,
    TRUECALLER_AUTH: `${API_BASE_URL}/viewers/truecaller-auth`,
    TRUECALLER_VIEWER_AUTH: `${API_BASE_URL}/auth/truecaller/viewer`,
    PROFILE: `${API_BASE_URL}/viewers/profile`,
    PUBLIC_LIVE_FEED: `${API_BASE_URL}/viewers/public/live-feed`,
    PUBLIC_CREATOR_PROFILE: `${API_BASE_URL}/viewers/public/creators`,
    FOLLOW: `${API_BASE_URL}/viewers/follow`,
    FOLLOWING: `${API_BASE_URL}/viewers/following`,
    VIP_SUBSCRIBE: `${API_BASE_URL}/viewers/vip/subscribe`,
    VIP_MY_MEMBERSHIPS: `${API_BASE_URL}/viewers/vip/my-memberships`,
    VIP_CANCEL: `${API_BASE_URL}/viewers/vip/cancel`,
    VIP_PLANS: `${API_BASE_URL}/viewers/vip/plans`,
    MY_QUESTIONS: `${API_BASE_URL}/viewers/my-questions`,
    PUBLIC_PAST_STREAMS: `${API_BASE_URL}/viewers/public/past-streams`,
    PUBLIC_CATEGORIES: `${API_BASE_URL}/viewers/public/categories`,
  },
  UPLOAD: `${API_BASE_URL}/upload`,
  KYC: `${API_BASE_URL}/admin/kyc`,
  PAYOUTS: `${API_BASE_URL}/admin/withdrawals`,
  TESTIMONIALS: {
    PUBLIC: `${API_BASE_URL}/public/creator-testimonials`,
    ADMIN: `${API_BASE_URL}/admin/creator-testimonials`,
  },
  CONTACT: {
    SUBMIT: `${API_BASE_URL}/contact/submit`,
    MESSAGES: `${API_BASE_URL}/contact/messages`,
    MY_TICKETS: `${API_BASE_URL}/contact/my-tickets`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/contact/messages/${id}/status`,
  },
  TICKETS: {
    CREATE: `${API_BASE_URL}/tickets/create`,
    MY_TICKETS: `${API_BASE_URL}/tickets/my-tickets`,
    ADMIN_ALL: `${API_BASE_URL}/tickets/admin/all`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/tickets/admin/${id}/status`,
    APPROVE_PAYOUT: (id) => `${API_BASE_URL}/tickets/admin/${id}/approve-payout`,
  },
};

/**
 * Get accessible media URL for images/documents stored in backend or external URLs
 * @param {string} path - Upload path (e.g. /uploads/profiles/123.png) or external URL
 * @returns {string} Complete image/file URL for preview
 */
export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const backendBase = SOCKET_URL || 'http://localhost:5000';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${backendBase}${cleanPath}`;
};

