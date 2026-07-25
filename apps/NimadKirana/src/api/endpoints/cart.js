import apiClient from '../client';
import { ENDPOINTS } from '../../constants/api';

export const getServerCart = () => apiClient.get(ENDPOINTS.CART).then((r) => r.data);

export const addCartItem = (productId, variantId, quantity = 1) =>
  apiClient.post(`${ENDPOINTS.CART}/items`, { productId, variantId, quantity }).then((r) => r.data);

export const updateCartItem = (itemId, quantity) =>
  apiClient.patch(`${ENDPOINTS.CART}/items/${itemId}`, { quantity }).then((r) => r.data);

export const removeCartItem = (itemId) =>
  apiClient.delete(`${ENDPOINTS.CART}/items/${itemId}`).then((r) => r.data);

export const clearServerCart = () => apiClient.delete(ENDPOINTS.CART).then((r) => r.data);
