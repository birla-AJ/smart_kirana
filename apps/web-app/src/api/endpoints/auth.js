import apiClient from '../client';

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
  apiClient.post('/auth/otp/send', { mobile, purpose: 'LOGIN' }).then((r) => r.data);

export const verifyOtp = (mobile, code) =>
  apiClient.post('/auth/otp/login', { mobile, code, purpose: 'LOGIN' }).then(unwrapAuth);

// --- Email / User ID / Mobile + Password ---
export const loginWithPassword = (identifier, password) =>
  apiClient.post('/auth/login', { identifier, password }).then(unwrapAuth);

// --- Registration ---
export const registerCustomer = (payload) => apiClient.post('/auth/register', payload).then((r) => r.data);

export const verifyRegistrationOtp = (mobile, code) =>
  apiClient.post('/auth/register/verify-otp', { mobile, code, purpose: 'REGISTER' }).then(unwrapAuth);

// --- Forgot / Reset password ---
export const forgotPassword = (identifier) =>
  apiClient.post('/auth/forgot-password', { identifier }).then((r) => r.data);

export const resetPassword = (identifier, otpCode, newPassword) =>
  apiClient.post('/auth/reset-password', { identifier, otpCode, newPassword }).then((r) => r.data);
