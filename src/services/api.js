import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://castelo-group-back.test/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Cuando se envía FormData, eliminar Content-Type para que el navegador
  // lo genere con el boundary correcto (ej: multipart/form-data; boundary=---xyz)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

const BACKEND = (process.env.REACT_APP_API_URL || 'http://castelo-group-back.test/api').replace('/api', '');

/** Convierte URLs relativas de storage (/storage/...) a absolutas del backend */
export function storageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND}${url.startsWith('/') ? '' : '/'}${url}`;
}

export const propertiesService = {
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
  uploadMedia: (id, formData) => api.post(`/properties/${id}/media`, formData),
  deleteMedia: (propertyId, mediaId) => api.delete(`/properties/${propertyId}/media/${mediaId}`),
};

export const authService = {
  login: (data) => api.post('/login', data),
  register: (data) => api.post('/register', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
  forgotPassword: (data) => api.post('/forgot-password', data),
};

export const affiliatesService = {
  register: (data) => api.post('/affiliates/register', data),
  getDashboard: () => api.get('/affiliates/dashboard'),
  getCommissions: () => api.get('/affiliates/commissions'),
};

export const contactService = {
  send: (data) => api.post('/contacts', data),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getAffiliates: (params) => api.get('/admin/affiliates', { params }),
  updateAffiliateStatus: (id, data) => api.put(`/admin/affiliates/${id}/status`, data),
  getSales: () => api.get('/admin/sales'),
  createSale: (data) => api.post('/admin/sales', data),
  getCommissions: () => api.get('/admin/commissions'),
  approveCommission: (id) => api.put(`/admin/commissions/${id}/approve`),
  markCommissionPaid: (id) => api.put(`/admin/commissions/${id}/paid`),
};
