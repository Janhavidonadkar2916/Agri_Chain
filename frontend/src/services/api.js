import axios from 'axios';

const getApiBaseUrl = () => {
  const savedUrl = localStorage.getItem('agrichain_api_url');
  if (savedUrl) return savedUrl.trim();

  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl.trim();

  // If running on a Firebase Hosting domain, automatically point to the Vercel backend
  if (typeof window !== 'undefined' && window.location.hostname) {
    const hostname = window.location.hostname;
    if (hostname.includes('web.app') || hostname.includes('firebaseapp.com')) {
      return 'https://agrichain-lilac.vercel.app';
    }
  }

  return '';
};

export const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  },
});

// Interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agrichain_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/auth/me'),
  changePassword: (data) => api.post('/api/auth/change-password', data),
};

export const farmerService = {
  addBatch: (formData) => api.post('/api/farmer/add-batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyBatches: () => api.get('/api/farmer/my-batches'),
  getBatchDetail: (batchId) => api.get(`/api/farmer/batch/${batchId}`),
};

export const transportService = {
  startShipment: (data) => api.post('/api/transport/start', data),
  completeShipment: (data) => api.post('/api/transport/complete', data),
  getActiveShipments: () => api.get('/api/transport/active-shipments'),
};

export const warehouseService = {
  receiveBatch: (data) => api.post('/api/warehouse/receive', data),
  dispatchBatch: (data) => api.post('/api/warehouse/dispatch', data),
  getInventory: () => api.get('/api/warehouse/inventory'),
};

export const retailerService = {
  receiveProduct: (data) => api.post('/api/retailer/receive', data),
  sellProduct: (data) => api.post('/api/retailer/sell', data),
  getInventory: () => api.get('/api/retailer/inventory'),
};

export const consumerService = {
  verifyBatch: (batchId) => api.get(`/api/consumer/verify/${batchId}`),
};

export const blockchainService = {
  getBlocks: (limit = 50) => api.get(`/api/blockchain/blocks?limit=${limit}`),
  search: (query) => api.get(`/api/blockchain/search?query=${encodeURIComponent(query)}`),
};

export const adminService = {
  getUsers: () => api.get('/api/admin/users'),
  approveUser: (userId, approved) => api.put(`/api/admin/users/${userId}/approve?approved=${approved}`),
  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),
  getAnalytics: () => api.get('/api/admin/analytics'),
};

export default api;
