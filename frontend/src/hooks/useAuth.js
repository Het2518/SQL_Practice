import { create } from 'zustand';
import { api } from '@/lib/api';

/**
 * Zustand store for JWT-based authentication.
 *
 * - Relies on HttpOnly cookies for session management.
 * - Listens for the `datadesk:auth:expired` event (fired by apiClient on 401)
 *   to handle session expiration.
 */
export const useAuth = create((set, get) => ({
  user: null,
  loading: true,

  
  /**
   * Called once on app mount.
   * If successful, user is set. If 401, user remains null.
   */
  initializeAuth: async () => {
    // Ensure we have a CSRF token from the server
    try {
      await api.auth.getCsrfToken();
    } catch (err) {
      console.warn('Failed to fetch CSRF token:', err);
    }

    // Validate session by fetching the current user
    api.auth
      .getMe()
      .then(({ data }) => {
        set({ user: data.data.user, loading: false });
      })
      .catch(() => {
        // No active session or expired
        set({ user: null, loading: false });
      });

    // Listen for global auth-expired event from the API client
    const handleExpired = () => {
      set({ user: null, loading: false });
    };
    window.addEventListener('datadesk:auth:expired', handleExpired);
    return () => window.removeEventListener('datadesk:auth:expired', handleExpired);
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
}));
