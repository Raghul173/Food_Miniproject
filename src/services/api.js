import axios from 'axios';
import { handleMockRequest } from './mockApiHandler.js';

/**
 * Axios instance configured with Standalone In-Memory Mock Adapter.
 * All frontend requests are handled locally in browser with localStorage persistence.
 * Zero backend server or database setup required.
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  adapter: async (config) => {
    return handleMockRequest(config);
  }
});

// Interceptor for JWT token compatibility
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 unauthorized to clear invalid session
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
