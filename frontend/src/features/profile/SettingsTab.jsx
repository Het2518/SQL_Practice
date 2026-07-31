import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';

function ProfileToggleRow({ label, description, checked, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        background: 'var(--surface-2)',
        borderRadius: 12,
        cursor: 'pointer',
      }}
      onClick={() => onChange(!checked)}
    >
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{label}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>{description}</div>
      </div>
      <div
        style={{
          position: 'relative',
          width: 40,
          height: 22,
          borderRadius: 11,
          background: checked ? 'var(--primary)' : 'var(--border)',
          transition: 'background 0.3s',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 20 : 2,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'left 0.3s',
          }}
        />
      </div>
    </div>
  );
}

export function SettingsTab() {
  const { settings, updateSettings } = useSettingsStore();

  const updateSetting = (key, value) => {
    updateSettings({ [key]: value });
  };

  return (
    <div
      className="glass-panel page-enter"
      style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <h2
        style={{
          fontSize: 24,
          fontWeight: 800,
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: 'var(--text)',
        }}
      >
        <SettingsIcon color="var(--primary)" /> Application Settings
      </h2>

      <ProfileToggleRow
        label="Dark Mode"
        description="Toggle application theme"
        checked={settings?.darkMode}
        onChange={(v) => updateSetting('darkMode', v)}
      />
      <ProfileToggleRow
        label="Auto-run Queries"
        description="Automatically execute SQL after you stop typing"
        checked={settings?.autoRunAfterTyping}
        onChange={(v) => updateSetting('autoRunAfterTyping', v)}
      />
      <ProfileToggleRow
        label="Auto-complete SQL"
        description="Enable syntax autocomplete in the editor"
        checked={settings?.autoCompleteSql}
        onChange={(v) => updateSetting('autoCompleteSql', v)}
      />
      <ProfileToggleRow
        label="Persist Editor Text"
        description="Save your query text when switching questions"
        checked={settings?.persistEditorText}
        onChange={(v) => updateSetting('persistEditorText', v)}
      />
      <ProfileToggleRow
        label="Timed Challenges"
        description="Enable countdown timer for practice questions"
        checked={settings?.timedChallenges}
        onChange={(v) => updateSetting('timedChallenges', v)}
      />
      <ProfileToggleRow
        label="Disable Advertisements"
        description="Hide sponsor messages in the practice interface"
        checked={settings?.disableAdvertisements}
        onChange={(v) => updateSetting('disableAdvertisements', v)}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          background: 'var(--surface-2)',
          borderRadius: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text)' }}>Editor Font Size</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            Adjust the size of the SQL editor font
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="btn btn-ghost"
            onClick={() =>
              updateSetting('editorFontSize', Math.max(12, (settings?.editorFontSize || 14) - 2))
            }
          >
            -
          </button>
          <span style={{ width: 30, textAlign: 'center', fontWeight: 600, color: 'var(--text)' }}>
            {settings?.editorFontSize || 14}px
          </span>
          <button
            className="btn btn-ghost"
            onClick={() =>
              updateSetting('editorFontSize', Math.min(24, (settings?.editorFontSize || 14) + 2))
            }
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
