const SETTINGS_KEY = 'sql-platform-settings';

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export const defaultSettings = {
  darkMode: false,
  autoRunAfterTyping: false,
  autoCompleteSql: true,
  persistEditorText: false,
  timedChallenges: false,
  editorFontSize: 14,
};
