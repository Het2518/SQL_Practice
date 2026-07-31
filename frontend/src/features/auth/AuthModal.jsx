import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

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
        await register({ email: form.email, password: form.password, displayName: form.displayName });
        setStatus('success');
        setMessage('Account created! Please check your email for the 6-digit verification code.');
        setView(VIEWS.VERIFY);
        
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

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.4)' }}
    >
      <div
        className="modal-content"
        style={{
          maxWidth: 420,
          textAlign: 'center',
          padding: '40px 32px',
          borderRadius: 24,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} style={{ top: 20, right: 20 }}>
          ×
        </button>

        {/* Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            background: 'var(--surface-2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            border: '1px solid var(--border)',
            fontSize: 28,
          }}
        >
          {view === VIEWS.VERIFY ? '✉️' : view === VIEWS.FORGOT_PASSWORD || view === VIEWS.RESET_PASSWORD ? '🔒' : '⚡'}
        </div>

        <h2
          style={{
            marginBottom: 8,
            fontSize: 28,
            fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}
        >
          {view === VIEWS.LOGIN && 'Welcome Back'}
          {view === VIEWS.REGISTER && 'Create Account'}
          {view === VIEWS.VERIFY && 'Verify Email'}
          {view === VIEWS.FORGOT_PASSWORD && 'Reset Password'}
          {view === VIEWS.RESET_PASSWORD && 'Enter Reset Code'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
          {view === VIEWS.LOGIN && 'Log in to sync your progress and join the leaderboard.'}
          {view === VIEWS.REGISTER && 'Join DataDesk to track your SQL journey.'}
          {view === VIEWS.VERIFY && `We sent a 6-digit code to ${form.email || 'your email'}.`}
          {view === VIEWS.FORGOT_PASSWORD && 'Enter your email to receive a password reset code.'}
          {view === VIEWS.RESET_PASSWORD && `Enter the 6-digit code sent to ${form.email || 'your email'}.`}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          
          {/* Display Name (register only) */}
          {view === VIEWS.REGISTER && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Display Name (optional)</label>
              <input
                type="text"
                name="displayName"
                placeholder="e.g. SQL Ninja"
                value={form.displayName}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          )}

          {/* Email (not needed for verify/reset if already entered, but good to keep visible/editable) */}
          {(view === VIEWS.LOGIN || view === VIEWS.REGISTER || view === VIEWS.FORGOT_PASSWORD) && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          )}

          {/* Password (login, register) */}
          {(view === VIEWS.LOGIN || view === VIEWS.REGISTER) && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={labelStyle}>Password</label>
                {view === VIEWS.LOGIN && (
                  <button 
                    type="button" 
                    onClick={() => switchView(VIEWS.FORGOT_PASSWORD)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', padding: 0 }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                name="password"
                placeholder={view === VIEWS.LOGIN ? '••••••••' : 'Min. 6 characters'}
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          )}

          {/* Verification / Reset Code */}
          {(view === VIEWS.VERIFY || view === VIEWS.RESET_PASSWORD) && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>6-Digit Code</label>
              <input
                type="text"
                name="code"
                placeholder="123456"
                value={form.code}
                onChange={handleChange}
                required
                maxLength={6}
                style={{ ...inputStyle, letterSpacing: '8px', textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          )}

          {/* New Password (reset password only) */}
          {view === VIEWS.RESET_PASSWORD && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Min. 6 characters"
                value={form.newPassword}
                onChange={handleChange}
                required
                minLength={6}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          )}

          {/* Messages */}
          {message && (
            <div
              style={{
                color: status === 'error' ? 'var(--error)' : 'var(--success, #10b981)',
                marginTop: 16,
                marginBottom: 16,
                fontSize: 13,
                fontWeight: 500,
                padding: '10px 14px',
                background: status === 'error' ? 'var(--error-muted, rgba(239,68,68,0.08))' : 'rgba(16, 185, 129, 0.08)',
                borderRadius: 8,
                border: `1px solid ${status === 'error' ? 'var(--error)' : '#10b981'}`,
              }}
            >
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              width: '100%',
              marginTop: 16,
              padding: '14px',
              fontSize: 15,
              fontWeight: 600,
              background: 'var(--primary)',
              color: '#fff',
              borderRadius: 12,
              border: 'none',
              cursor: status === 'loading' ? 'default' : 'pointer',
              opacity: status === 'loading' ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            {status === 'loading' ? 'Processing...' : 
             view === VIEWS.LOGIN ? 'Log In' :
             view === VIEWS.REGISTER ? 'Create Account' :
             view === VIEWS.VERIFY ? 'Verify & Log In' :
             view === VIEWS.FORGOT_PASSWORD ? 'Send Reset Code' :
             'Reset Password'}
          </button>
        </form>

        {/* Toggle view */}
        <div style={{ marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          {view === VIEWS.LOGIN && (
            <p>Don't have an account? <button onClick={() => switchView(VIEWS.REGISTER)} style={linkBtnStyle}>Sign Up</button></p>
          )}
          {view === VIEWS.REGISTER && (
            <p>Already have an account? <button onClick={() => switchView(VIEWS.LOGIN)} style={linkBtnStyle}>Log In</button></p>
          )}
          {(view === VIEWS.VERIFY || view === VIEWS.FORGOT_PASSWORD || view === VIEWS.RESET_PASSWORD) && (
            <p><button onClick={() => switchView(VIEWS.LOGIN)} style={linkBtnStyle}>Back to Log In</button></p>
          )}
        </div>
      </div>
    </div>
  );
}

// Shared styles
const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--surface-2)',
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
  transition: 'border 0.2s',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: 6,
};

const linkBtnStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--primary)',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 14,
  padding: 0,
};
