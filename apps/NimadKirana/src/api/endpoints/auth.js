import apiClient from '../client';
import { ENDPOINTS } from '../../constants/api';

const unwrapAuth = (r) => {
  const data = r.data?.data ?? r.data;
  return {
    user: data.user,
    accessToken: data.tokens?.accessToken,
    refreshToken: data.tokens?.refreshToken,
  };
};

// --- Mobile + OTP (passwordless, auto-registers on first verify) ---
export const sendOtp = (mobile) =>
  apiClient.post(ENDPOINTS.AUTH.SEND_OTP, { mobile, purpose: 'LOGIN' }).then((r) => r.data);

export const verifyOtp = (mobile, code, deviceId) =>
  apiClient
    .post(ENDPOINTS.AUTH.VERIFY_OTP, { mobile, code, purpose: 'LOGIN', deviceId })
    .then(unwrapAuth);

// --- Email / User ID / Mobile + Password ---
export const loginWithPassword = (identifier, password, deviceId) =>
  apiClient.post('/auth/login', { identifier, password, deviceId }).then(unwrapAuth);

// --- Registration (sets a password, still verified via OTP) ---
export const registerCustomer = (payload) =>
  apiClient.post('/auth/register', payload).then((r) => r.data);

export const verifyRegistrationOtp = (mobile, code, deviceId) =>
  apiClient
    .post('/auth/register/verify-otp', { mobile, code, purpose: 'REGISTER', deviceId })
    .then(unwrapAuth);

// --- Forgot / Reset password (identifier = mobile, email, or User ID) ---
export const forgotPassword = (identifier) =>
  apiClient.post('/auth/forgot-password', { identifier }).then((r) => r.data);

export const resetPassword = (identifier, otpCode, newPassword) =>
  apiClient.post('/auth/reset-password', { identifier, otpCode, newPassword }).then((r) => r.data);

export const refreshToken = (token) =>
  apiClient.post(ENDPOINTS.AUTH.REFRESH, { refreshToken: token }).then((r) => r.data);

export const logout = () => apiClient.post(ENDPOINTS.AUTH.LOGOUT).then((r) => r.data);
