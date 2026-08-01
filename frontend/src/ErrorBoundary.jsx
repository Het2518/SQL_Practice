import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
    
    // Auto-recovery for chunk loading errors (stale cache) or general crashes
    // We only try this once per session to avoid infinite loops
    const hasRecovered = sessionStorage.getItem('datadesk_recovered_error');
    if (!hasRecovered) {
      sessionStorage.setItem('datadesk_recovered_error', 'true');
      
      // Attempt to clear SW and Caches aggressively
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          for (let reg of regs) { reg.unregister(); }
        }).catch(() => {});
      }
      
      // Add a cache buster query param to force fresh files
      const url = new URL(window.location.href);
      url.searchParams.set('reload', Date.now());
      window.location.replace(url.toString());
    }
  }

  handleHardReset = async () => {
    localStorage.clear();
    sessionStorage.clear();
    
    // Nuke service workers so they don't serve a cached broken index.html
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      } catch (e) {
        console.error("SW clear failed", e);
      }
    }
    
    // Clear all browser caches (where vite-plugin-pwa usually stores index.html)
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      } catch (e) {
        console.error("Cache clear failed", e);
      }
    }

    // Force hard reload from server
    window.location.href = '/?hardreset=' + Date.now();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px 20px', 
          fontFamily: 'var(--font-sans)', 
          color: 'var(--text)', 
          background: 'var(--bg)', 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div style={{ 
            background: 'var(--surface)', 
            padding: '48px 40px', 
            borderRadius: 'var(--radius-xl)', 
            border: '1px solid var(--border)',
            maxWidth: '540px',
            width: '100%',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'var(--error-muted)',
              color: 'var(--error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
            </div>
            
            <h1 style={{ color: 'var(--text)', fontSize: '24px', marginBottom: '12px', fontWeight: 800, letterSpacing: '-0.02em' }}>Application Error</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px', lineHeight: 1.6 }}>
              We encountered an unexpected issue while loading this view. This is usually temporary or caused by a background update.
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => window.location.assign('/?t=' + Date.now())}
                style={{ padding: '12px 24px', background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.15s ease', boxShadow: 'var(--shadow-sm)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1'; }}
              >
                Refresh Page
              </button>
              <button 
                onClick={this.handleHardReset}
                style={{ padding: '12px 24px', background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.15s ease' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
              >
                Clear Cache & Restart
              </button>
            </div>

            <details style={{ whiteSpace: 'pre-wrap', marginTop: '32px', textAlign: 'left', background: 'var(--bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <summary style={{ fontWeight: '600', cursor: 'pointer', color: 'var(--muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', userSelect: 'none' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                View Technical Details
              </summary>
              <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text)', fontFamily: 'monospace', overflowX: 'auto' }}>
                <div style={{ color: 'var(--error)', fontWeight: 'bold' }}>{this.state.error && this.state.error.toString()}</div>
                <div style={{ marginTop: '8px', color: 'var(--muted)' }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</div>
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
