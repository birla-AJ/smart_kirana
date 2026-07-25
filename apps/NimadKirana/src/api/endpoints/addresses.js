import apiClient from '../client';

const BASE = '/customers/me/addresses';

export const getAddresses = () => apiClient.get(BASE).then((r) => r.data);

export const createAddress = (payload) => apiClient.post(BASE, payload).then((r) => r.data);

export const setDefaultAddress = (addressId) =>
  apiClient.patch(`${BASE}/${addressId}/set-default`).then((r) => r.data);
