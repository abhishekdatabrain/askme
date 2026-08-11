// AskMe Frontend Central API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  CREATORS: `${API_BASE_URL}/creators`,
  KYC: `${API_BASE_URL}/admin/kyc`,
  PAYOUTS: `${API_BASE_URL}/admin/payouts`,
};
