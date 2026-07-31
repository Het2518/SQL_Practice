import React, { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { loadShortcuts, saveShortcuts, DEFAULT_SHORTCUTS } from '@/utils/shortcutManager';

export function ShortcutsManagerModal({ isOpen, onClose }) {
  const [shortcuts, setShortcuts] = useState({});
  const [recordingId, setRecordingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setShortcuts(loadShortcuts());
      setRecordingId(null);
    }
  }, [isOpen]);

  // Handle capturing key combos
  useEffect(() => {
    if (!recordingId) return;

    const handleKeyDown = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const keys = [];
      if (e.ctrlKey || e.metaKey) keys.push('Ctrl');
      if (e.altKey) keys.push('Alt');
      if (e.shiftKey) keys.push('Shift');

      const key = e.key.toUpperCase();
      if (!['CONTROL', 'ALT', 'SHIFT', 'META'].includes(key)) {
        keys.push(key === ' ' ? 'Space' : key);

        const combo = keys.join('+');
        setShortcuts((prev) => ({
          ...prev,
          [recordingId]: { ...prev[recordingId], combo },
        }));
        setRecordingId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [recordingId]);

  const handleSave = () => {
    saveShortcuts(shortcuts);
    // Dispatch an event so other components know shortcuts changed
    window.dispatchEvent(new KeyboardEvent('storage', { key: 'sql-practice-shortcuts' }));
    onClose();
  };

  const handleReset = () => {
    setShortcuts({ ...DEFAULT_SHORTCUTS });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100000 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Keyboard size={24} color="var(--primary)" />
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Keyboard Shortcuts</h2>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              marginBottom: 24,
              maxHeight: '60vh',
              overflowY: 'auto',
            }}
          >
            {Object.values(shortcuts).map((sc) => (
              <div
                key={sc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--surface-2)',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                }}
              >
                <span style={{ fontWeight: 500 }}>{sc.label}</span>
                <button
                  onClick={() => setRecordingId(recordingId === sc.id ? null : sc.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border:
                      recordingId === sc.id
                        ? '2px solid var(--primary)'
                        : '1px solid var(--border)',
                    background: recordingId === sc.id ? 'var(--primary-muted)' : 'var(--bg)',
                    color: recordingId === sc.id ? 'var(--primary)' : 'var(--text)',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    minWidth: 100,
                  }}
                >
                  {recordingId === sc.id ? 'Press keys...' : sc.combo}
                </button>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 24,
              paddingTop: 24,
              borderTop: '1px solid var(--border)',
            }}
          >
            <button
              onClick={handleReset}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Reset Defaults
            </button>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--primary)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Save Shortcuts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
