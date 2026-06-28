import React, { useState, useRef, useEffect, useMemo } from 'react';
import { loadShortcuts, saveShortcuts, DEFAULT_SHORTCUTS, eventToComboString } from '../utils/shortcutManager';

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
  disableAdvertisements: true,
  editorFontSize: 14,
};

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
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{label}</span>
        {description && (
          <span style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{description}</span>
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
          cursor: 'pointer'
        }}
        onClick={() => setIsEditing(true)}
      >
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{shortcut.label}</span>
        
        {isEditing ? (
          <input 
            autoFocus
            onBlur={() => setIsEditing(false)}
            onKeyDown={handleKeyDown}
            readOnly
            value="Press desired keys... (Esc to cancel)"
            style={{ 
              background: 'var(--bg)', border: 'none', color: 'var(--primary)', 
              fontSize: '12px', padding: '4px 8px', borderRadius: '4px', width: '200px', textAlign: 'center'
            }}
          />
        ) : (
          <kbd style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '12px',
            color: 'var(--primary)',
            minWidth: '60px',
            textAlign: 'center'
          }}>
            {shortcut.combo}
          </kbd>
        )}
      </div>
      {conflictWith && !isEditing && (
        <span style={{ color: 'var(--error)', fontSize: '11px', marginTop: '4px', marginLeft: '4px' }}>
          ⚠️ Conflicts with "{conflictWith}"
        </span>
      )}
    </div>
  );
}

export function SettingsModal({ settings, onSave, onClose }) {
  const [local, setLocal] = useState({ ...settings });
  const [shortcuts, setShortcuts] = useState(() => loadShortcuts());
  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  
  const importRef = useRef();

  const set = (key, value) => setLocal(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(local));
      saveShortcuts(shortcuts);
      // Dispatch an event so SqlEditor and App can pickup the shortcut changes without reload
      window.dispatchEvent(new Event('storage'));
    } catch {}
    onSave(local);
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
        if (data.progress) localStorage.setItem('sql-practice-progress', JSON.stringify(data.progress));
        alert('✅ Import successful! Save settings to apply.');
      } catch {
        alert('❌ Invalid backup file.');
      }
    };
    reader.readAsText(file);
    if (importRef.current) importRef.current.value = '';
  };

  const handleResetGeneral = () => {
    if (window.confirm('Reset general settings to default?')) {
      setLocal({ ...defaultSettings });
    }
  };
  
  const handleResetShortcuts = () => {
    if (window.confirm('Reset all keyboard shortcuts to default?')) {
      setShortcuts({ ...DEFAULT_SHORTCUTS });
    }
  };

  const handleReassignShortcut = (id, combo) => {
    setShortcuts(prev => ({
      ...prev,
      [id]: { ...prev[id], combo }
    }));
  };

  // Find conflicts
  const conflicts = useMemo(() => {
    const map = {};
    const conflictMap = {};
    Object.values(shortcuts).forEach(s => {
      if (map[s.combo]) {
        conflictMap[s.id] = map[s.combo].label;
        conflictMap[map[s.combo].id] = s.label;
      }
      map[s.combo] = s;
    });
    return conflictMap;
  }, [shortcuts]);

  const filteredShortcuts = Object.values(shortcuts).filter(s => 
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.combo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--bg-2)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 0', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>⚙️</span>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                Preferences
              </h2>
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ borderRadius: '50%', padding: '6px' }}>
              ✕
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)' }}>
            <button 
              onClick={() => setActiveTab('general')}
              style={{ padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                       borderBottom: activeTab === 'general' ? '2px solid var(--primary)' : '2px solid transparent',
                       color: activeTab === 'general' ? 'var(--primary)' : 'var(--muted)', fontWeight: 600 }}
            >
              General Settings
            </button>
            <button 
              onClick={() => setActiveTab('shortcuts')}
              style={{ padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                       borderBottom: activeTab === 'shortcuts' ? '2px solid var(--primary)' : '2px solid transparent',
                       color: activeTab === 'shortcuts' ? 'var(--primary)' : 'var(--muted)', fontWeight: 600 }}
            >
              Keyboard Shortcuts
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          
          {activeTab === 'general' ? (
            <>
              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px', marginBottom: '12px', fontWeight: 600 }}>Editor & Workspace</h3>
              <ToggleRow label="Dark Mode" description="Use a darker, eye-friendly color theme" checked={local.darkMode} onChange={v => set('darkMode', v)} />
              <ToggleRow label="Auto Complete SQL" description="Show intelligent keyword and schema suggestions while typing" checked={local.autoCompleteSql} onChange={v => set('autoCompleteSql', v)} />
              <ToggleRow label="Auto Run After Typing" description="Execute query automatically after 1 second of inactivity" checked={local.autoRunAfterTyping} onChange={v => set('autoRunAfterTyping', v)} />
              <ToggleRow label="Persist Editor Text" description="Remember your SQL query text when you switch between questions" checked={local.persistEditorText} onChange={v => set('persistEditorText', v)} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', marginTop: '8px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Editor Font Size</span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Adjust the size of the code text</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => set('editorFontSize', Math.max(10, local.editorFontSize - 1))} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                  <span style={{ fontSize: '15px', fontWeight: 600, width: '24px', textAlign: 'center' }}>{local.editorFontSize}</span>
                  <button onClick={() => set('editorFontSize', Math.min(28, local.editorFontSize + 1))} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>

              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px', marginBottom: '12px', fontWeight: 600 }}>Experience</h3>
              <ToggleRow label="Timed Challenges" description="Enable a countdown timer for practice sessions" checked={local.timedChallenges} onChange={v => set('timedChallenges', v)} />
              <ToggleRow label="Disable Advertisements" description="Hide promotional content and banners" checked={local.disableAdvertisements} onChange={v => set('disableAdvertisements', v)} />

              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px', marginTop: '24px', marginBottom: '12px', fontWeight: 600 }}>Data & Backup</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button onClick={handleExport} className="btn btn-secondary">📤 Export Backup</button>
                <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
                <button onClick={() => importRef.current?.click()} className="btn btn-secondary">📥 Import Backup</button>
              </div>
              <button onClick={handleResetGeneral} className="btn btn-ghost" style={{ marginTop: '12px', width: '100%', color: 'var(--error)' }}>
                🔄 Reset General Settings
              </button>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <input 
                  type="text" 
                  placeholder="Type to search keybindings..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {filteredShortcuts.map(s => (
                  <ShortcutRow 
                    key={s.id} 
                    commandId={s.id} 
                    shortcut={s} 
                    conflictWith={conflicts[s.id]}
                    onReassign={handleReassignShortcut} 
                  />
                ))}
                {filteredShortcuts.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>No shortcuts found matching "{searchQuery}"</div>
                )}
              </div>
              
              <button onClick={handleResetShortcuts} className="btn btn-ghost" style={{ marginTop: '24px', width: '100%', color: 'var(--error)' }}>
                🔄 Restore Default Keybindings
              </button>
            </>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}>
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 600, flex: 1, justifyContent: 'center' }}>
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}