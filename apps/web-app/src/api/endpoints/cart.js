import apiClient from '../client';

export const getServerCart = () => apiClient.get('/cart').then((r) => r.data);
export const addCartItem = (productId, variantId, quantity = 1) =>
  apiClient.post('/cart/items', { productId, variantId, quantity }).then((r) => r.data);
