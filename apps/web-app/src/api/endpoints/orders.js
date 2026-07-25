import apiClient from '../client';

export const createOrder = ({ addressId, deliverySlotId, couponCode, paymentMethodType, notes }) =>
  apiClient.post('/orders', { addressId, deliverySlotId, couponCode, paymentMethodType, notes }).then((r) => r.data);

export const getMyOrders = (params) => apiClient.get('/orders/me', { params }).then((r) => r.data);
export const getMyOrderById = (id) => apiClient.get(`/orders/me/${id}`).then((r) => r.data);
