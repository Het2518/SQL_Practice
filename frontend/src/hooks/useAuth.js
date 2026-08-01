import { create } from 'zustand';
import { api, apiClient } from '@/lib/api';

/**
 * Zustand store for JWT-based authentication.
 *
 * - Relies on HttpOnly cookies for session management.
 * - Listens for the `datadesk:auth:expired` event (fired by apiClient on 401)
 *   to handle session expiration.
 */
export const useAuth = create((set, get) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('datadesk:auth:expired', () => {
      set({ user: null, loading: false });
    });
  }

  return {
    user: null,
    loading: false,
    isCheckingSession: true,

    /**
     * Called once on app mount. Runs asynchronously in the background.
     * Never blocks the initial render of the application.
     */
    initializeAuth: async () => {
      // 1. Fetch CSRF token in the background with an 8s timeout (handles backend cold-starts gracefully)
      const csrfPromise = api.auth
        .getCsrfToken({ timeout: 8000 })
        .then(({ data }) => {
          if (data?.data?.csrfToken) {
            apiClient.defaults.headers.common['X-CSRF-Token'] = data.data.csrfToken;
          }
        })
        .catch((err) => {
          // Graceful fallback — backend may be spinning up
          console.debug('[Auth] CSRF token background warm-up:', err?.message || err);
        });

      // 2. Validate user session in the background
      const sessionPromise = api.auth
        .getMe({ timeout: 8000 })
        .then(({ data }) => {
          if (data?.data?.user) {
            set({ user: data.data.user });
          }
        })
        .catch(() => {
          // No active session, user remains guest
          set({ user: null });
        });

      try {
        await Promise.allSettled([csrfPromise, sessionPromise]);
      } finally {
        set({ isCheckingSession: false });
      }
    },

  /**
   * Register a new account with email, username, password, and optional display name.
   */
  register: async ({ email, username, password, displayName }) => {
    const { data } = await api.auth.register({ email, username, password, displayName });
    
    // Server sets the HttpOnly cookie
    if (data.data?.user) {
      set({ user: data.data.user });
      return { verified: true, user: data.data.user };
    }
    
    return { verified: false, user: null };
  },

  /**
   * Login with identifier (email or username) and password.
   */
  login: async (identifier, password) => {
    const { data } = await api.auth.login({ identifier, password });
    set({ user: data.data.user });
    return data.data.user;
  },

  /**
   * Update the authenticated user's display name.
   */
  updateDisplayName: async (displayName) => {
    const { data } = await api.auth.updateName(displayName);
    set({ user: data.data.user });
    return data.data.user;
  },

  /**
   * Log out: remove token and clear user state.
   */
  logout: async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    set({ user: null });
  },
};
});
