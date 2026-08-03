import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, User, Terminal, Loader2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

const VIEWS = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT_PASSWORD: 'forgot_password',
  RESET_PASSWORD: 'reset_password',
};

export default function AuthPage() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState(VIEWS.LOGIN);
  
  const [form, setForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    identifier: '',
    code: '',
    newPassword: '',
  });
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/practice', { replace: true });
    }
  }, [user, navigate]);

  // Set initial view based on query params (e.g. ?view=register)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('view') === 'register') {
      setView(VIEWS.REGISTER);
    }
  }, [location]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const switchView = (newView) => {
    setView(newView);
    setMessage('');
    setStatus('idle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    let nextStatus = 'idle';
    
    try {
      if (view === VIEWS.LOGIN) {
        if (!form.identifier || !form.password) return;
        await login(form.identifier, form.password);
        nextStatus = 'success';
        navigate('/practice');
        
      } else if (view === VIEWS.REGISTER) {
        if (!form.email || !form.username || !form.password) return;
        if (form.password !== form.confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        await register({ 
          email: form.email, 
          username: form.username, 
          password: form.password, 
          displayName: form.displayName 
        });
        nextStatus = 'success';
        navigate('/practice');
        
      } else if (view === VIEWS.FORGOT_PASSWORD) {
        if (!form.email) return;
        await api.auth.forgotPassword({ email: form.email });
        nextStatus = 'success';
        setMessage('If an account exists, a password reset email was sent.');
        setView(VIEWS.RESET_PASSWORD);
        
      } else if (view === VIEWS.RESET_PASSWORD) {
        if (!form.email || !form.code || !form.newPassword) return;
        await api.auth.resetPassword({ email: form.email, code: form.code, newPassword: form.newPassword });
        nextStatus = 'success';
        setMessage('Password reset successful! You can now log in.');
        setView(VIEWS.LOGIN);
      }
    } catch (err) {
      nextStatus = 'error';
      setMessage(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setStatus(nextStatus);
    }
  };

  return (
    <div className="flex-1 w-full h-full overflow-y-auto flex items-center justify-center bg-bg py-12 px-4 sm:px-6 lg:px-8 page-enter relative overflow-hidden">
      
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="absolute w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] opacity-60 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[80px] translate-y-20 translate-x-32 opacity-60" />
      </div>

      <div className="max-w-md w-full space-y-8 bg-surface/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-border/50 relative z-10">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-primary flex items-center justify-center rounded-2xl mb-6 shadow-sm border border-border/50">
            <Terminal size={28} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-text">
            {view === VIEWS.LOGIN && 'Welcome Back'}
            {view === VIEWS.REGISTER && 'Create Account'}
            {view === VIEWS.FORGOT_PASSWORD && 'Reset Password'}
            {view === VIEWS.RESET_PASSWORD && 'New Password'}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {view === VIEWS.LOGIN && 'Sign in to sync your progress and join the leaderboard.'}
            {view === VIEWS.REGISTER && 'Join DataDesk to track your SQL journey.'}
            {view === VIEWS.FORGOT_PASSWORD && 'Enter your email to reset your password.'}
            {view === VIEWS.RESET_PASSWORD && 'Enter the reset code sent to your email.'}
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          
          {/* REGISTER FIELDS */}
          {view === VIEWS.REGISTER && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Name (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <User size={18} />
                  </div>
                  <input
                    name="displayName"
                    type="text"
                    placeholder="John Doe"
                    value={form.displayName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 bg-surface-2 border border-border/50 rounded-xl text-text focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all shadow-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Username *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <User size={18} />
                  </div>
                  <input
                    name="username"
                    type="text"
                    required
                    placeholder="johndoe"
                    value={form.username}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 bg-surface-2 border border-border/50 rounded-xl text-text focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Email *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Mail size={18} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 bg-surface-2 border border-border/50 rounded-xl text-text focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Password *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Lock size={18} />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 bg-surface-2 border border-border/50 rounded-xl text-text focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Confirm Password *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Lock size={18} />
                  </div>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 bg-surface-2 border border-border/50 rounded-xl text-text focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all shadow-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* LOGIN FIELDS */}
          {view === VIEWS.LOGIN && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Username or Email *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <User size={18} />
                  </div>
                  <input
                    name="identifier"
                    type="text"
                    required
                    placeholder="johndoe or you@example.com"
                    value={form.identifier}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 bg-surface-2 border border-border/50 rounded-xl text-text focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-text-secondary">Password *</label>
                  <button 
                    type="button" 
                    onClick={() => switchView(VIEWS.FORGOT_PASSWORD)}
                    className="text-xs font-semibold text-primary hover:text-primary-hover"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Lock size={18} />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 bg-surface-2 border border-border/50 rounded-xl text-text focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all shadow-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* FORGOT PASSWORD */}
          {(view === VIEWS.FORGOT_PASSWORD || view === VIEWS.RESET_PASSWORD) && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 bg-surface-2 border border-border rounded-lg text-text focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                />
              </div>
            </div>
          )}

          {/* RESET PASSWORD ONLY */}
          {view === VIEWS.RESET_PASSWORD && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">6-Digit Code *</label>
                <input
                  name="code"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="------"
                  value={form.code}
                  onChange={handleChange}
                  className="block w-full py-3 bg-surface-2 border border-border/50 rounded-xl text-center text-xl tracking-[0.5em] font-mono font-bold text-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">New Password *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Lock size={18} />
                  </div>
                  <input
                    name="newPassword"
                    type="password"
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    value={form.newPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 bg-surface-2 border border-border/50 rounded-xl text-text focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all shadow-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* Status Message */}
          {message && (
            <div className={`p-3 rounded-md text-sm font-medium ${
              status === 'error' ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
            }`}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full flex justify-center items-center h-12 hero-btn-primary rounded-xl text-sm font-bold text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-bg disabled:opacity-70 transition-all"
          >
            {status === 'loading' ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                {view === VIEWS.LOGIN && 'Sign In'}
                {view === VIEWS.REGISTER && 'Create Account'}
                {view === VIEWS.FORGOT_PASSWORD && 'Send Reset Code'}
                {view === VIEWS.RESET_PASSWORD && 'Reset Password'}
                {(view === VIEWS.LOGIN || view === VIEWS.REGISTER) && <ArrowRight size={16} className="ml-2" />}
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          {view === VIEWS.LOGIN && (
            <p className="text-sm text-text-secondary">
              Don't have an account?{' '}
              <button type="button" onClick={() => switchView(VIEWS.REGISTER)} className="font-semibold text-primary hover:text-primary-hover transition-colors">Sign Up</button>
            </p>
          )}
          {view === VIEWS.REGISTER && (
            <p className="text-sm text-text-secondary">
              Already have an account?{' '}
              <button type="button" onClick={() => switchView(VIEWS.LOGIN)} className="font-semibold text-primary hover:text-primary-hover transition-colors">Sign In</button>
            </p>
          )}
          {(view === VIEWS.FORGOT_PASSWORD || view === VIEWS.RESET_PASSWORD) && (
            <p className="text-sm text-text-secondary">
              <button type="button" onClick={() => switchView(VIEWS.LOGIN)} className="font-semibold text-primary hover:text-primary-hover transition-colors">Back to Sign In</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
