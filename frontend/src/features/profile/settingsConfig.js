export const SETTINGS_KEY = 'sql-platform-settings';

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

/** Persist settings — single source of truth for all settings writes. */
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    console.warn('[DataDesk] Could not save settings to localStorage.');
  }
}

export const defaultSettings = {
  darkMode: false,
  autoRunAfterTyping: false,
  autoCompleteSql: true,
  persistEditorText: true,
  timedChallenges: false,
  editorFontSize: 14,
  groqApiKey: '',
};
