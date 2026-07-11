import React from 'react';

interface State { error: Error | null }

/** Last line of defense: a crash anywhere shows a recovery screen, never a blank page. */
export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('App crash:', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="page" style={{ minHeight: '100dvh', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>😵</div>
          <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
          <p className="tag-note" style={{ marginBottom: 14 }}>
            Your data is safe — it lives on this device (and in your cloud space if you're signed in).
            Reloading usually fixes it.
          </p>
          <button className="btn primary big" onClick={() => window.location.reload()}>Reload</button>
          <details style={{ marginTop: 12, textAlign: 'left' }}>
            <summary className="tag-note" style={{ cursor: 'pointer' }}>Technical details</summary>
            <pre style={{ fontSize: '0.7rem', color: 'var(--text-faint)', whiteSpace: 'pre-wrap', marginTop: 6 }}>
              {this.state.error.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
