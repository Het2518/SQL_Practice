import { create } from 'zustand';

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
  },

  initializeLocalProgress: () => {
    const local = loadLocalProgress();
    set({ progress: local, progressLoaded: true });
  },

  syncFromServer: async (user, supabase) => {
    if (!user) {
      set({ progress: {}, progressLoaded: false });
      return;
    }
    set({ progressLoaded: false, progress: {} });
    try {
      const { data } = await supabase
        .from('user_progress')
        .select('completed_questions')
        .eq('user_id', user.id)
        .single();
      if (data && data.completed_questions) {
        set({ progress: data.completed_questions });
      }
      set({ progressLoaded: true });
    } catch (e) {
      console.error(e);
      set({ progressLoaded: true });
    }
  },

  syncToServer: async (user, supabase) => {
    const state = get();
    if (!user || !state.progressLoaded) return;
    try {
      await supabase.from('user_progress').upsert({
        user_id: user.id,
        completed_questions: state.progress,
        display_name:
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          user?.email?.split('@')[0] ||
          'Player',
      });
    } catch (e) {
      console.error(e);
    }
  },

  resetProgress: () => {
    set({ progress: {}, progressLoaded: false });
    localStorage.removeItem(PROGRESS_KEY);
  },
}));
