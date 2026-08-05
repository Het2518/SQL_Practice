import React, { useState } from 'react';
import { Moon, Sun, Type, Play, Code2, Save, Clock, EyeOff, Shield, Trash2, ChevronUp, ChevronDown, Eye, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/useAuthStore';

function SectionHeader({ title, description, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 pb-5 border-b border-border/50 mb-5">
      <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={15} className="text-primary" />
      </div>
      <div>
        <h3 className="m-0 text-[14px] font-black text-text">{title}</h3>
        {description && <p className="m-0 mt-0.5 text-[12px] text-muted font-medium">{description}</p>}
      </div>
    </div>
  );
}

function SettingSection({ children, className = '' }) {
  return (
    <div className={`bg-surface border border-border/50 rounded-[20px] p-6 ${className}`}>
      {children}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border/30 last:border-0 cursor-pointer group" onClick={() => onChange(!checked)}>
      <div>
        <div className="text-[13px] font-semibold text-text group-hover:text-primary transition-colors">{label}</div>
        {description && <div className="text-[11px] text-muted mt-0.5 font-medium">{description}</div>}
      </div>
      <div className={`relative w-11 h-[24px] rounded-full flex-shrink-0 ml-6 transition-colors duration-300 ${checked ? 'bg-primary' : 'bg-border'}`}>
        <div className={`absolute top-[3px] w-[18px] h-[18px] rounded-full shadow-md transition-all duration-300 ${checked ? 'left-[22px] bg-white' : 'left-[3px] bg-white'}`} />
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-[12px] font-semibold text-muted mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'} required value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 pr-10 rounded-xl border border-border bg-bg text-text text-[13px] outline-none focus:border-primary/50 focus:ring-2 ring-primary/15 transition-all"
        />
        <button type="button" onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors cursor-pointer p-0 bg-transparent border-none">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

import { Button } from '@/shared/ui/Button';

function ChangePasswordSection() {
  const [current, setCurrent]   = useState('');
  const [next, setNext]         = useState('');
  const [confirm, setConfirm]   = useState('');
  const [status, setStatus]     = useState('idle'); // idle | loading | success | error
  const [msg, setMsg]           = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (next !== confirm) { setStatus('error'); setMsg('New passwords do not match.'); return; }
    if (next.length < 6)  { setStatus('error'); setMsg('Password must be at least 6 characters.'); return; }
    setStatus('loading'); setMsg('');
    try {
      await api.auth.updatePassword({ currentPassword: current, newPassword: next });
      setStatus('success'); setMsg('Password updated successfully.');
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err) {
      setStatus('error'); setMsg(err.response?.data?.message || err.message || 'Failed to update password.');
    }
  };

  return (
    <SettingSection>
      <SectionHeader title="Security" description="Manage your account password." icon={Shield} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PasswordField label="Current Password"  value={current}  onChange={setCurrent} />
        <PasswordField label="New Password"      value={next}     onChange={setNext} />
        <PasswordField label="Confirm Password"  value={confirm}  onChange={setConfirm} />
        {msg && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold ${status === 'error' ? 'bg-error/10 text-error border border-error/20' : 'bg-success/10 text-success border border-success/20'}`}>
            {status === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
            {msg}
          </div>
        )}
        <Button 
          type="submit" 
          variant="primary"
          isLoading={status === 'loading'}
          disabled={status === 'loading'}
          className="self-start rounded-xl font-bold px-6"
        >
          {status === 'loading' ? 'Updating...' : 'Update Password'}
        </Button>
      </form>
    </SettingSection>
  );
}

export function SettingsTab() {
  const { settings, updateSettings } = useSettingsStore();
  const { user } = useAuth();
  const set = (key, val) => updateSettings({ [key]: val });
  const fontSize = settings?.editorFontSize || 14;

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Appearance */}
      <SettingSection>
        <SectionHeader title="Appearance" description="Customize how the application looks." icon={Sun} />
        <ToggleRow
          label="Dark Mode" description="Toggle between light and dark theme."
          checked={settings?.darkMode} onChange={(v) => set('darkMode', v)}
        />
        <div className="flex items-center justify-between py-3.5">
          <div>
            <div className="text-[13px] font-semibold text-text">Editor Font Size</div>
            <div className="text-[11px] text-muted mt-0.5 font-medium">Adjust the SQL editor text size</div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-6">
            <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-2 border border-border text-muted hover:text-text hover:bg-surface-3 transition-all cursor-pointer"
              onClick={() => set('editorFontSize', Math.max(12, fontSize - 1))}>
              <ChevronDown size={14} />
            </button>
            <span className="w-12 text-center text-[13px] font-bold text-text tabular-nums">{fontSize}px</span>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-2 border border-border text-muted hover:text-text hover:bg-surface-3 transition-all cursor-pointer"
              onClick={() => set('editorFontSize', Math.min(24, fontSize + 1))}>
              <ChevronUp size={14} />
            </button>
          </div>
        </div>
      </SettingSection>

      {/* Editor */}
      <SettingSection>
        <SectionHeader title="Editor" description="Configure the SQL code editor behavior." icon={Code2} />
        <ToggleRow label="Auto-run Queries" description="Automatically execute SQL after you stop typing." checked={settings?.autoRunAfterTyping} onChange={(v) => set('autoRunAfterTyping', v)} />
        <ToggleRow label="Auto-complete SQL" description="Enable syntax auto-complete in the editor." checked={settings?.autoCompleteSql} onChange={(v) => set('autoCompleteSql', v)} />
        <ToggleRow label="Persist Editor Text" description="Save your query text when switching between questions." checked={settings?.persistEditorText} onChange={(v) => set('persistEditorText', v)} />
      </SettingSection>

      {/* Practice */}
      <SettingSection>
        <SectionHeader title="Practice" description="Customize your practice session experience." icon={Clock} />
        <ToggleRow label="Timed Challenges" description="Enable a countdown timer during practice questions." checked={settings?.timedChallenges} onChange={(v) => set('timedChallenges', v)} />
        <ToggleRow label="Disable Sponsor Messages" description="Hide sponsor banners in the practice interface." checked={settings?.disableAdvertisements} onChange={(v) => set('disableAdvertisements', v)} />
      </SettingSection>

      {/* Security */}
      {user && <ChangePasswordSection />}

    </div>
  );
}
