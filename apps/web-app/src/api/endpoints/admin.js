import apiClient from '../client/adminClient';

// Auth
export const loginAdmin = (email, password) =>
  apiClient.post('/auth/login/admin', { email, password }).then((r) => {
    const data = r.data?.data ?? r.data;
    return { user: data.user, accessToken: data.tokens?.accessToken, refreshToken: data.tokens?.refreshToken };
  });

// Dashboard
export const getDashboardSummary = () => apiClient.get('/dashboard/summary').then((r) => r.data);
export const getRevenueChart = (params) => apiClient.get('/dashboard/revenue-chart', { params }).then((r) => r.data);
export const getTopProducts = (params) => apiClient.get('/dashboard/top-products', { params }).then((r) => r.data);
export const getLowStock = (params) => apiClient.get('/dashboard/low-stock', { params }).then((r) => r.data);
export const getRecentOrders = (params) => apiClient.get('/dashboard/recent-orders', { params }).then((r) => r.data);

// Products (admin CRUD)
export const listProducts = (params) => apiClient.get('/products', { params }).then((r) => r.data);
export const createProduct = (payload) => apiClient.post('/products', payload).then((r) => r.data);
export const updateProduct = (id, payload) => apiClient.patch(`/products/${id}`, payload).then((r) => r.data);
export const deleteProduct = (id) => apiClient.delete(`/products/${id}`).then((r) => r.data);

// Categories
export const listCategories = (params) => apiClient.get('/categories', { params }).then((r) => r.data);
export const createCategory = (payload) => apiClient.post('/categories', payload).then((r) => r.data);
export const updateCategory = (id, payload) => apiClient.patch(`/categories/${id}`, payload).then((r) => r.data);
export const deleteCategory = (id) => apiClient.delete(`/categories/${id}`).then((r) => r.data);

// Orders (admin)
export const listAllOrders = (params) => apiClient.get('/orders', { params }).then((r) => r.data);
export const getOrderById = (id) => apiClient.get(`/orders/${id}`).then((r) => r.data);
export const updateOrderStatus = (id, status) => apiClient.patch(`/orders/${id}/status`, { status }).then((r) => r.data);

// Customers
export const listCustomers = (params) => apiClient.get('/customers', { params }).then((r) => r.data);

// Product Units
export const listProductUnits = () => apiClient.get('/product-units').then((r) => r.data);

// Coupons
export const listCoupons = (params) => apiClient.get('/coupons', { params }).then((r) => r.data);
export const createCoupon = (payload) => apiClient.post('/coupons', payload).then((r) => r.data);

// Roles & Permissions (Super Admin)
export const listRoles = () => apiClient.get('/roles').then((r) => r.data);
export const listPermissionsGrouped = () => apiClient.get('/permissions/grouped').then((r) => r.data);
export const updateRolePermissions = (roleId, permissionNames) =>
  apiClient.put(`/roles/${roleId}/permissions`, { permissionNames }).then((r) => r.data);

// Admin Users (Super Admin)
export const listAdmins = (params) => apiClient.get('/admins', { params }).then((r) => r.data);
export const createAdminUser = (payload) => apiClient.post('/admins', payload).then((r) => r.data);
export const deleteAdminUser = (id) => apiClient.delete(`/admins/${id}`).then((r) => r.data);

// Audit Logs (Super Admin)
export const listAuditLogs = (params) => apiClient.get('/audit-logs', { params }).then((r) => r.data);

// Reports
export const getSalesReport = (params) => apiClient.get('/reports/sales', { params }).then((r) => r.data);
export const getTopCustomersReport = (params) => apiClient.get('/reports/customers/top', { params }).then((r) => r.data);

// Product Images
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};
export const addProductImage = (productId, payload) =>
  apiClient.post(`/products/${productId}/images`, payload).then((r) => r.data);
export const removeProductImage = (productId, imageId) =>
  apiClient.delete(`/products/${productId}/images/${imageId}`).then((r) => r.data);
export const setPrimaryProductImage = (productId, imageId) =>
  apiClient.patch(`/products/${productId}/images/${imageId}/set-primary`).then((r) => r.data);

// Product Variants
export const addProductVariant = (productId, payload) =>
  apiClient.post(`/products/${productId}/variants`, payload).then((r) => r.data);
export const updateProductVariant = (productId, variantId, payload) =>
  apiClient.put(`/products/${productId}/variants/${variantId}`, payload).then((r) => r.data);
export const removeProductVariant = (productId, variantId) =>
  apiClient.delete(`/products/${productId}/variants/${variantId}`).then((r) => r.data);

// Single product fetch (for the edit dialog's Images/Variants sections)
export const getProductById = (id) => apiClient.get(`/products/${id}`).then((r) => r.data);
