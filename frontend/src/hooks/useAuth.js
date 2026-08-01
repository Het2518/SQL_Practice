import { create } from 'zustand';
import { api, tokenStorage } from '@/lib/api';

/**
 * Zustand store for JWT-based authentication.
 *
 * - Persists token in localStorage via tokenStorage.
 * - Listens for the `datadesk:auth:expired` event (fired by apiClient on 401)
 *   to handle token expiration without circular imports.
 */
export const useAuth = create((set, get) => ({
  user: null,
  loading: true,

  
  /**
   * Called once on app mount.
   * If a token exists in storage, validate it against /auth/me.
   */
  initializeAuth: () => {
    const token = tokenStorage.get();

    if (!token) {
      set({ user: null, loading: false });
      return () => {};
    }

    // Validate token by fetching the current user
    api.auth
      .getMe()
      .then(({ data }) => {
        set({ user: data.data.user, loading: false });
      })
      .catch(() => {
        // Token is invalid or expired
        tokenStorage.remove();
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
   * Register a new account with email, password, and optional display name.
   * Does NOT log the user in; they must verify their email first.
   */
  register: async ({ email, password, displayName }) => {
    const { data } = await api.auth.register({ email, password, displayName });
    
    // If backend returns a token (Render Free Tier bypass), log the user in instantly
    if (data.data?.token) {
      tokenStorage.set(data.data.token);
      set({ user: data.data.user });
      return { verified: true, user: data.data.user };
    }
    
    return { verified: false, email: data.data.email };
  },

  /**
   * Verify email using 6-digit code.
   * Logs the user in upon success.
   */
  verifyEmail: async (email, code) => {
    const { data } = await api.auth.verifyEmail({ email, code });
    tokenStorage.set(data.data.token);
    set({ user: data.data.user });
    return data.data.user;
  },

  /**
   * Login with email and password.
   */
  loginWithEmail: async (email, password) => {
    const { data } = await api.auth.login({ email, password });
    tokenStorage.set(data.data.token);
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
  logout: () => {
    tokenStorage.remove();
    set({ user: null });
  },
}));
