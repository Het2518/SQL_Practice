import { create } from 'zustand';
import { api } from '@/lib/api';
import { useProgressStore } from './useProgressStore';

const GAMIFICATION_KEY = 'sql-practice-gamification';

const DEFAULT_STATE = {
  activity: {},
  lastPracticeDate: null,
  currentStreak: 0,
  maxStreak: 0,
  badges: [],
  recentSubmissions: [],
};

export const BADGE_DEFS = [
  {
    id: 'first_query',
    title: 'First Blood',
    description: 'Solve your first SQL question.',
    icon: '🩸',
  },
  { id: 'streak_3', title: 'On Fire', description: 'Achieve a 3-day practice streak.', icon: '🔥' },
  {
    id: 'streak_7',
    title: 'Unstoppable',
    description: 'Achieve a 7-day practice streak.',
    icon: '🚀',
  },
  {
    id: 'solved_10',
    title: 'Getting Serious',
    description: 'Solve 10 questions total.',
    icon: '📚',
  },
  { id: 'solved_50', title: 'SQL Ninja', description: 'Solve 50 questions total.', icon: '🥷' },
  {
    id: 'perfect_db',
    title: 'Completionist',
    description: 'Complete 100% of any database.',
    icon: '🏆',
  },
];

export const useGamificationStore = create((set, get) => ({
  gameState: DEFAULT_STATE,

  /**
   * Sync all gamification data from the server when user logs in.
   */
  syncFromServer: async (user) => {
    if (!user) return;
    try {
      const { data } = await api.progress.get();
      const d = data.data;
      set({
        gameState: {
          ...DEFAULT_STATE,
          activity: d.activity || {},
          currentStreak: d.currentStreak || 0,
          maxStreak: d.maxStreak || 0,
          badges: d.badges || [],
          lastPracticeDate: d.lastPracticeDate || null,
          recentSubmissions: Array.isArray(d.recentSubmissions) ? d.recentSubmissions : [],
        },
      });
    } catch (err) {
      console.error('[Gamification] Failed to sync from server', err.message);
      set({ gameState: DEFAULT_STATE });
    }
  },

  resetGamification: () => {
    set({ gameState: DEFAULT_STATE });
    localStorage.removeItem(GAMIFICATION_KEY);
  },

  /**
   * Records a question activity.
   * - Updates local state immediately (optimistic).
   * - POSTs to the backend API, then updates state with server-confirmed values.
   */
  recordActivity: (question = null, dbName = null, status = 'attempted', user = null) => {
    // Only record if user is logged in (progress is server-side)
    if (!user) return;

    // Fire-and-forget API call; update local state with server response
    api.progress
      .recordActivity(question, dbName, status)
      .then(({ data }) => {
        const d = data.data;
        set((state) => ({
          gameState: {
            ...state.gameState,
            activity: d.activity || state.gameState.activity,
            currentStreak: d.currentStreak,
            maxStreak: d.maxStreak,
            lastPracticeDate: d.lastPracticeDate,
            badges: d.badges,
            recentSubmissions: d.recentSubmissions || state.gameState.recentSubmissions,
          },
        }));
      })
      .catch((err) => {
        console.error('[Gamification] Failed to record activity:', err.message);
      });
  },
}));
