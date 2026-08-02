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
    <div className="modal-overlay z-[100000]" onClick={onClose}>
      <div className="modal-content max-w-[500px]" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Keyboard size={24} className="text-primary" />
            <h2 className="text-xl font-bold m-0 text-text">Keyboard Shortcuts</h2>
          </div>

          <div className="flex flex-col gap-3 mb-6 max-h-[60vh] overflow-y-auto">
            {Object.values(shortcuts).map((sc) => (
              <div
                key={sc.id}
                className="flex items-center justify-between px-4 py-3 bg-surface-2 rounded-lg border border-border"
              >
                <span className="font-medium text-text">{sc.label}</span>
                <button
                  onClick={() => setRecordingId(recordingId === sc.id ? null : sc.id)}
                  className={`px-3 py-1.5 rounded-md font-mono cursor-pointer min-w-[100px] transition-colors ${
                    recordingId === sc.id
                      ? 'border-2 border-primary bg-primary-muted text-primary'
                      : 'border border-border bg-bg text-text hover:border-text-secondary'
                  }`}
                >
                  {recordingId === sc.id ? 'Press keys...' : sc.combo}
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-6 pt-6 border-t border-border">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg border border-border bg-transparent text-text font-semibold cursor-pointer hover:bg-surface-2 transition-colors"
            >
              Reset Defaults
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border bg-surface text-text font-semibold cursor-pointer hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg border-none bg-primary text-primary-foreground font-semibold cursor-pointer hover:opacity-90 transition-opacity"
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
