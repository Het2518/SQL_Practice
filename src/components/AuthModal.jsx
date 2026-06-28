import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function AuthModal({ onClose }) {
  const { loginWithGoogle, loginWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(''); // 'idle', 'loading', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await loginWithEmail(email);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.4)' }}>
      <div className="modal-content" style={{ maxWidth: 420, textAlign: 'center', padding: '40px 32px', borderRadius: 24, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 24px 48px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} style={{ top: 20, right: 20 }}>×</button>
        <div style={{ width: 64, height: 64, background: 'var(--surface-2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid var(--border)', fontSize: 28 }}>
          ⚡
        </div>
        <h2 style={{ marginBottom: 12, fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
          Save your progress, sync across devices, and join the global leaderboard.
        </p>

        <button 
          className="btn" 
          style={{ width: '100%', marginBottom: 24, padding: '14px', fontSize: 15, fontWeight: 600, background: 'var(--primary)', color: 'var(--surface)', borderRadius: 12, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, transition: 'transform 0.1s, opacity 0.1s' }}
          onClick={() => loginWithGoogle()}
          onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
          onMouseLeave={e => e.currentTarget.style.opacity = 1}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)', marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ padding: '0 16px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {status === 'success' ? (
          <div style={{ padding: '20px', background: 'var(--success-muted)', color: 'var(--success)', borderRadius: 12, border: '1px solid var(--success)', fontWeight: 500 }}>
            ✨ Check your email for the magic login link!
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit}>
            <input 
              type="email" 
              placeholder="Email address" 
              className="modal-input" 
              style={{ width: '100%', marginBottom: 16, padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontSize: 15, outline: 'none', transition: 'border 0.2s' }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button 
              type="submit" 
              className="btn" 
              style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 600, background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 12, cursor: status === 'loading' ? 'default' : 'pointer', transition: 'all 0.1s' }}
              disabled={status === 'loading'}
              onMouseEnter={e => { if(status !== 'loading') e.currentTarget.style.background = 'var(--surface-2)' }}
              onMouseLeave={e => { if(status !== 'loading') e.currentTarget.style.background = 'transparent' }}
            >
              {status === 'loading' ? 'Sending link...' : 'Send Magic Link'}
            </button>
            {status === 'error' && <div style={{ color: 'var(--error)', marginTop: 16, fontSize: 14, fontWeight: 500 }}>{errorMsg}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
