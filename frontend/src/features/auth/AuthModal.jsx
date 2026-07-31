import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const VIEWS = { LOGIN: 'login', REGISTER: 'register' };

export function AuthModal({ onClose }) {
  const { loginWithEmail, register } = useAuth();
  const [view, setView] = useState(VIEWS.LOGIN);
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      if (view === VIEWS.LOGIN) {
        await loginWithEmail(form.email, form.password);
      } else {
        await register({ email: form.email, password: form.password, displayName: form.displayName });
      }
      onClose();
    } catch (err) {
      setStatus('error');
      const msg = err.response?.data?.message || err.message || 'Something went wrong.';
      setErrorMsg(msg);
    } finally {
      if (status !== 'error') setStatus('idle');
    }
  };

  const isLogin = view === VIEWS.LOGIN;

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
          ⚡
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
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
          {isLogin
            ? 'Log in to sync your progress and join the leaderboard.'
            : 'Join DataDesk to track your SQL journey.'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          {/* Display Name (register only) */}
          {!isLogin && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}
              >
                Display Name (optional)
              </label>
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

          {/* Email */}
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

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              name="password"
              placeholder={isLogin ? '••••••••' : 'Min. 6 characters'}
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Error message */}
          {errorMsg && (
            <div
              style={{
                color: 'var(--error)',
                marginBottom: 16,
                fontSize: 13,
                fontWeight: 500,
                padding: '10px 14px',
                background: 'var(--error-muted, rgba(239,68,68,0.08))',
                borderRadius: 8,
                border: '1px solid var(--error)',
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              width: '100%',
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
            {status === 'loading'
              ? isLogin
                ? 'Logging in...'
                : 'Creating account...'
              : isLogin
                ? 'Log In'
                : 'Create Account'}
          </button>
        </form>

        {/* Toggle view */}
        <p style={{ marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setView(isLogin ? VIEWS.REGISTER : VIEWS.LOGIN);
              setErrorMsg('');
              setStatus('idle');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
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
