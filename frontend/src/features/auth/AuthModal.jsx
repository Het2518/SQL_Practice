import React, { useState, useEffect } from 'react';
import { useAuth } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
import { Mail, Lock, User, Zap, X, ShieldCheck, KeyRound, ArrowRight, Loader2 } from 'lucide-react';

const VIEWS = { 
  LOGIN: 'login', 
  REGISTER: 'register',
  VERIFY: 'verify',
  FORGOT_PASSWORD: 'forgot_password',
  RESET_PASSWORD: 'reset_password'
};

export function AuthModal({ onClose }) {
  const { loginWithEmail, register, verifyEmail } = useAuth();
  const [view, setView] = useState(VIEWS.LOGIN);
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    displayName: '',
    code: '',
    newPassword: ''
  });
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const clearMessages = () => {
    setMessage('');
    setStatus('idle');
  };

  const switchView = (newView) => {
    setView(newView);
    clearMessages();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    
    try {
      if (view === VIEWS.LOGIN) {
        if (!form.email || !form.password) return;
        await loginWithEmail(form.email, form.password);
        onClose();
        
      } else if (view === VIEWS.REGISTER) {
        if (!form.email || !form.password) return;
        const result = await register({ email: form.email, password: form.password, displayName: form.displayName });
        
        if (result.verified) {
          onClose(); // Automatically log in since Render bypass is active
        } else {
          setStatus('success');
          setMessage('Account created! Please check your email for the 6-digit verification code.');
          setView(VIEWS.VERIFY);
        }
        
      } else if (view === VIEWS.VERIFY) {
        if (!form.email || !form.code) return;
        await verifyEmail(form.email, form.code);
        onClose();

      } else if (view === VIEWS.FORGOT_PASSWORD) {
        if (!form.email) return;
        await api.auth.forgotPassword({ email: form.email });
        setStatus('success');
        setMessage('If an account exists, a password reset email was sent.');
        setView(VIEWS.RESET_PASSWORD);
        
      } else if (view === VIEWS.RESET_PASSWORD) {
        if (!form.email || !form.code || !form.newPassword) return;
        await api.auth.resetPassword({ email: form.email, code: form.code, newPassword: form.newPassword });
        setStatus('success');
        setMessage('Password reset successful! You can now log in.');
        setView(VIEWS.LOGIN);
      }
    } catch (err) {
      setStatus('error');
      
      // Handle the specific "Not Verified" error during login
      if (err.response?.data?.code === 'NOT_VERIFIED') {
        setMessage(err.response.data.message);
        setView(VIEWS.VERIFY);
      } else {
        setMessage(err.response?.data?.message || err.message || 'Something went wrong.');
      }
    } finally {
      if (status !== 'error' && status !== 'success') setStatus('idle');
    }
  };

  const getIcon = () => {
    switch(view) {
      case VIEWS.VERIFY: return <ShieldCheck size={32} className="text-primary" />;
      case VIEWS.FORGOT_PASSWORD:
      case VIEWS.RESET_PASSWORD: return <KeyRound size={32} className="text-primary" />;
      case VIEWS.REGISTER: return <User size={32} className="text-primary" />;
      default: return <Zap size={32} className="text-primary" />;
    }
  };

  const getTitle = () => {
    switch(view) {
      case VIEWS.LOGIN: return 'Welcome Back';
      case VIEWS.REGISTER: return 'Create Account';
      case VIEWS.VERIFY: return 'Verify Email';
      case VIEWS.FORGOT_PASSWORD: return 'Reset Password';
      case VIEWS.RESET_PASSWORD: return 'Enter Reset Code';
      default: return '';
    }
  };

  const getSubtitle = () => {
    switch(view) {
      case VIEWS.LOGIN: return 'Log in to sync your progress and join the leaderboard.';
      case VIEWS.REGISTER: return 'Join DataDesk to track your SQL journey.';
      case VIEWS.VERIFY: return `We sent a 6-digit code to ${form.email || 'your email'}.`;
      case VIEWS.FORGOT_PASSWORD: return 'Enter your email to receive a password reset code.';
      case VIEWS.RESET_PASSWORD: return `Enter the 6-digit code sent to ${form.email || 'your email'}.`;
      default: return '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-2xl bg-surface border border-border/50 shadow-2xl transition-all duration-500 ease-out transform ${
          animateIn ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-accent-1" />

        <button
          className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text rounded-full hover:bg-surface-2 transition-colors"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div className="px-8 pt-10 pb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4 ring-8 ring-primary/5">
              {getIcon()}
            </div>
            <h2 className="text-2xl font-bold text-text tracking-tight mb-2">
              {getTitle()}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {getSubtitle()}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Name (register only) */}
            {view === VIEWS.REGISTER && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Display Name <span className="lowercase normal-case font-medium text-muted">(optional)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="displayName"
                    placeholder="SQL Ninja"
                    value={form.displayName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            {(view === VIEWS.LOGIN || view === VIEWS.REGISTER || view === VIEWS.FORGOT_PASSWORD) && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            {(view === VIEWS.LOGIN || view === VIEWS.REGISTER) && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Password</label>
                  {view === VIEWS.LOGIN && (
                    <button 
                      type="button" 
                      onClick={() => switchView(VIEWS.FORGOT_PASSWORD)}
                      className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder={view === VIEWS.LOGIN ? '••••••••' : 'Min. 8 characters'}
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Verification / Reset Code */}
            {(view === VIEWS.VERIFY || view === VIEWS.RESET_PASSWORD) && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider text-center block">6-Digit Code</label>
                <input
                  type="text"
                  name="code"
                  placeholder="------"
                  value={form.code}
                  onChange={handleChange}
                  required
                  maxLength={6}
                  className="w-full py-4 bg-surface-2 border border-border rounded-xl text-center text-2xl tracking-[0.75em] font-mono font-bold text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                />
              </div>
            )}

            {/* New Password */}
            {view === VIEWS.RESET_PASSWORD && (
              <div className="space-y-1.5 mt-4">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Min. 8 characters"
                    value={form.newPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Status Messages */}
            {message && (
              <div
                className={`p-3 rounded-lg text-sm font-medium border ${
                  status === 'error' 
                    ? 'bg-error/10 text-error border-error/20' 
                    : 'bg-success/10 text-success border-success/20'
                } flex items-start gap-2 animate-in fade-in zoom-in-95 duration-200`}
              >
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="group relative w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-primary to-primary-hover hover:to-accent-1 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {view === VIEWS.LOGIN ? 'Log In' :
                     view === VIEWS.REGISTER ? 'Create Account' :
                     view === VIEWS.VERIFY ? 'Verify & Log In' :
                     view === VIEWS.FORGOT_PASSWORD ? 'Send Reset Code' :
                     'Reset Password'}
                  </span>
                  {(view === VIEWS.LOGIN || view === VIEWS.VERIFY) && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </>
              )}
            </button>
          </form>

          {/* Toggle View Links */}
          <div className="mt-8 text-center text-sm text-text-secondary">
            {view === VIEWS.LOGIN && (
              <p>Don't have an account? <button onClick={() => switchView(VIEWS.REGISTER)} className="font-semibold text-primary hover:text-primary-hover transition-colors">Sign Up</button></p>
            )}
            {view === VIEWS.REGISTER && (
              <p>Already have an account? <button onClick={() => switchView(VIEWS.LOGIN)} className="font-semibold text-primary hover:text-primary-hover transition-colors">Log In</button></p>
            )}
            {(view === VIEWS.VERIFY || view === VIEWS.FORGOT_PASSWORD || view === VIEWS.RESET_PASSWORD) && (
              <p><button onClick={() => switchView(VIEWS.LOGIN)} className="font-semibold text-primary hover:text-primary-hover transition-colors flex items-center justify-center gap-1 mx-auto"><ArrowRight size={14} className="rotate-180" /> Back to Log In</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
