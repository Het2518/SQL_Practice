import { create } from 'zustand';
import { loadSettings, saveSettings, defaultSettings } from '../features/profile/settingsConfig';

export const useSettingsStore = create((set) => ({
  settings: { ...defaultSettings, ...loadSettings() },

  // Update one or more settings fields
  updateSettings: (newSettings) =>
    set((state) => {
      // If it's a function (for updater pattern), call it
      const updates = typeof newSettings === 'function' ? newSettings(state.settings) : newSettings;
      const updated = { ...state.settings, ...updates };
      saveSettings(updated);

      // Apply dark mode side effect immediately
      document.documentElement.setAttribute('data-theme', updated.darkMode ? 'dark' : 'light');

      return { settings: updated };
    }),

  // Toggle dark mode specifically
  toggleDarkMode: () =>
    set((state) => {
      const updated = { ...state.settings, darkMode: !state.settings.darkMode };
      saveSettings(updated);
      document.documentElement.setAttribute('data-theme', updated.darkMode ? 'dark' : 'light');
      return { settings: updated };
    }),
}));
