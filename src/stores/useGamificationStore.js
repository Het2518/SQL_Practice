import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
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

  initializeFromLocal: () => {
    // We intentionally don't load gamification from local storage aggressively to prevent overwriting user data
  },

  syncFromServer: async (user) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) {
        set({
          gameState: {
            ...DEFAULT_STATE,
            activity: data.activity || {},
            currentStreak: data.current_streak || 0,
            maxStreak: data.max_streak || 0,
            badges: data.badges || [],
            lastPracticeDate: data.last_practice_date || null,
            recentSubmissions: Array.isArray(data.activity_history) ? data.activity_history : [],
          },
        });
      } else {
        set({ gameState: DEFAULT_STATE });
      }
    } catch (e) {
      console.error('Failed to sync gamification from server', e);
    }
  },

  resetGamification: () => {
    set({ gameState: DEFAULT_STATE });
    localStorage.removeItem(GAMIFICATION_KEY);
  },

  recordActivity: (question = null, dbName = null, status = 'Attempted', user = null) => {
    set((state) => {
      const today = new Date().toLocaleDateString('en-CA');
      const newState = {
        ...state.gameState,
        activity: { ...state.gameState.activity },
        recentSubmissions: [...(state.gameState.recentSubmissions || [])],
      };

      newState.activity[today] = (newState.activity[today] || 0) + 1;

      if (state.gameState.lastPracticeDate !== today) {
        if (!state.gameState.lastPracticeDate) {
          newState.currentStreak = 1;
        } else {
          const lastDate = new Date(state.gameState.lastPracticeDate);
          const currentDate = new Date(today);
          const diffDays = Math.ceil(Math.abs(currentDate - lastDate) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) newState.currentStreak += 1;
          else if (diffDays > 1) newState.currentStreak = 1;
        }
        newState.lastPracticeDate = today;
        newState.maxStreak = Math.max(newState.maxStreak, newState.currentStreak);
      }

      const newBadges = new Set(state.gameState.badges);
      if (newState.activity[today] >= 1) newBadges.add('first_query');
      if (newState.currentStreak >= 3) newBadges.add('streak_3');
      if (newState.currentStreak >= 7) newBadges.add('streak_7');

      const progress = useProgressStore.getState().progress;
      const totalSolved = Object.keys(progress).filter((k) => progress[k] === 'complete').length;
      if (totalSolved >= 10) newBadges.add('solved_10');
      if (totalSolved >= 50) newBadges.add('solved_50');

      newState.badges = Array.from(newBadges);

      if (question && dbName) {
        newState.recentSubmissions.unshift({
          id: question.id,
          title: question.title || question.prompt.substring(0, 40) + '...',
          db: dbName,
          difficulty: question.difficulty,
          status,
          timestamp: new Date().toISOString(),
        });
        if (newState.recentSubmissions.length > 20)
          newState.recentSubmissions = newState.recentSubmissions.slice(0, 20);
      }

      // Async sync to server
      if (user) {
        supabase
          .from('user_progress')
          .upsert({
            user_id: user.id,
            activity: newState.activity,
            current_streak: newState.currentStreak,
            max_streak: newState.maxStreak,
            badges: newState.badges,
            last_practice_date: newState.lastPracticeDate,
            activity_history: newState.recentSubmissions,
            display_name:
              user?.user_metadata?.full_name ||
              user?.user_metadata?.name ||
              user?.email?.split('@')[0] ||
              'Player',
          })
          .then(({ error }) => {
            if (error) console.error('Error syncing gamification state:', error.message);
          });
      }

      return { gameState: newState };
    });
  },
}));
