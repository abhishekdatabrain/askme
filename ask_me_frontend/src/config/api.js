// AskMe Frontend Central API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

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
    LIST: `${API_BASE_URL}/admin/creators`,
    SUBMIT_KYC: `${API_BASE_URL}/creators/kyc`,
    KYC_STATUS: `${API_BASE_URL}/creators/kyc/status`,
  },
  ADMIN: {
    DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
    CREATORS: `${API_BASE_URL}/admin/creators`,
    KYC: `${API_BASE_URL}/admin/kyc`,
    LIVE_SESSIONS: `${API_BASE_URL}/admin/live-sessions`,
    PAYMENTS: `${API_BASE_URL}/admin/payments`,
    WALLETS: `${API_BASE_URL}/admin/wallets`,
    WITHDRAWALS: `${API_BASE_URL}/admin/withdrawals`,
    COMMISSION: `${API_BASE_URL}/admin/commission`,
    REPORTS: `${API_BASE_URL}/admin/reports`,
    NOTIFICATIONS: `${API_BASE_URL}/admin/notifications`,
    OPERATIONS: `${API_BASE_URL}/admin/operations`,
  },
  KYC: `${API_BASE_URL}/admin/kyc`,
  PAYOUTS: `${API_BASE_URL}/admin/withdrawals`,
};
