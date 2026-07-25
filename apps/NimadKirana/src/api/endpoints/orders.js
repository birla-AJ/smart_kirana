import apiClient from '../client';
import { ENDPOINTS } from '../../constants/api';

export const createOrder = ({ addressId, deliverySlotId, couponCode, paymentMethodType, notes }) =>
  apiClient
    .post(ENDPOINTS.ORDERS, { addressId, deliverySlotId, couponCode, paymentMethodType, notes })
    .then((r) => r.data);

export const getMyOrders = (params) =>
  apiClient.get(`${ENDPOINTS.ORDERS}/me`, { params }).then((r) => r.data);

export const getMyOrderById = (id) =>
  apiClient.get(`${ENDPOINTS.ORDERS}/me/${id}`).then((r) => r.data);

export const cancelMyOrder = (id, reason) =>
  apiClient.patch(`${ENDPOINTS.ORDERS}/me/${id}/cancel`, { reason }).then((r) => r.data);
