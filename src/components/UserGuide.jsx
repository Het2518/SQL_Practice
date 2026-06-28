import React from 'react';
import { useNavigate } from 'react-router-dom';

export function UserGuide() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        padding: '16px 32px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-ghost"
          style={{ fontSize: 14, fontWeight: 600 }}
        >
          ← Back to Home
        </button>
        <h1 style={{ margin: 0, fontSize: 20, color: 'var(--text)', fontWeight: 700 }}>
          Application Guide & Documentation
        </h1>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        maxWidth: 900,
        margin: '0 auto',
        padding: '40px 20px',
        width: '100%'
      }}>
        <div className="guide-content" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          
          <section>
            <h2 style={{ fontSize: 28, marginBottom: 16, color: 'var(--accent)', borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>
              Getting Started
            </h2>
            <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: 15 }}>
              Welcome to the SQL Practice Platform! This tool is designed to help you master SQL through hands-on practice with real-world datasets. 
              Choose a database from the home screen to begin. You can track your progress, save your favorite queries, and analyze your execution plans.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 28, marginBottom: 16, color: 'var(--accent)', borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>
              How to Run Queries
            </h2>
            <ul style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: 15, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <li><strong>Write:</strong> Type your SQL query in the Monaco editor on the left.</li>
              <li><strong>Execute:</strong> Click the "Run" button or use the keyboard shortcut <kbd>Ctrl</kbd> + <kbd>Enter</kbd>.</li>
              <li><strong>Results:</strong> View the results in the bottom pane. We provide automatic schema visualization, pagination, and execution stats.</li>
              <li><strong>Hints:</strong> If you're stuck, click the "💡 Hint" button on the Question panel.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 28, marginBottom: 16, color: 'var(--accent)', borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>
              Keyboard Shortcuts
            </h2>
            <div style={{
              background: 'var(--surface-2)',
              borderRadius: 8,
              border: '1px solid var(--border)',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Action</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Shortcut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>Run Query</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><kbd>Ctrl</kbd> + <kbd>Enter</kbd></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>Format Code</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><kbd>Ctrl</kbd> + <kbd>Q</kbd></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>Explain Query</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><kbd>Ctrl</kbd> + <kbd>E</kbd></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>Toggle Left Sidebar</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><kbd>Ctrl</kbd> + <kbd>B</kbd></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>Toggle Right Sidebar</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><kbd>Ctrl</kbd> + <kbd>`</kbd></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px' }}>Show Hint</td>
                    <td style={{ padding: '12px 16px' }}><kbd>Ctrl</kbd> + <kbd>H</kbd></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>
              <em>Note: You can customize these shortcuts via the Settings menu on the Home screen.</em>
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 28, marginBottom: 16, color: 'var(--accent)', borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>
              Supported SQL Syntax
            </h2>
            <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: 15 }}>
              This platform is powered by <strong>SQLite (v3.41+)</strong> running via WebAssembly in your browser. All standard SQLite syntax is supported, including:
            </p>
            <ul style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: 15, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              <li><strong>Window Functions:</strong> ROW_NUMBER(), RANK(), DENSE_RANK(), LAG(), LEAD()</li>
              <li><strong>Common Table Expressions (CTEs):</strong> WITH clause</li>
              <li><strong>Joins:</strong> INNER, LEFT, RIGHT, FULL OUTER, CROSS</li>
              <li><strong>Aggregations:</strong> COUNT, SUM, AVG, MAX, MIN, GROUP_CONCAT</li>
              <li><strong>Set Operations:</strong> UNION, UNION ALL, INTERSECT, EXCEPT</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 28, marginBottom: 16, color: 'var(--accent)', borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>
              Frequently Asked Questions (FAQ)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: 16, color: 'var(--text)' }}>Where is my data stored?</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>All databases run purely in your browser's memory using WebAssembly. Your progress is stored securely in your browser's LocalStorage and optionally synced to the cloud if you create an account.</p>
              </div>
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: 16, color: 'var(--text)' }}>Why do I see a "Syntax Error" when I use RIGHT JOIN?</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>Ensure you are using the latest browser version. Our underlying engine supports RIGHT and FULL OUTER joins natively as of SQLite 3.39.0.</p>
              </div>
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: 16, color: 'var(--text)' }}>Can I upload my own data?</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>Yes! From the home screen, click the "Upload Custom Dataset (CSV)" button at the bottom to spawn a sandbox database populated with your files.</p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
