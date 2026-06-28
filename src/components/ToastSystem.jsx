import { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';

// ─── Toast Context ─────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

const TOAST_ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  badge: '🏆',
  points: '⭐',
};

const TOAST_COLORS = {
  success: { bg: '#10b981', glow: 'rgba(16,185,129,0.2)', text: '#10b981' },
  error: { bg: '#ef4444', glow: 'rgba(239,68,68,0.2)', text: '#ef4444' },
  warning: { bg: '#f59e0b', glow: 'rgba(245,158,11,0.2)', text: '#f59e0b' },
  info: { bg: '#3b82f6', glow: 'rgba(59,130,246,0.2)', text: '#3b82f6' },
  badge: { bg: '#8b5cf6', glow: 'rgba(139,92,246,0.2)', text: '#8b5cf6' },
  points: { bg: '#2563eb', glow: 'rgba(37,99,235,0.2)', text: '#2563eb' },
};

function Toast({ id, type, title, message, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => onRemove(id), 400);
    }, 4500);
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); };
  }, [id, onRemove]);

  const colors = TOAST_COLORS[type] || TOAST_COLORS.info;

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onRemove(id), 400);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 16px 14px 20px',
        borderRadius: 16,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: `0 8px 40px rgba(0,0,0,0.18), 0 0 0 1px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
        minWidth: 280,
        maxWidth: 360,
        transform: visible && !leaving ? 'translateX(0) scale(1)' : 'translateX(130px) scale(0.95)',
        opacity: visible && !leaving ? 1 : 0,
        transition: leaving
          ? 'all 0.35s cubic-bezier(0.4, 0, 1, 1)'
          : 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onClick={dismiss}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, bottom: 0,
        width: 4,
        background: `linear-gradient(180deg, ${colors.bg}, ${colors.bg}88)`,
        borderRadius: '16px 0 0 16px',
      }} />

      {/* Shrinking progress bar at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 3,
        background: `${colors.bg}44`,
        borderRadius: '0 0 16px 16px',
      }}>
        <div style={{
          height: '100%',
          background: colors.bg,
          borderRadius: '0 0 0 16px',
          animation: 'toast-shrink 4.5s linear forwards',
        }} />
      </div>

      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: colors.glow,
        border: `1px solid ${colors.bg}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>
        {TOAST_ICONS[type] || '💡'}
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>
          {title}
        </div>
        {message && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {message}
          </div>
        )}
      </div>

      <button
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--muted)', fontSize: 18, padding: '0 0 0 4px', flexShrink: 0,
          lineHeight: 1, opacity: 0.6, transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
        onClick={e => { e.stopPropagation(); dismiss(); }}
      >
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const toast = useCallback(({ type = 'info', title, message }) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev.slice(-4), { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 10,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <Toast
              id={t.id}
              type={t.type}
              title={t.title}
              message={t.message}
              onRemove={removeToast}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
