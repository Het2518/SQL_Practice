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
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', color: 'black', background: 'white', minHeight: '100vh' }}>
          <h1 style={{ color: 'red' }}>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary style={{ fontWeight: 'bold', cursor: 'pointer' }}>Click for error details</summary>
            <p style={{ marginTop: '10px', color: '#d32f2f' }}>{this.state.error && this.state.error.toString()}</p>
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button 
            onClick={() => window.location.href = '/'}
            style={{ marginTop: '20px', padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
