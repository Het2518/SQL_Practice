import React, { useState, useRef } from 'react';

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

export function SettingsModal({ settings, onSave, onClose }) {
  const [local, setLocal] = useState({ ...settings });
  const importRef = useRef();

  const set = (key, value) => setLocal(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(local));
    } catch {}
    onSave(local);
    onClose();
  };

  const handleExport = () => {
    const data = {
      settings: local,
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
        if (data.progress) localStorage.setItem('sql-practice-progress', JSON.stringify(data.progress));
        alert('✅ Import successful! Save settings to apply.');
      } catch {
        alert('❌ Invalid backup file.');
      }
    };
    reader.readAsText(file);
    if (importRef.current) importRef.current.value = '';
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to default?')) {
      setLocal({ ...defaultSettings });
    }
  };

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
          maxWidth: '520px',
          background: 'var(--bg-2)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface)',
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
            className="btn btn-ghost btn-icon"
            style={{ borderRadius: '50%', padding: '6px' }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '60vh' }}>
          
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px', marginBottom: '12px', fontWeight: 600 }}>Editor & Workspace</h3>
          <ToggleRow
            label="Dark Mode"
            description="Use a darker, eye-friendly color theme"
            checked={local.darkMode}
            onChange={v => set('darkMode', v)}
          />
          <ToggleRow
            label="Auto Complete SQL"
            description="Show intelligent keyword and schema suggestions while typing"
            checked={local.autoCompleteSql}
            onChange={v => set('autoCompleteSql', v)}
          />
          <ToggleRow
            label="Auto Run After Typing"
            description="Execute query automatically after 1 second of inactivity"
            checked={local.autoRunAfterTyping}
            onChange={v => set('autoRunAfterTyping', v)}
          />
          <ToggleRow
            label="Persist Editor Text"
            description="Remember your SQL query text when you switch between questions"
            checked={local.persistEditorText}
            onChange={v => set('persistEditorText', v)}
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
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Editor Font Size</span>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Adjust the size of the code text</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => set('editorFontSize', Math.max(10, local.editorFontSize - 1))}
                style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                -
              </button>
              <span style={{ fontSize: '15px', fontWeight: 600, width: '24px', textAlign: 'center' }}>
                {local.editorFontSize}
              </span>
              <button
                onClick={() => set('editorFontSize', Math.min(28, local.editorFontSize + 1))}
                style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                +
              </button>
            </div>
          </div>

          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px', marginBottom: '12px', fontWeight: 600 }}>Experience</h3>
          <ToggleRow
            label="Timed Challenges"
            description="Enable a countdown timer for practice sessions"
            checked={local.timedChallenges}
            onChange={v => set('timedChallenges', v)}
          />
          <ToggleRow
            label="Disable Advertisements"
            description="Hide promotional content and banners"
            checked={local.disableAdvertisements}
            onChange={v => set('disableAdvertisements', v)}
          />

          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px', marginTop: '24px', marginBottom: '12px', fontWeight: 600 }}>Data & Backup</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={handleExport}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
            >
              📤 Export Backup
            </button>

            <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
            <button
              onClick={() => importRef.current?.click()}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
            >
              📥 Import Backup
            </button>
          </div>
          <button
            onClick={handleReset}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.05)',
              color: 'var(--error)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)')}
          >
            🔄 Reset to Defaults
          </button>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 600, flex: 1, justifyContent: 'center' }}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}