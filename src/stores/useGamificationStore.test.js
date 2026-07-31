import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGamificationStore, BADGE_DEFS } from './useGamificationStore';
import { useProgressStore } from './useProgressStore';

vi.mock('./useProgressStore', () => ({
  useProgressStore: {
    getState: vi.fn(() => ({ progress: {} })),
  },
}));

describe('useGamificationStore', () => {
  beforeEach(() => {
    const store = useGamificationStore.getState();
    store.resetGamification();
  });

  it('starts with default state', () => {
    const { gameState } = useGamificationStore.getState();
    expect(gameState.currentStreak).toBe(0);
    expect(gameState.maxStreak).toBe(0);
    expect(gameState.badges).toEqual([]);
    expect(gameState.recentSubmissions).toEqual([]);
  });

  it('records activity and updates streak', () => {
    const { recordActivity } = useGamificationStore.getState();

    // Fake a question submission
    recordActivity({ id: 1, title: 'Q1', difficulty: 'easy' }, 'airlines', 'complete');

    const { gameState } = useGamificationStore.getState();

    expect(gameState.currentStreak).toBe(1);
    expect(gameState.maxStreak).toBe(1);
    expect(gameState.badges).toContain('first_query');
    expect(gameState.recentSubmissions.length).toBe(1);
    expect(gameState.recentSubmissions[0].id).toBe(1);
  });
});
