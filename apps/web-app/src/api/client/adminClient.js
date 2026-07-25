import axios from 'axios';
import { API_BASE_URL } from '../../config/env';
import { useAdminAuthStore } from '../../store/adminAuthStore';

export const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

adminApiClient.interceptors.request.use((config) => {
  const token = useAdminAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default adminApiClient;
