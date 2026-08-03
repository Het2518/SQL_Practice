import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  loadShortcuts,
  saveShortcuts,
  DEFAULT_SHORTCUTS,
  eventToComboString,
} from '@/utils/shortcutManager';
import { defaultSettings, SETTINGS_KEY } from './settingsConfig';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { Button } from '@/shared/ui/Button';
import { useSettingsStore } from '@/stores/useSettingsStore';

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div
      className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg mb-2 cursor-pointer transition-colors duration-200 hover:border-primary"
      onClick={() => onChange(!checked)}
    >
      <div className="flex flex-col gap-0.5 pr-4">
        <span className="text-sm font-semibold text-text">{label}</span>
        {description && (
          <span className="text-xs text-muted leading-relaxed">
            {description}
          </span>
        )}
      </div>
      <div
        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors duration-300 ${
          checked ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <div
          className={`absolute top-[2px] w-5 h-5 rounded-full shadow-sm transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
            checked ? 'left-[22px] bg-primary-foreground' : 'left-[2px] bg-white'
          }`}
        />
      </div>
    </div>
  );
}

function ShortcutRow({ commandId, shortcut, onReassign, conflictWith }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleKeyDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.key === 'Escape') {
      setIsEditing(false);
      return;
    }
    const combo = eventToComboString(e);
    if (combo) {
      onReassign(commandId, combo);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col mb-2">
      <div
        className={`flex items-center justify-between px-3 py-2 bg-surface rounded-lg cursor-pointer border ${
          conflictWith ? 'border-error' : isEditing ? 'border-primary' : 'border-border'
        }`}
        onClick={() => setIsEditing(true)}
      >
        <span className="text-sm font-semibold text-text">
          {shortcut.label}
        </span>

        {isEditing ? (
          <input
            autoFocus
            onBlur={() => setIsEditing(false)}
            onKeyDown={handleKeyDown}
            readOnly
            value="Press desired keys... (Esc to cancel)"
            className="bg-bg border-none text-primary text-xs px-2 py-1 rounded w-[200px] text-center outline-none"
          />
        ) : (
          <kbd className="bg-bg border border-border rounded px-2 py-1 text-xs text-primary min-w-[60px] text-center font-mono">
            {shortcut.combo}
          </kbd>
        )}
      </div>
      {conflictWith && !isEditing && (
        <span className="text-error text-[11px] mt-1 ml-1">
          ⚠️ Conflicts with "{conflictWith}"
        </span>
      )}
    </div>
  );
}

