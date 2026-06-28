import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const GAMIFICATION_KEY = 'sql-practice-gamification';

const DEFAULT_STATE = {
  activity: {}, // e.g. { "2023-10-25": 3, "2023-10-26": 5 } -> Date string to number of questions solved
  lastPracticeDate: null,
  currentStreak: 0,
  maxStreak: 0,
  badges: [],
};

export const BADGE_DEFS = [
  { id: 'first_query', title: 'First Blood', description: 'Solve your first SQL question.', icon: '🩸' },
  { id: 'streak_3', title: 'On Fire', description: 'Achieve a 3-day practice streak.', icon: '🔥' },
  { id: 'streak_7', title: 'Unstoppable', description: 'Achieve a 7-day practice streak.', icon: '🚀' },
  { id: 'solved_10', title: 'Getting Serious', description: 'Solve 10 questions total.', icon: '📚' },
  { id: 'solved_50', title: 'SQL Ninja', description: 'Solve 50 questions total.', icon: '🥷' },
  { id: 'perfect_db', title: 'Completionist', description: 'Complete 100% of any database.', icon: '🏆' },
];

export function useGamification(progress, user) {
  const [gameState, setGameState] = useState(() => {
    try {
      const saved = localStorage.getItem(GAMIFICATION_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  });

  // Save on state change
  useEffect(() => {
    localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(gameState));
    if (user) {
      supabase.from('user_progress').upsert({
        user_id: user.id,
        activity: gameState.activity,
        current_streak: gameState.currentStreak,
        max_streak: gameState.maxStreak,
        badges: gameState.badges,
        last_practice_date: gameState.lastPracticeDate
      }).then(({ error }) => {
        if (error) console.error('Error syncing gamification state:', error.message);
      });
    }
  }, [gameState, user]);

  // Sync from Supabase on user login
  useEffect(() => {
    if (user) {
      supabase.from('user_progress').select('*').eq('user_id', user.id).single()
      .then(({ data, error }) => {
        if (data) {
          setGameState(prev => ({
            ...prev,
            activity: { ...prev.activity, ...data.activity },
            currentStreak: Math.max(prev.currentStreak, data.current_streak || 0),
            maxStreak: Math.max(prev.maxStreak, data.max_streak || 0),
            badges: Array.from(new Set([...prev.badges, ...(data.badges || [])])),
            lastPracticeDate: data.last_practice_date || prev.lastPracticeDate
          }));
        }
      });
    }
  }, [user]);

  const recordActivity = useCallback(() => {
    setGameState(prev => {
      const today = new Date().toISOString().slice(0, 10);
      const newState = { ...prev, activity: { ...prev.activity } };

      // Increment today's activity
      newState.activity[today] = (newState.activity[today] || 0) + 1;

      // Update streaks
      if (prev.lastPracticeDate !== today) {
        if (!prev.lastPracticeDate) {
          newState.currentStreak = 1;
        } else {
          const lastDate = new Date(prev.lastPracticeDate);
          const currentDate = new Date(today);
          const diffTime = Math.abs(currentDate - lastDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            newState.currentStreak += 1; // Consecutive day
          } else if (diffDays > 1) {
            newState.currentStreak = 1; // Streak broken
          }
        }
        newState.lastPracticeDate = today;
        newState.maxStreak = Math.max(newState.maxStreak, newState.currentStreak);
      }

      // Check badges (basic checks)
      const newBadges = new Set(prev.badges);
      if (newState.activity[today] >= 1) newBadges.add('first_query');
      if (newState.currentStreak >= 3) newBadges.add('streak_3');
      if (newState.currentStreak >= 7) newBadges.add('streak_7');

      const totalSolved = Object.keys(progress).filter(k => progress[k] === 'complete').length;
      if (totalSolved >= 10) newBadges.add('solved_10');
      if (totalSolved >= 50) newBadges.add('solved_50');

      newState.badges = Array.from(newBadges);
      return newState;
    });
  }, [progress]);

  return {
    gameState,
    recordActivity,
    earnedBadges: BADGE_DEFS.filter(b => gameState.badges.includes(b.id)),
    unearnedBadges: BADGE_DEFS.filter(b => !gameState.badges.includes(b.id)),
  };
}
