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
import { Settings, X, Bot, Download, UploadCloud, RotateCcw, Trash2, ClipboardCopy, HardDrive, Keyboard, Search } from 'lucide-react';

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
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-bg/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[600px] bg-surface/95 dark:bg-surface-2/95 backdrop-blur-2xl rounded-[28px] overflow-hidden flex flex-col shadow-2xl shadow-black/20 border border-border/50 mx-4 max-h-[85vh] transform transition-all">
        {/* Header */}
        <div className="pt-6 px-8 pb-0 bg-transparent">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                <Settings size={20} className="animate-[spin_4s_linear_infinite]" />
              </div>
              <h2 className="text-2xl font-black m-0 text-text tracking-tight">
                Preferences
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-bg border border-border hover:bg-surface-3 text-text-secondary hover:text-text hover:border-primary/50 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex gap-2 border-b border-border pb-4">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-5 py-2.5 rounded-xl cursor-pointer text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'general'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text border border-transparent hover:border-border'
              }`}
            >
              <Settings size={16} /> General
            </button>
            <button
              onClick={() => setActiveTab('shortcuts')}
              className={`px-5 py-2.5 rounded-xl cursor-pointer text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'shortcuts'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text border border-transparent hover:border-border'
              }`}
            >
              <Keyboard size={16} /> Shortcuts
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 flex justify-center px-5 py-2.5 rounded-xl cursor-pointer text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'ai'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text border border-transparent hover:border-border'
              }`}
            >
              <Bot size={16} /> AI Config
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-8">
          {activeTab === 'general' ? (
            <>
              <div>
                <h3 className="text-xs uppercase text-primary tracking-widest mb-4 font-black flex items-center gap-2">
                  <Settings size={14} /> Editor & Workspace
                </h3>
                <div className="space-y-2">
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

                  <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl mt-2 transition-colors hover:border-primary/50">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-text">
                        Editor Font Size
                      </span>
                      <span className="text-xs text-text-secondary">
                        Adjust the size of the code text
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-bg p-1 rounded-lg border border-border">
                      <button
                        onClick={() => set('editorFontSize', Math.max(10, local.editorFontSize - 1))}
                        className="w-8 h-8 rounded-md bg-surface text-text cursor-pointer flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all font-bold shadow-sm"
                      >
                        -
                      </button>
                      <span className="text-[15px] font-bold w-8 text-center text-text">
                        {local.editorFontSize}
                      </span>
                      <button
                        onClick={() => set('editorFontSize', Math.min(28, local.editorFontSize + 1))}
                        className="w-8 h-8 rounded-md bg-surface text-text cursor-pointer flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all font-bold shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase text-primary tracking-widest mb-4 font-black flex items-center gap-2">
                  <Database size={14} /> Experience
                </h3>
                <ToggleRow
                  label="Timed Challenges"
                  description="Enable a countdown timer for practice sessions"
                  checked={local.timedChallenges}
                  onChange={(v) => set('timedChallenges', v)}
                />
              </div>

              <div>
                <h3 className="text-xs uppercase text-primary tracking-widest mb-4 font-black flex items-center gap-2">
                  <HardDrive size={14} /> Data & Backup
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleExport} className="px-4 py-3 bg-bg hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-text rounded-xl text-sm font-bold transition-all border border-border flex items-center gap-2 justify-center shadow-sm">
                    <Download size={16} /> Export Backup
                  </button>
                  <input
                    ref={importRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImport}
                  />
                  <button onClick={() => importRef.current?.click()} className="px-4 py-3 bg-bg hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-text rounded-xl text-sm font-bold transition-all border border-border flex items-center gap-2 justify-center shadow-sm">
                    <UploadCloud size={16} /> Import Backup
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase text-primary tracking-widest mb-4 font-black flex items-center justify-between">
                  <div className="flex items-center gap-2"><Trash2 size={14} /> Storage Management</div>
                  <span className="text-text-secondary bg-bg px-2 py-1 rounded-md lowercase tracking-normal">{storageSize} used</span>
                </h3>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleResetGeneral}
                    className="w-full px-4 py-3 bg-bg hover:bg-surface-3 text-text rounded-xl text-sm font-bold transition-all border border-border flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} /> Reset General Settings
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <button
                      onClick={async () => {
                        const progress = localStorage.getItem('sql-practice-progress') || '{}';
                        await navigator.clipboard.writeText(progress);
                        alert('Progress copied to clipboard!');
                      }}
                      className="w-full px-4 py-3 hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-text border border-border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-bg"
                    >
                      <ClipboardCopy size={16} /> Copy Raw Progress
                    </button>
                    <button
                      onClick={handleClearAllData}
                      className="w-full px-4 py-3 bg-error/5 border border-error/20 hover:bg-error hover:text-white text-error rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} /> Hard Reset All Progress
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === 'ai' ? (
            <>
              <h3 className="text-xs uppercase text-purple-500 tracking-widest mb-4 font-black flex items-center gap-2">
                <Bot size={14} /> AI Configuration
              </h3>

              <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Bot size={20} />
                  </div>
                  <div className="font-bold text-lg text-text tracking-tight">Groq API Key</div>
                </div>
                <div className="text-[14px] text-text-secondary mb-6 leading-relaxed">
                  DataDesk uses the ultra-fast Groq API for mock interviews, code explanations, and AI dry runs. 
                  To use these features, you must provide your own free API key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-purple-500 font-bold hover:underline">console.groq.com</a>.
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Your API Key (Stored Locally)</label>
                  <div className="relative group">
                    <input
                      type="password"
                      placeholder="gsk_..."
                      value={local.groqApiKey || ''}
                      onChange={(e) => set('groqApiKey', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-text text-base font-mono focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search keybindings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-bg text-text text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2 bg-surface p-2 rounded-2xl border border-border">
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
                  <div className="text-center text-text-secondary font-medium p-8">
                    No shortcuts found matching "{searchQuery}"
                  </div>
                )}
              </div>

              <button
                onClick={handleResetShortcuts}
                className="w-full mt-6 px-4 py-3 bg-error/5 border border-error/20 hover:bg-error hover:text-white text-error rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} /> Restore Default Keybindings
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-border flex justify-end gap-3 bg-transparent">
          <Button variant="ghost" onClick={onClose} className="rounded-xl px-6 font-bold">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20">
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
