import apiClient from '../client';
import { ENDPOINTS } from '../../constants/api';

export const getCategories = (params) =>
  apiClient.get(ENDPOINTS.CATEGORIES, { params }).then((r) => r.data);

export const getBanners = (params) =>
  apiClient.get(ENDPOINTS.BANNERS, { params }).then((r) => r.data);

export const getProducts = (params) =>
  apiClient.get(ENDPOINTS.PRODUCTS, { params }).then((r) => r.data);

export const getProductById = (id) =>
  apiClient.get(`${ENDPOINTS.PRODUCTS}/${id}`).then((r) => r.data);
