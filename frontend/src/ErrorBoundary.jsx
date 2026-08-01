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
        <div className="p-5 font-sans text-text bg-bg min-h-screen flex flex-col items-center justify-center text-center">
          <div className="bg-surface p-8 sm:p-12 rounded-2xl border border-border max-w-[540px] w-full shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto mb-6 border border-error/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
            </div>
            
            <h1 className="text-text text-2xl mb-3 font-extrabold tracking-tight">Application Error</h1>
            <p className="text-text-secondary text-sm sm:text-base mb-8 leading-relaxed">
              We encountered an unexpected issue while loading this view. This is usually temporary or caused by a background update.
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center">
              <button 
                onClick={() => window.location.assign('/?t=' + Date.now())}
                className="px-6 py-3 bg-text text-bg border-none rounded-xl cursor-pointer font-semibold text-sm transition-all duration-150 hover:opacity-90 hover:-translate-y-0.5 shadow-sm"
              >
                Refresh Page
              </button>
              <button 
                onClick={this.handleHardReset}
                className="px-6 py-3 bg-surface-2 text-text border border-border rounded-xl cursor-pointer font-semibold text-sm transition-all duration-150 hover:bg-surface-3"
              >
                Clear Cache & Restart
              </button>
            </div>

            <details className="whitespace-pre-wrap mt-8 text-left bg-bg p-4 rounded-xl border border-border group">
              <summary className="font-semibold cursor-pointer text-muted text-xs flex items-center gap-1.5 select-none hover:text-text transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-open:rotate-90"><path d="m9 18 6-6-6-6"/></svg>
                View Technical Details
              </summary>
              <div className="mt-4 text-xs text-text font-mono overflow-x-auto">
                <div className="text-error font-bold">{this.state.error && this.state.error.toString()}</div>
                <div className="mt-2 text-muted leading-relaxed">{this.state.errorInfo && this.state.errorInfo.componentStack}</div>
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
