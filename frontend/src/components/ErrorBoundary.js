// ==========================================
// src/components/ErrorBoundary.js
// Catches unexpected JS errors in the component tree.
// Shows a friendly fallback instead of a blank white screen.
// Usage: wrap <App /> or any subtree with <ErrorBoundary>
// ==========================================

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Called when a child component throws
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Log the error (could send to Sentry etc.)
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Navigate home as a clean recovery
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', padding: '24px',
          background: '#f1f5f9', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💥</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '360px', marginBottom: '24px' }}>
            An unexpected error occurred. Don't worry — your data is safe.
          </p>
          {/* Show error details in development */}
          {process.env.NODE_ENV === 'development' && (
            <pre style={{
              background: '#1e293b', color: '#ef4444', padding: '16px',
              borderRadius: '8px', fontSize: '0.75rem', textAlign: 'left',
              maxWidth: '500px', overflow: 'auto', marginBottom: '20px',
            }}>
              {this.state.error?.toString()}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 28px', background: '#2563eb', color: '#fff',
              border: 'none', borderRadius: '100px', fontSize: '0.9rem',
              fontWeight: 700, cursor: 'pointer',
            }}
          >
            🔄 Go back to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
