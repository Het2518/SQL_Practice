import { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, Trophy, Star, X } from 'lucide-react';

// ─── Toast Context ─────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

const TOAST_ICONS = {
  success: <CheckCircle size={18} strokeWidth={2} />,
  error: <XCircle size={18} strokeWidth={2} />,
  warning: <AlertTriangle size={18} strokeWidth={2} />,
  info: <Info size={18} strokeWidth={2} />,
  badge: <Trophy size={18} strokeWidth={2} />,
  points: <Star size={18} strokeWidth={2} />,
};

const TOAST_COLORS = {
  success: { bg: 'var(--success)', glow: 'var(--success-muted)', text: 'var(--success)' },
  error: { bg: 'var(--error)', glow: 'var(--error-muted)', text: 'var(--error)' },
  warning: { bg: 'var(--warning)', glow: 'var(--warning-muted)', text: 'var(--warning)' },
  info: { bg: 'var(--primary)', glow: 'var(--primary-muted)', text: 'var(--primary)' },
  badge: { bg: 'var(--accent-1)', glow: 'rgba(139,92,246,0.2)', text: 'var(--accent-1)' },
  points: { bg: 'var(--primary)', glow: 'var(--primary-muted)', text: 'var(--primary)' },
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
      className="flex items-start gap-3 py-3.5 pl-5 pr-4 rounded-2xl bg-surface border border-border min-w-[280px] max-w-[360px] relative overflow-hidden cursor-pointer"
      style={{
        boxShadow: `0 8px 40px rgba(0,0,0,0.18), 0 0 0 1px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
        transform: visible && !leaving ? 'translateX(0) scale(1)' : 'translateX(130px) scale(0.95)',
        opacity: visible && !leaving ? 1 : 0,
        transition: leaving
          ? 'all 0.35s cubic-bezier(0.4, 0, 1, 1)'
          : 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onClick={dismiss}
    >
      {/* Left accent bar */}
      <div
        className="absolute top-0 left-0 bottom-0 w-1 rounded-l-2xl"
        style={{
          background: `linear-gradient(180deg, ${colors.bg}, ${colors.bg}88)`,
        }}
      />

      {/* Shrinking progress bar at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl"
        style={{
          background: `${colors.bg}44`,
        }}
      >
        <div
          className="h-full rounded-bl-2xl animate-[toast-shrink_4.5s_linear_forwards]"
          style={{ background: colors.bg }}
        />
      </div>

      {/* Icon */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
        style={{
          background: colors.glow,
          border: `1px solid ${colors.bg}44`,
        }}
      >
        {TOAST_ICONS[type] || <Info size={18} strokeWidth={2} />}
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <div className="text-sm font-bold text-text mb-[3px]">
          {title}
        </div>
        {message && (
          <div className="text-xs text-text-secondary leading-relaxed">
            {message}
          </div>
        )}
      </div>

      <button
        className="bg-transparent border-none cursor-pointer text-muted text-lg pl-1 shrink-0 leading-none opacity-60 transition-opacity duration-200 hover:opacity-100"
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
        onClick={e => { e.stopPropagation(); dismiss(); }}
      >
        <X size={14} strokeWidth={2} />
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

      <div className="fixed bottom-6 right-6 z-[99999] flex flex-col-reverse gap-2.5 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
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
