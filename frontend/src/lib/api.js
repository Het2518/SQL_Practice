import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


// ── Axios Instance ─────────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  xsrfCookieName: 'csrfToken',
  xsrfHeaderName: 'X-CSRF-Token',
  timeout: 30000,
});

function getCookieValue(name) {
  if (typeof document === 'undefined') return '';
  return document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split('=')[1] || '';
}

let csrfTokenPromise = null;

async function ensureCsrfToken() {
  const existingToken = getCookieValue('csrfToken');
  if (existingToken) return existingToken;

  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch(`${BASE_URL}/auth/csrf`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`CSRF bootstrap failed: HTTP ${response.status}`);
        }

        const payload = await response.json();
        const token = payload?.data?.csrfToken || getCookieValue('csrfToken');
        if (!token) {
          throw new Error('CSRF bootstrap failed: missing token');
        }

        apiClient.defaults.headers.common['X-CSRF-Token'] = token;
        return token;
      })
      .finally(() => {
        csrfTokenPromise = null;
      });
  }

  return csrfTokenPromise;
}

// ── Request Interceptor: (No longer attaching JWT manually, cookie handles it) ──

// ── Response Interceptor: Handle auth errors and Silent Refresh ────────────
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(err = null) {
  refreshSubscribers.forEach(cb => cb(err));
  refreshSubscribers = [];
}

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Prevent retry loops
    if (error.response?.status === 401 && originalRequest.url !== '/auth/refresh' && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((err) => {
            if (err) return reject(err);
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        apiClient.post('/auth/refresh')
          .then(() => {
            isRefreshing = false;
            onRefreshed(null);
            resolve(apiClient(originalRequest));
          })
          .catch((err) => {
            isRefreshing = false;
            onRefreshed(err);
            // Refresh failed, user must log in again
            window.dispatchEvent(new CustomEvent('datadesk:auth:expired'));
            reject(err);
          });
      });
    }

    // If the refresh endpoint itself fails with 401, or generic 401 without retry
    if (error.response?.status === 401 && originalRequest.url === '/auth/refresh') {
      window.dispatchEvent(new CustomEvent('datadesk:auth:expired'));
    }

    return Promise.reject(error);
  }
);

apiClient.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase();
  const isMutating = !['get', 'head', 'options'].includes(method);
  const url = config.url || '';

  if (isMutating && !url.includes('/auth/csrf')) {
    const token = getCookieValue('csrfToken') || (await ensureCsrfToken());
    if (token) {
      config.headers = config.headers || {};
      config.headers['X-CSRF-Token'] = token;
      apiClient.defaults.headers.common['X-CSRF-Token'] = token;
    }
  }

  return config;
});

// ── Token Helpers (Removed, using HttpOnly cookies) ──────────────────────

// ── Typed API methods (short, composable helpers) ──────────────────────────
export const api = {
  // Auth
  auth: {
    getCsrfToken: (config = {}) => apiClient.get('/auth/csrf', config),
    register: (data, config = {}) => apiClient.post('/auth/register', data, config),
    login: (data, config = {}) => apiClient.post('/auth/login', data, config),
    logout: (config = {}) => apiClient.post('/auth/logout', config),
    forgotPassword: (data, config = {}) => apiClient.post('/auth/forgot-password', data, config),
    resetPassword: (data, config = {}) => apiClient.post('/auth/reset-password', data, config),
    getMe: (config = {}) => apiClient.get('/auth/me', config),
    updateName: (displayName, config = {}) => apiClient.patch('/auth/me/name', { displayName }, config),
    updatePassword: (data, config = {}) => apiClient.patch('/auth/me/password', data, config),
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
    recordActivity: (question, dbName, status, sql, executionTimeMs) =>
      apiClient.post('/progress/activity', { question, dbName, status, sql, executionTimeMs }),
    reset: () => apiClient.delete('/progress/reset'),
  },

  // Leaderboard (public)
  leaderboard: {
    get: (limit) => apiClient.get('/leaderboard', { params: { limit } }),
  },

  // Comments / Discussions
  comments: {
    getByQuestion: (questionId) => apiClient.get(`/comments/question/${questionId}`),
    create: (data) => apiClient.post('/comments', data),
    upvote: (id) => apiClient.post(`/comments/${id}/upvote`),
    getMyComments: () => apiClient.get('/comments/user/me'),
  },

  // Interviews (protected)
  interviews: {
    saveScore: (data) => apiClient.post('/interviews/score', data),
    getHistory: (limit = 50) => apiClient.get('/interviews/history', { params: { limit } }),
  }
};
