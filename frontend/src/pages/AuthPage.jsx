import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/stores/useAuthStore';
import { Mail, Lock, User, Terminal, ArrowRight, ShieldCheck, Database, Zap, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/shared/ui/Button';

const VIEWS = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT_PASSWORD: 'forgot_password',
  RESET_PASSWORD: 'reset_password',
};

// ─── Reusable Input Component ───
function AuthInput({ icon: Icon, ...props }) {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted group-focus-within:text-primary transition-colors">
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <input
        {...props}
        className="block w-full pl-11 pr-4 py-3.5 bg-surface border border-border/50 rounded-2xl text-[13px] font-semibold text-text placeholder-muted/70 focus:bg-surface focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] outline-none"
      />
    </div>
  );
}

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

  useEffect(() => {
    if (user) navigate('/practice', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('view') === 'register') setView(VIEWS.REGISTER);
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
        if (form.password !== form.confirmPassword) throw new Error("Passwords do not match.");
        await register({ email: form.email, username: form.username, password: form.password, displayName: form.displayName });
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
    <div className="flex w-full h-[100dvh] overflow-hidden bg-bg">
      
      {/* ─── LEFT PANEL (Visual Hook - Hidden on Mobile) ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-surface text-text overflow-hidden border-r border-border/50">
        {/* Glows & Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Abstract Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none"
             style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shadow-sm backdrop-blur-md">
            <Terminal size={20} className="text-primary" />
          </div>
          <span className="text-[20px] font-black tracking-tight text-text">DataDesk.</span>
        </div>

        {/* Center Graphic */}
        <div className="relative z-10 flex flex-col items-start gap-8 max-w-lg mt-12">
          <div className="px-4 py-1.5 rounded-full border border-primary/10 bg-primary/5 backdrop-blur-md text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 shadow-sm">
            <Sparkles size={12} className="text-primary" /> Product Hunt Design of the Year
          </div>
          <h1 className="text-[52px] font-black leading-[1.05] tracking-tight text-text">
            Master SQL.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              Land the offer.
            </span>
          </h1>
          <p className="text-[17px] text-text-secondary font-medium leading-relaxed">
            The ultimate platform for data engineers and analysts. Practice real-world interview questions, build your streak, and climb the global leaderboard.
          </p>
          
          <div className="flex flex-col gap-5 mt-4 w-full">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 shadow-sm backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 text-primary">
                <Database size={20} />
              </div>
              <div>
                <div className="text-[14px] font-bold text-text">Real-world Schemas</div>
                <div className="text-[12px] text-text-secondary font-medium mt-0.5">Practice on multi-table datasets</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-success/5 border border-success/10 shadow-sm backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-success/5 flex items-center justify-center border border-success/10 text-success">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="text-[14px] font-bold text-text">AI Mock Interviews</div>
                <div className="text-[12px] text-text-secondary font-medium mt-0.5">Get graded by our FAANG-calibre AI</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[13px] font-medium text-muted">
          © {new Date().getFullYear()} DataDesk platform.
        </div>
      </div>

      {/* ─── RIGHT PANEL (The Form) ─── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto page-enter">
        {/* Mobile-only background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="w-full max-w-[420px] relative z-10">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Terminal size={20} />
            </div>
            <span className="text-[20px] font-black tracking-tight text-text">DataDesk.</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-[32px] font-black tracking-tight text-text mb-2">
              {view === VIEWS.LOGIN && 'Welcome back'}
              {view === VIEWS.REGISTER && 'Create account'}
              {view === VIEWS.FORGOT_PASSWORD && 'Reset password'}
              {view === VIEWS.RESET_PASSWORD && 'Set new password'}
            </h2>
            <p className="text-[14px] text-muted font-medium">
              {view === VIEWS.LOGIN && 'Enter your credentials to access your command center.'}
              {view === VIEWS.REGISTER && 'Start your SQL mastery journey today.'}
              {view === VIEWS.FORGOT_PASSWORD && 'We will send you a 6-digit recovery code.'}
              {view === VIEWS.RESET_PASSWORD && 'Check your inbox for the recovery code.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {view === VIEWS.REGISTER && (
              <div className="flex flex-col gap-4 animate-[smoothFadeIn_0.3s_ease-out_forwards]">
                <AuthInput name="displayName" type="text" placeholder="Full Name (Optional)" value={form.displayName} onChange={handleChange} icon={User} />
                <AuthInput name="username" type="text" required placeholder="Username" value={form.username} onChange={handleChange} icon={User} />
                <AuthInput name="email" type="email" required placeholder="name@company.com" value={form.email} onChange={handleChange} icon={Mail} />
                <AuthInput name="password" type="password" required minLength={8} placeholder="Password (min 8 chars)" value={form.password} onChange={handleChange} icon={Lock} />
                <AuthInput name="confirmPassword" type="password" required minLength={8} placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} icon={Lock} />
              </div>
            )}

            {view === VIEWS.LOGIN && (
              <div className="flex flex-col gap-4 animate-[smoothFadeIn_0.3s_ease-out_forwards]">
                <AuthInput name="identifier" type="text" required placeholder="Username or Email" value={form.identifier} onChange={handleChange} icon={User} />
                <div className="flex flex-col gap-1.5">
                  <AuthInput name="password" type="password" required placeholder="Password" value={form.password} onChange={handleChange} icon={Lock} />
                  <div className="text-right mt-1">
                    <button type="button" onClick={() => switchView(VIEWS.FORGOT_PASSWORD)} className="text-[12px] font-bold text-primary hover:text-primary-hover transition-colors">
                      Forgot password?
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(view === VIEWS.FORGOT_PASSWORD || view === VIEWS.RESET_PASSWORD) && (
              <div className="flex flex-col gap-4 animate-[smoothFadeIn_0.3s_ease-out_forwards]">
                <AuthInput name="email" type="email" required placeholder="name@company.com" value={form.email} onChange={handleChange} icon={Mail} />
              </div>
            )}

            {view === VIEWS.RESET_PASSWORD && (
              <div className="flex flex-col gap-4 animate-[smoothFadeIn_0.3s_ease-out_forwards]">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted group-focus-within:text-primary transition-colors">
                    <Zap size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    name="code" type="text" required maxLength={6} placeholder="6-Digit Code" value={form.code} onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3.5 bg-surface border border-border/50 rounded-2xl text-[18px] font-mono font-bold tracking-[0.3em] text-text placeholder-muted/50 focus:bg-surface focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all shadow-sm outline-none uppercase"
                  />
                </div>
                <AuthInput name="newPassword" type="password" required minLength={8} placeholder="New Password" value={form.newPassword} onChange={handleChange} icon={Lock} />
              </div>
            )}

            {/* Status Alert */}
            {message && (
              <div className={`mt-2 p-3.5 rounded-xl border text-[12px] font-bold animate-[smoothFadeIn_0.2s_ease-out_forwards] ${
                status === 'error' ? 'bg-error/10 border-error/20 text-error' : 'bg-success/10 border-success/20 text-success'
              }`}>
                {message}
              </div>
            )}

            {/* Submit */}
            <div className="mt-4">
              <Button type="submit" variant="primary" size="lg" className="w-full h-12 text-[14px] font-bold rounded-2xl shadow-[0_8px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_12px_24px_rgba(99,102,241,0.35)] transition-all" isLoading={status === 'loading'}>
                {view === VIEWS.LOGIN && 'Sign In'}
                {view === VIEWS.REGISTER && 'Create Account'}
                {view === VIEWS.FORGOT_PASSWORD && 'Send Reset Link'}
                {view === VIEWS.RESET_PASSWORD && 'Reset Password'}
                {(view === VIEWS.LOGIN || view === VIEWS.REGISTER) && <ArrowRight size={16} />}
              </Button>
            </div>
          </form>

          {/* Footer Toggles */}
          <div className="mt-8 text-center text-[13px] font-semibold text-muted">
            {view === VIEWS.LOGIN && (
              <>Don't have an account? <button type="button" onClick={() => switchView(VIEWS.REGISTER)} className="text-text hover:text-primary transition-colors underline underline-offset-4 decoration-border hover:decoration-primary">Sign up</button></>
            )}
            {view === VIEWS.REGISTER && (
              <>Already have an account? <button type="button" onClick={() => switchView(VIEWS.LOGIN)} className="text-text hover:text-primary transition-colors underline underline-offset-4 decoration-border hover:decoration-primary">Sign in</button></>
            )}
            {(view === VIEWS.FORGOT_PASSWORD || view === VIEWS.RESET_PASSWORD) && (
              <><button type="button" onClick={() => switchView(VIEWS.LOGIN)} className="text-text hover:text-primary transition-colors underline underline-offset-4 decoration-border hover:decoration-primary">Back to Sign in</button></>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
