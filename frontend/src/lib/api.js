import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'datadesk_token';

// ── Axios Instance ─────────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ── Request Interceptor: Attach JWT to every request ──────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle auth errors globally ─────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem(TOKEN_KEY);
      // Emit a custom event so the auth store can react without a circular import
      window.dispatchEvent(new CustomEvent('datadesk:auth:expired'));
    }
    return Promise.reject(error);
  }
);

// ── Token Helpers ──────────────────────────────────────────────────────────
export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY),
};

// ── Typed API methods (short, composable helpers) ──────────────────────────
export const api = {
  // Auth
  auth: {
    register: (data) => apiClient.post('/auth/register', data),
    login: (data) => apiClient.post('/auth/login', data),
    forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
    resetPassword: (data) => apiClient.post('/auth/reset-password', data),
    getMe: () => apiClient.get('/auth/me'),
    updateName: (displayName) => apiClient.patch('/auth/me/name', { displayName }),
    updatePassword: (data) => apiClient.patch('/auth/me/password', data),
  },

  // Questions (public)
  questions: {
    getAll: (params) => apiClient.get('/questions', { params }),
    getById: (id) => apiClient.get(`/questions/${id}`),
    getByCompany: (companyId) => apiClient.get(`/questions/company/${companyId}`),
  },

  // Companies (public)
  companies: {
    getAll: (params) => apiClient.get('/companies', { params }),
    getBySlug: (slug) => apiClient.get(`/companies/${slug}`),
  },

  // Progress (protected)
  progress: {
    get: () => apiClient.get('/progress'),
    updateQuestion: (questionId, status) =>
      apiClient.patch('/progress/question', { questionId, status }),
    recordActivity: (question, dbName, status) =>
      apiClient.post('/progress/activity', { question, dbName, status }),
    reset: () => apiClient.delete('/progress/reset'),
  },

  // Leaderboard (public)
  leaderboard: {
    get: (limit) => apiClient.get('/leaderboard', { params: { limit } }),
  },
};
