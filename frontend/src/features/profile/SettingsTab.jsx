import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

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

      {/* CHANGE PASSWORD SECTION */}
      {useAuth().user && (
        <ChangePasswordSection />
      )}

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

function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [status, setStatus] = React.useState('idle');
  const [message, setMessage] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('New passwords do not match.');
      return;
    }
    
    setStatus('loading');
    setMessage('');
    
    try {
      await api.auth.updatePassword({ currentPassword, newPassword });
      setStatus('success');
      setMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || err.message || 'Failed to update password.');
    } finally {
      if (status !== 'error' && status !== 'success') setStatus('idle');
    }
  };

  return (
    <div style={{ background: 'var(--surface-2)', padding: '24px', borderRadius: '12px' }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>Change Password</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--text-secondary)' }}>Current Password</label>
          <input 
            type="password" 
            required
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--text-secondary)' }}>New Password</label>
          <input 
            type="password" 
            required
            minLength={6}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--text-secondary)' }}>Confirm New Password</label>
          <input 
            type="password" 
            required
            minLength={6}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
        </div>

        {message && (
          <div style={{ padding: '8px', borderRadius: 6, fontSize: 13, background: status === 'error' ? 'var(--error-muted, rgba(239,68,68,0.1))' : 'var(--success-muted, rgba(34,197,94,0.1))', color: status === 'error' ? 'var(--error)' : 'var(--success)' }}>
            {message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={status === 'loading'}
          style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
        >
          {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
