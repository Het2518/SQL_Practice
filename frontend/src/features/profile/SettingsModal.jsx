import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  loadShortcuts,
  saveShortcuts,
  DEFAULT_SHORTCUTS,
  eventToComboString,
} from '@/utils/shortcutManager';
import { defaultSettings, SETTINGS_KEY } from './settingsConfig';
import { getGroqKey, saveGroqKey, hasGroqKey } from '@/lib/groq';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { Button } from '@/shared/ui/Button';
import { useSettingsStore } from '@/stores/useSettingsStore';

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
      onClick={() => onChange(!checked)}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{label}</span>
        {description && (
          <span style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>
            {description}
          </span>
        )}
      </div>
      <div
        style={{
          position: 'relative',
          width: '40px',
          height: '22px',
          borderRadius: '11px',
          background: checked ? 'var(--primary)' : 'var(--border)',
          transition: 'background 0.3s',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '20px' : '2px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'var(--surface)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
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
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '8px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'var(--surface)',
          border: `1px solid ${conflictWith ? 'var(--error)' : isEditing ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: '8px',
          cursor: 'pointer',
        }}
        onClick={() => setIsEditing(true)}
      >
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
          {shortcut.label}
        </span>

        {isEditing ? (
          <input
            autoFocus
            onBlur={() => setIsEditing(false)}
            onKeyDown={handleKeyDown}
            readOnly
            value="Press desired keys... (Esc to cancel)"
            style={{
              background: 'var(--bg)',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
              width: '200px',
              textAlign: 'center',
            }}
          />
        ) : (
          <kbd
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              color: 'var(--primary)',
              minWidth: '60px',
              textAlign: 'center',
            }}
          >
            {shortcut.combo}
          </kbd>
        )}
      </div>
      {conflictWith && !isEditing && (
        <span
          style={{ color: 'var(--error)', fontSize: '11px', marginTop: '4px', marginLeft: '4px' }}
        >
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
  const [groqKeyInput, setGroqKeyInput] = useState(() => getGroqKey() || '');
  const [keySaved, setKeySaved] = useState(false);
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
    // Save Groq key
    if (groqKeyInput.trim()) saveGroqKey(groqKeyInput.trim());
    else saveGroqKey('');
    // Dispatch an event so SqlEditor and App can pickup the shortcut changes without reload
    window.dispatchEvent(new Event('storage'));

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
      <div
        className="w-full max-w-[560px] bg-surface rounded-2xl overflow-hidden flex flex-col shadow-xl border border-border mx-4 max-h-[90vh]"
        style={{
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 0', background: 'var(--surface)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>⚙️</span>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
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

          <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => setActiveTab('general')}
              style={{
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderBottom:
                  activeTab === 'general' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'general' ? 'var(--primary)' : 'var(--muted)',
                fontWeight: 600,
              }}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab('shortcuts')}
              style={{
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderBottom:
                  activeTab === 'shortcuts' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'shortcuts' ? 'var(--primary)' : 'var(--muted)',
                fontWeight: 600,
              }}
            >
              Keyboard Shortcuts
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              style={{
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderBottom: activeTab === 'ai' ? '2px solid #8b5cf6' : '2px solid transparent',
                color: activeTab === 'ai' ? '#8b5cf6' : 'var(--muted)',
                fontWeight: 600,
              }}
            >
              AI Config
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'general' ? (
            <>
              <h3
                style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  letterSpacing: '1px',
                  marginBottom: '12px',
                  fontWeight: 600,
                }}
              >
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

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  marginTop: '8px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                    Editor Font Size
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    Adjust the size of the code text
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => set('editorFontSize', Math.max(10, local.editorFontSize - 1))}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface-2)',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    -
                  </button>
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      width: '24px',
                      textAlign: 'center',
                    }}
                  >
                    {local.editorFontSize}
                  </span>
                  <button
                    onClick={() => set('editorFontSize', Math.min(28, local.editorFontSize + 1))}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface-2)',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <h3
                style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  letterSpacing: '1px',
                  marginBottom: '12px',
                  fontWeight: 600,
                }}
              >
                Experience
              </h3>
              <ToggleRow
                label="Timed Challenges"
                description="Enable a countdown timer for practice sessions"
                checked={local.timedChallenges}
                onChange={(v) => set('timedChallenges', v)}
              />

              <h3
                style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  letterSpacing: '1px',
                  marginTop: '24px',
                  marginBottom: '12px',
                  fontWeight: 600,
                }}
              >
                Data & Backup
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button onClick={handleExport} className="px-4 py-2 bg-surface-2 hover:bg-surface-3 text-text rounded-lg text-sm font-semibold transition-colors border border-border flex items-center gap-2 justify-center">
                  📤 Export Backup
                </button>
                <input
                  ref={importRef}
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleImport}
                />
                <button onClick={() => importRef.current?.click()} className="px-4 py-2 bg-surface-2 hover:bg-surface-3 text-text rounded-lg text-sm font-semibold transition-colors border border-border flex items-center gap-2 justify-center">
                  📥 Import Backup
                </button>
              </div>

              <h3
                style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  letterSpacing: '1px',
                  marginTop: '24px',
                  marginBottom: '12px',
                  fontWeight: 600,
                }}
              >
                Storage Management ({storageSize})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={handleResetGeneral}
                  className="btn btn-ghost"
                  style={{ width: '100%', color: 'var(--text)' }}
                >
                  🔄 Reset General Settings
                </button>
                <div style={{ marginTop: '24px' }}>
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
              <h3
                style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  letterSpacing: '1px',
                  marginBottom: '12px',
                  fontWeight: 600,
                }}
              >
                AI Configuration
              </h3>

              <div className="p-5 bg-surface-2 border border-border rounded-xl mt-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 20 }}>🧠</span>
                  <div style={{ fontWeight: 600 }}>Groq API Key</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  DataDesk uses the ultra-fast Groq API for AI explanations. Get a free API key at{' '}
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--primary)' }}
                  >
                    console.groq.com
                  </a>
                  .
                </div>

                <input
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  type="password"
                  placeholder="gsk_..."
                  value={groqKeyInput}
                  onChange={(e) => {
                    setGroqKeyInput(e.target.value);
                    setKeySaved(false);
                  }}
                  style={{
                    boxSizing: 'border-box',
                    marginBottom: 12,
                  }}
                />

                <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold">
                  {groqKeyInput.startsWith('gsk_') ? (
                    <>
                      <span style={{ color: 'var(--success)' }}>✓</span>
                      <span style={{ color: 'var(--success)' }}>Valid key format</span>
                    </>
                  ) : groqKeyInput.length > 0 ? (
                    <>
                      <span style={{ color: 'var(--error)' }}>✗</span>
                      <span style={{ color: 'var(--error)' }}>Key should start with gsk_</span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: 'var(--muted)' }}>○</span>
                      <span style={{ color: 'var(--muted)' }}>
                        No key entered — using .env fallback
                      </span>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Type to search keybindings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                  <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>
                    No shortcuts found matching "{searchQuery}"
                  </div>
                )}
              </div>

              <button
                onClick={handleResetShortcuts}
                className="btn btn-ghost"
                style={{ marginTop: '24px', width: '100%', color: 'var(--error)' }}
              >
                🔄 Restore Default Keybindings
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            background: 'var(--surface)',
          }}
        >
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
