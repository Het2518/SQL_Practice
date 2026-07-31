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
          fontFamily: 'system-ui, sans-serif', 
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
            padding: '40px', 
            borderRadius: '16px', 
            border: '1px solid var(--border)',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <h1 style={{ color: 'var(--error)', fontSize: '28px', marginBottom: '16px', fontWeight: 800 }}>Oops, something went wrong.</h1>
            <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '32px', lineHeight: 1.6 }}>
              We encountered an unexpected issue while loading this page. This usually happens when an update was released while you were browsing.
            </p>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button 
                onClick={() => window.location.assign('/?t=' + Date.now())}
                style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: '0.2s', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Refresh Page
              </button>
              <button 
                onClick={this.handleHardReset}
                style={{ padding: '12px 24px', background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: '0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
              >
                Clear Data & Restart
              </button>
            </div>

            <details style={{ whiteSpace: 'pre-wrap', marginTop: '32px', textAlign: 'left', background: 'var(--bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <summary style={{ fontWeight: '600', cursor: 'pointer', color: 'var(--muted)', fontSize: '13px' }}>View Technical Details</summary>
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