export function SettingsModal({ onClose }) {
  const { settings, updateSettings } = useSettingsStore();
  const [local, setLocal] = useState({ ...settings });
  const [shortcuts, setShortcuts] = useState(() => loadShortcuts());
  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmState, setConfirmState] = useState(null);
  const [storageSize, setStorageSize] = useState('0 KB');

  const importRef = useRef();

  useEffect(() => {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += (localStorage[key].length + key.length) * 2;
      }
    }
    setStorageSize((total / 1024).toFixed(2) + ' KB');
  }, []);

  const set = (key, value) => setLocal((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(local));
    saveShortcuts(shortcuts);
    
    // Dispatch explicit app-level events so listeners can refresh without reload.
    window.dispatchEvent(new CustomEvent('sql-practice-shortcuts-updated'));

    updateSettings(local);
    onClose();
  };

  const handleExport = () => {
    const data = {
      settings: local,
      shortcuts: shortcuts,
      progress: JSON.parse(localStorage.getItem('sql-practice-progress') ?? '{}'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sql-platform-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.settings) setLocal({ ...defaultSettings, ...data.settings });
        if (data.shortcuts) setShortcuts({ ...DEFAULT_SHORTCUTS, ...data.shortcuts });
        if (data.progress)
          localStorage.setItem('sql-practice-progress', JSON.stringify(data.progress));
        alert('✅ Import successful! Save settings to apply.');
      } catch {
        alert('❌ Invalid backup file.');
      }
    };
    reader.readAsText(file);
    if (importRef.current) importRef.current.value = '';
  };

  const handleResetGeneral = () => {
    setConfirmState({
      title: 'Reset Settings',
      message: 'Are you sure you want to reset all general settings to default?',
      onConfirm: () => {
        setLocal({ ...defaultSettings });
        setConfirmState(null);
      },
    });
  };

  const handleResetShortcuts = () => {
    setConfirmState({
      title: 'Reset Shortcuts',
      message: 'Are you sure you want to reset all keyboard shortcuts to default?',
      onConfirm: () => {
        setShortcuts({ ...DEFAULT_SHORTCUTS });
        setConfirmState(null);
      },
    });
  };

  const handleClearAllData = () => {
    setConfirmState({
      title: '⚠️ Clear All Data & Progress',
      message:
        'This will irreversibly delete ALL your progress, streaks, badges, custom datasets, and settings. Are you absolutely sure?',
      onConfirm: () => {
        localStorage.clear();
        window.location.reload();
      },
    });
  };

  const handleReassignShortcut = (id, combo) => {
    setShortcuts((prev) => ({
      ...prev,
      [id]: { ...prev[id], combo },
    }));
  };

  // Find conflicts
  const conflicts = useMemo(() => {
    const map = {};
    const conflictMap = {};
    Object.values(shortcuts).forEach((s) => {
      if (map[s.combo]) {
        conflictMap[s.id] = map[s.combo].label;
        conflictMap[map[s.combo].id] = s.label;
      }
      map[s.combo] = s;
    });
    return conflictMap;
  }, [shortcuts]);

  const filteredShortcuts = Object.values(shortcuts).filter(
    (s) =>
      s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.combo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-bg/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[560px] bg-surface rounded-2xl overflow-hidden flex flex-col shadow-xl border border-border mx-4 max-h-[90vh]">
        {/* Header */}
        <div className="pt-5 px-6 pb-0 bg-surface">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-[20px]">⚙️</span>
              <h2 className="text-[18px] font-bold m-0 text-text">
                Preferences
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-surface-2 text-text-secondary hover:text-text transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-4 border-b border-border">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-3 border-none bg-transparent cursor-pointer text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'general'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted'
              }`}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab('shortcuts')}
              className={`px-4 py-3 border-none bg-transparent cursor-pointer text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'shortcuts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted'
              }`}
            >
              Keyboard Shortcuts
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 bg-transparent border-none py-3 cursor-pointer text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'ai'
                  ? 'border-purple-500 text-purple-500'
                  : 'border-transparent text-muted'
              }`}
            >
              AI Config
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'general' ? (
            <>
              <h3 className="text-xs uppercase text-muted tracking-[1px] mb-3 font-semibold m-0">
                Editor & Workspace
              </h3>
              <ToggleRow
                label="Dark Mode"
                description="Use a darker, eye-friendly color theme"
                checked={local.darkMode}
                onChange={(v) => set('darkMode', v)}
              />
              <ToggleRow
                label="Auto Complete SQL"
                description="Show intelligent keyword and schema suggestions while typing"
                checked={local.autoCompleteSql}
                onChange={(v) => set('autoCompleteSql', v)}
              />
              <ToggleRow
                label="Auto Run After Typing"
                description="Execute query automatically after 1 second of inactivity"
                checked={local.autoRunAfterTyping}
                onChange={(v) => set('autoRunAfterTyping', v)}
              />
              <ToggleRow
                label="Persist Editor Text"
                description="Remember your SQL query text when you switch between questions"
                checked={local.persistEditorText}
                onChange={(v) => set('persistEditorText', v)}
              />

              <div className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg mt-2 mb-6">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-text">
                    Editor Font Size
                  </span>
                  <span className="text-xs text-muted">
                    Adjust the size of the code text
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => set('editorFontSize', Math.max(10, local.editorFontSize - 1))}
                    className="w-7 h-7 rounded-md border border-border bg-surface-2 text-text cursor-pointer flex items-center justify-center hover:bg-surface-3 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-[15px] font-semibold w-6 text-center text-text">
                    {local.editorFontSize}
                  </span>
                  <button
                    onClick={() => set('editorFontSize', Math.min(28, local.editorFontSize + 1))}
                    className="w-7 h-7 rounded-md border border-border bg-surface-2 text-text cursor-pointer flex items-center justify-center hover:bg-surface-3 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <h3 className="text-xs uppercase text-muted tracking-[1px] mb-3 font-semibold m-0 mt-6">
                Experience
              </h3>
              <ToggleRow
                label="Timed Challenges"
                description="Enable a countdown timer for practice sessions"
                checked={local.timedChallenges}
                onChange={(v) => set('timedChallenges', v)}
              />

              <h3 className="text-xs uppercase text-muted tracking-[1px] mb-3 font-semibold m-0 mt-6">
                Data & Backup
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleExport} className="px-4 py-2 bg-surface-2 hover:bg-surface-3 text-text rounded-lg text-sm font-semibold transition-colors border border-border flex items-center gap-2 justify-center">
                  📤 Export Backup
                </button>
                <input
                  ref={importRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
                <button onClick={() => importRef.current?.click()} className="px-4 py-2 bg-surface-2 hover:bg-surface-3 text-text rounded-lg text-sm font-semibold transition-colors border border-border flex items-center gap-2 justify-center">
                  📥 Import Backup
                </button>
              </div>

              <h3 className="text-xs uppercase text-muted tracking-[1px] mb-3 font-semibold m-0 mt-6">
                Storage Management ({storageSize})
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleResetGeneral}
                  className="btn btn-ghost w-full text-text"
                >
                  🔄 Reset General Settings
                </button>
                <div className="mt-6">
                  <button
                    onClick={async () => {
                      const progress = localStorage.getItem('sql-practice-progress') || '{}';
                      await navigator.clipboard.writeText(progress);
                      alert('Progress copied to clipboard!');
                    }}
                    className="w-full px-4 py-2 hover:bg-surface-2 text-text rounded-lg text-sm font-semibold transition-colors mb-2"
                  >
                    Copy Raw Progress Data
                  </button>
                  <button
                    onClick={handleClearAllData}
                    className="w-full px-4 py-2 hover:bg-red-500/10 text-red-500 rounded-lg text-sm font-bold transition-colors"
                  >
                    ⚠️ Hard Reset All Progress
                  </button>
                </div>
              </div>
            </>
          ) : activeTab === 'ai' ? (
            <>
              <h3 className="text-xs uppercase text-muted tracking-[1px] mb-3 font-semibold">
                AI Configuration
              </h3>

              <div className="p-5 bg-surface-2 border border-border rounded-xl mt-4">
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="text-[20px]">🧠</span>
                  <div className="font-semibold">Groq API Key (Required for AI Features)</div>
                </div>
                <div className="text-[13px] text-text-secondary mb-4 leading-relaxed">
                  DataDesk uses the ultra-fast Groq API for mock interviews, code explanations, and AI dry runs. 
                  To use these features, you must provide your own free API key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-primary hover:underline">console.groq.com</a>.
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-text-secondary">Your API Key (stored locally)</label>
                  <input
                    type="password"
                    placeholder="gsk_..."
                    value={local.groqApiKey || ''}
                    onChange={(e) => set('groqApiKey', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-text text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Type to search keybindings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-text text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                {filteredShortcuts.map((s) => (
                  <ShortcutRow
                    key={s.id}
                    commandId={s.id}
                    shortcut={s}
                    conflictWith={conflicts[s.id]}
                    onReassign={handleReassignShortcut}
                  />
                ))}
                {filteredShortcuts.length === 0 && (
                  <div className="text-center text-muted p-5">
                    No shortcuts found matching "{searchQuery}"
                  </div>
                )}
              </div>

              <button
                onClick={handleResetShortcuts}
                className="btn btn-ghost w-full mt-6 text-error"
              >
                🔄 Restore Default Keybindings
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-surface">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
      <ConfirmModal
        isOpen={confirmState !== null}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmText="Confirm"
        onConfirm={() => {
          if (confirmState?.onConfirm) confirmState.onConfirm();
          setConfirmState(null);
        }}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
}
