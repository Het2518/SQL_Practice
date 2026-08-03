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
        <div className="p-5 font-sans text-text bg-bg min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-error/5 rounded-full blur-[150px] pointer-events-none" />

          <div className="bg-surface/80 backdrop-blur-xl p-8 sm:p-12 rounded-3xl border border-error/20 max-w-[540px] w-full shadow-[0_0_100px_rgba(239,68,68,0.1)] relative z-10">
            {/* Top Red Gradient Bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-error/80 to-transparent" />

            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-error/20 to-error/5 text-error flex items-center justify-center mx-auto mb-8 border border-error/30 shadow-lg shadow-error/20 relative">
              <div className="absolute inset-0 bg-error/20 rounded-full animate-ping opacity-50" />
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
            </div>
            
            <h1 className="text-text text-3xl mb-4 font-black tracking-tight drop-shadow-sm">Application Error</h1>
            <p className="text-text-secondary text-sm sm:text-base mb-10 leading-relaxed max-w-md mx-auto">
              We encountered an unexpected issue while loading this view. This is usually temporary or caused by a background update.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.assign('/?t=' + Date.now())}
                className="px-8 py-3.5 bg-text text-bg border-none rounded-xl cursor-pointer font-bold text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(var(--text),0.2)]"
              >
                Refresh Page
              </button>
              <button 
                onClick={this.handleHardReset}
                className="px-8 py-3.5 bg-surface-2 text-text border border-border rounded-xl cursor-pointer font-bold text-sm transition-all duration-300 hover:bg-surface-3 hover:border-border-hover"
              >
                Clear Cache & Restart
              </button>
            </div>

            <details className="whitespace-pre-wrap mt-10 text-left bg-bg/50 p-5 rounded-2xl border border-border group">
              <summary className="font-bold cursor-pointer text-text-secondary text-xs flex items-center gap-2 select-none hover:text-text transition-colors uppercase tracking-widest">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-open:rotate-90"><path d="m9 18 6-6-6-6"/></svg>
                View Technical Details
              </summary>
              <div className="mt-5 text-xs text-text font-mono overflow-x-auto bg-[#09090b] p-4 rounded-xl border border-border/50 shadow-inner">
                <div className="text-error font-bold leading-relaxed">{this.state.error && this.state.error.toString()}</div>
                <div className="mt-3 text-muted/80 leading-relaxed border-t border-border/30 pt-3">{this.state.errorInfo && this.state.errorInfo.componentStack}</div>
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
