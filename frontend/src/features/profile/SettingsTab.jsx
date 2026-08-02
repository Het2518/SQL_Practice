import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

function ProfileToggleRow({ label, description, checked, onChange }) {
  return (
    <div
      className="flex items-center justify-between p-4 bg-surface-2 rounded-xl cursor-pointer"
      onClick={() => onChange(!checked)}
    >
      <div>
        <div className="font-semibold text-text">{label}</div>
        <div className="text-[13px] text-muted">{description}</div>
      </div>
      <div
        className={`relative w-10 h-[22px] rounded-full shrink-0 transition-colors duration-300 ${
          checked ? 'bg-primary' : 'bg-border'
        }`}
      >
        <div
          className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-md transition-all duration-300 ${
            checked ? 'left-[20px]' : 'left-[2px]'
          }`}
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
    <div className="glass-panel page-enter p-10 flex flex-col gap-6">
      <h2 className="text-2xl font-extrabold mb-2 flex items-center gap-3 text-text m-0">
        <SettingsIcon className="text-primary" /> Application Settings
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

      <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl">
        <div>
          <div className="font-semibold text-text">Editor Font Size</div>
          <div className="text-[13px] text-muted">
            Adjust the size of the SQL editor font
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            className="btn btn-ghost"
            onClick={() =>
              updateSetting('editorFontSize', Math.max(12, (settings?.editorFontSize || 14) - 2))
            }
          >
            -
          </button>
          <span className="w-[30px] text-center font-semibold text-text">
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
    <div className="bg-surface-2 p-6 rounded-xl">
      <h3 className="text-lg font-bold mb-4 text-text m-0">Change Password</h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="block text-[13px] mb-1 text-text-secondary">Current Password</label>
          <input 
            type="password" 
            required
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-bg text-text"
          />
        </div>
        <div>
          <label className="block text-[13px] mb-1 text-text-secondary">New Password</label>
          <input 
            type="password" 
            required
            minLength={6}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-bg text-text"
          />
        </div>
        <div>
          <label className="block text-[13px] mb-1 text-text-secondary">Confirm New Password</label>
          <input 
            type="password" 
            required
            minLength={6}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-bg text-text"
          />
        </div>

        {message && (
          <div className={`p-2 rounded-md text-[13px] ${status === 'error' ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
            {message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="self-start flex items-center gap-2 px-4 py-2 bg-primary text-white border-none rounded-md cursor-pointer font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
