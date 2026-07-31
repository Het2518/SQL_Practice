export const DEFAULT_SHORTCUTS = {
  runQuery: { id: 'runQuery', label: 'Run Query', combo: 'Ctrl+Enter' },
  formatCode: { id: 'formatCode', label: 'Format Code', combo: 'Ctrl+Q' },
  explainQuery: { id: 'explainQuery', label: 'Explain Query', combo: 'Ctrl+E' },
  toggleSidebar: { id: 'toggleSidebar', label: 'Toggle Left Sidebar', combo: 'Ctrl+B' },
  toggleRightPanel: { id: 'toggleRightPanel', label: 'Toggle Right Sidebar', combo: 'Ctrl+`' },
  showHints: { id: 'showHints', label: 'Show Hints', combo: 'Ctrl+H' },
};

export const SHORTCUTS_STORAGE_KEY = 'sql-practice-shortcuts';

export function loadShortcuts() {
  try {
    const saved = localStorage.getItem(SHORTCUTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to ensure new commands aren't missing
      return { ...DEFAULT_SHORTCUTS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load shortcuts', e);
  }
  return { ...DEFAULT_SHORTCUTS };
}

export function saveShortcuts(shortcuts) {
  localStorage.setItem(SHORTCUTS_STORAGE_KEY, JSON.stringify(shortcuts));
}

// Check if a keyboard event matches a shortcut combo string (e.g. "Ctrl+Shift+K")
export function isShortcutMatch(e, comboStr) {
  if (!comboStr) return false;
  
  const parts = comboStr.toLowerCase().split('+').map(p => p.trim());
  const needsCtrl = parts.includes('ctrl') || parts.includes('cmd');
  const needsShift = parts.includes('shift');
  const needsAlt = parts.includes('alt');
  
  const key = parts[parts.length - 1]; // The actual key is usually last
  
  if (e.ctrlKey !== needsCtrl && e.metaKey !== needsCtrl) return false;
  if (e.shiftKey !== needsShift) return false;
  if (e.altKey !== needsAlt) return false;
  
  // Normalize event key
  let evKey = e.key.toLowerCase();
  if (evKey === ' ') evKey = 'space';
  
  return evKey === key;
}

// Convert a keyboard event to a combo string
export function eventToComboString(e) {
  const parts = [];
  if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
  if (e.shiftKey) parts.push('Shift');
  if (e.altKey) parts.push('Alt');
  
  let key = e.key;
  if (key === ' ') key = 'Space';
  else if (key.length === 1) key = key.toUpperCase();
  
  // Ignore modifier-only presses
  if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) return null;
  
  parts.push(key);
  return parts.join('+');
}

// Helper to translate string combo to Monaco Keycode bitmask
export function comboToMonaco(comboStr, monaco) {
  if (!comboStr || !monaco) return 0;
  
  const parts = comboStr.toLowerCase().split('+').map(p => p.trim());
  let mask = 0;
  
  if (parts.includes('ctrl') || parts.includes('cmd')) mask |= monaco.KeyMod.CtrlCmd;
  if (parts.includes('shift')) mask |= monaco.KeyMod.Shift;
  if (parts.includes('alt')) mask |= monaco.KeyMod.Alt;
  
  const keyStr = parts[parts.length - 1];
  let keyCode = 0;
  
  if (keyStr === 'enter') keyCode = monaco.KeyCode.Enter;
  else if (keyStr === 'space') keyCode = monaco.KeyCode.Space;
  else if (keyStr.length === 1 && keyStr >= 'a' && keyStr <= 'z') {
    // KeyA is 31 in Monaco Enum. 'a' charCode is 97. 
    // An easier way: monaco.KeyCode[`Key${keyStr.toUpperCase()}`]
    keyCode = monaco.KeyCode[`Key${keyStr.toUpperCase()}`];
  } else if (keyStr.length === 1 && keyStr >= '0' && keyStr <= '9') {
    keyCode = monaco.KeyCode[`Digit${keyStr}`];
  }
  
  return mask | keyCode;
}
