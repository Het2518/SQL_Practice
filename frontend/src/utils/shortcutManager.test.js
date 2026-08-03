import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_SHORTCUTS,
  comboToMonaco,
  eventToComboString,
  isShortcutMatch,
  loadShortcuts,
  saveShortcuts,
  SHORTCUTS_STORAGE_KEY,
} from './shortcutManager';

describe('shortcutManager', () => {
  it('falls back to defaults when storage is empty', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });

    expect(loadShortcuts()).toEqual(DEFAULT_SHORTCUTS);
  });

  it('merges stored shortcuts over defaults', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => JSON.stringify({ runQuery: { id: 'runQuery', label: 'Run Query', combo: 'Ctrl+Enter' } })),
      setItem: vi.fn(),
    });

    expect(loadShortcuts().runQuery.combo).toBe('Ctrl+Enter');
    expect(loadShortcuts().formatCode.combo).toBe(DEFAULT_SHORTCUTS.formatCode.combo);
  });

  it('persists shortcuts to storage', () => {
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem,
    });

    saveShortcuts(DEFAULT_SHORTCUTS);

    expect(setItem).toHaveBeenCalledWith(
      SHORTCUTS_STORAGE_KEY,
      JSON.stringify(DEFAULT_SHORTCUTS)
    );
  });

  it('matches keyboard events against shortcut combos', () => {
    expect(isShortcutMatch({ ctrlKey: true, metaKey: false, shiftKey: false, altKey: false, key: 'Enter' }, 'Ctrl+Enter')).toBe(true);
    expect(isShortcutMatch({ ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, key: 'Enter' }, 'Ctrl+Enter')).toBe(false);
  });

  it('converts keyboard events to shortcut combo strings', () => {
    expect(eventToComboString({ ctrlKey: true, metaKey: false, shiftKey: true, altKey: false, key: 'k' })).toBe('Ctrl+Shift+K');
    expect(eventToComboString({ ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, key: 'Control' })).toBeNull();
  });

  it('converts shortcut strings to Monaco bitmasks', () => {
    const monaco = {
      KeyMod: { CtrlCmd: 1, Shift: 2, Alt: 4 },
      KeyCode: { Enter: 8, KeyQ: 16 },
    };

    expect(comboToMonaco('Ctrl+Enter', monaco)).toBe(9);
    expect(comboToMonaco('Ctrl+Q', monaco)).toBe(17);
  });
});