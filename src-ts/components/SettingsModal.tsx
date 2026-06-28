import React from 'react';

export type ThemeType = 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';

interface SettingsModalProps {
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  onClose: () => void;
}

export function SettingsModal({
  theme, setTheme,
  fontSize, setFontSize,
  onClose
}: SettingsModalProps) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: 450 }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Settings</h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon">✕</button>
        </div>

        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Theme */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Theme</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setTheme('light')}
                style={{
                  flex: 1, padding: '10px', borderRadius: 6,
                  border: theme === 'light' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)', cursor: 'pointer', fontWeight: 500
                }}
              >
                Earthy Light
              </button>
              <button 
                onClick={() => setTheme('dark')}
                style={{
                  flex: 1, padding: '10px', borderRadius: 6,
                  border: theme === 'dark' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: '#2c2522',
                  color: '#e4e0e1', cursor: 'pointer', fontWeight: 500
                }}
              >
                Earthy Dark
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Editor Font Size</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {(['small', 'medium', 'large'] as FontSize[]).map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 6, textTransform: 'capitalize',
                    border: fontSize === size ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: fontSize === size ? 'var(--surface-2)' : 'var(--surface)',
                    color: 'var(--text)', cursor: 'pointer', fontWeight: 500
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
