import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject demo auth header
api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('parkease_demo_user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user?.email) {
        config.headers['x-demo-email'] = user.email;
      }
    } catch (e) {
      console.error('Error parsing stored demo user', e);
    }
  }
  return config;
});

// Authentication / Demo Identity API
export const authApi = {
  demoLogin: (data) => api.post('/auth/demo-login', data),
  switchRole: (data) => api.put('/auth/switch-role', data),
  getMe: () => api.get('/auth/me'),
};

// Facility API
export const facilityApi = {
  getAll: (params) => api.get('/facilities', { params }),
  getById: (id) => api.get(`/facilities/${id}`),
  create: (data) => api.post('/facilities', data),
  update: (id, data) => api.put(`/facilities/${id}`, data),
  delete: (id, params) => api.delete(`/facilities/${id}`, { params }),
  getMyFacilities: () => api.get('/facilities/operator/mine'),
  toggleFavorite: (id) => api.put(`/facilities/${id}/favorite`),
  getRecommendations: (params) => api.get('/facilities/recommendations', { params }),
};

// Slot API
export const slotApi = {
  getByFacility: (facilityId) => api.get(`/slots/facility/${facilityId}`),
  getById: (id) => api.get(`/slots/${id}`),
  create: (facilityId, data) => api.post(`/slots/facility/${facilityId}`, data),
  createBulk: (facilityId, data) => api.post(`/slots/facility/${facilityId}/bulk`, data),
  updateStatus: (id, status) => api.put(`/slots/${id}/status`, { status }),
  update: (id, data) => api.put(`/slots/${id}`, data),
  delete: (id) => api.delete(`/slots/${id}`),
};

// Reservation API
export const reservationApi = {
  create: (data) => api.post('/reservations', data),
  getMy: (params) => api.get('/reservations/my', { params }),
  getAll: (params) => api.get('/reservations', { params }),
  getById: (id) => api.get(`/reservations/${id}`),
  checkIn: (id) => api.put(`/reservations/${id}/checkin`),
  checkOut: (id) => api.put(`/reservations/${id}/checkout`),
  cancel: (id, reason) => api.put(`/reservations/${id}/cancel`, { reason }),
  extend: (id, additionalHours) => api.put(`/reservations/${id}/extend`, { additionalHours }),
  delete: (id) => api.delete(`/reservations/${id}`),
};

// Vehicles API
export const vehicleApi = {
  getAll: () => api.get('/vehicles'),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  setDefault: (id) => api.put(`/vehicles/${id}/default`),
};

// Notifications API
export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Reviews API
export const reviewApi = {
  getByFacility: (facilityId) => api.get(`/reviews/facility/${facilityId}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  getMyReviews: () => api.get('/reviews/my'),
};

// Analytics API
export const analyticsApi = {
  getAdminStats: () => api.get('/analytics/admin'),
  getReservationsOverTime: (days) => api.get('/analytics/admin/reservations-over-time', { params: { days } }),
  getOccupancy: () => api.get('/analytics/admin/occupancy'),
  getPeakHours: () => api.get('/analytics/admin/peak-hours'),
  getPopularFacilities: () => api.get('/analytics/admin/popular-facilities'),
  getDurationDistribution: () => api.get('/analytics/admin/duration-distribution'),
  getOperatorStats: () => api.get('/analytics/operator'),
  getDriverStats: () => api.get('/analytics/driver'),
};

// Users API (Admin)
export const userApi = {
  getAll: (params) => api.get('/users', { params }),
  toggleActive: (id) => api.put(`/users/${id}/toggle`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  updateProfile: (data) => api.put('/users/profile', data),
  getFavorites: () => api.get('/users/favorites'),
  delete: (id) => api.delete(`/users/${id}`),
};

// Seed / Demo API
export const seedApi = {
  run: () => api.post('/seed/run'),
  resetSessions: () => api.post('/seed/reset-sessions'),
};

export default api;
