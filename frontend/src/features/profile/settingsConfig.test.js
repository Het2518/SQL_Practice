import { describe, expect, it, vi } from 'vitest';
import { loadSettings, saveSettings, SETTINGS_KEY, defaultSettings } from './settingsConfig';

describe('settingsConfig', () => {
  it('loads an empty object when storage is empty or invalid', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });

    expect(loadSettings()).toEqual({});
  });

  it('saves settings as JSON', () => {
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem,
    });

    saveSettings(defaultSettings);

    expect(setItem).toHaveBeenCalledWith(SETTINGS_KEY, JSON.stringify(defaultSettings));
  });
});