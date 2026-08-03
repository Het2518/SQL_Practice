import { create } from 'zustand';
import { api } from '@/lib/api';
import { useGamificationStore } from './useGamificationStore';

const PROGRESS_KEY = 'sql-practice-progress';

function loadLocalProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveLocalProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export const useProgressStore = create((set, get) => ({
  progress: {},
  progressLoaded: false,

  setProgress: (newProgress) => {
    set({ progress: newProgress, progressLoaded: true });
    saveLocalProgress(newProgress);
  },

  updateProgress: (questionId, status) => {
    set((state) => {
      const newProgress = { ...state.progress, [questionId]: status };
      saveLocalProgress(newProgress);
      return { progress: newProgress };
    });

    // Optimistically updated locally; also fire API patch (non-blocking)
    api.progress.updateQuestion(String(questionId), status).catch((err) => {
      console.error('[Progress] Failed to sync question update:', err.message);
    });
  },

  initializeLocalProgress: () => {
    const local = loadLocalProgress();
    set({ progress: local, progressLoaded: true });
  },

  /**
   * Sync progress from the backend API when user logs in.
   * Replaces local state entirely with server data and pushes gamification slice to useGamificationStore.
   */
  syncFromServer: async (user) => {
    if (!user) {
      set({ progress: {}, progressLoaded: false });
      return;
    }
    set({ progressLoaded: false });
    try {
      const { data } = await api.progress.get();
      const serverProgress = data.data.completedQuestions ?? {};
      set({ progress: serverProgress, progressLoaded: true });
      saveLocalProgress(serverProgress);
      
      // Push gamification slice to avoid a duplicate API request
      useGamificationStore.getState().setFromServer(data.data);
    } catch (err) {
      console.error('[Progress] Failed to sync from server:', err.message);
      // Fall back to local storage
      const local = loadLocalProgress();
      set({ progress: local, progressLoaded: true });
    }
  },

  resetProgress: () => {
    set({ progress: {}, progressLoaded: false });
    localStorage.removeItem(PROGRESS_KEY);
  },
}));
