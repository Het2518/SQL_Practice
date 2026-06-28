import type { Question } from '../types';

interface HintDrawerProps {
  question: Question;
  hintsUsed: number;
  onRevealHint: () => void;
  solutionVisible: boolean;
  onRevealSolution: () => void;
  onClose: () => void;
}

export function HintDrawer({
  question,
  hintsUsed,
  onRevealHint,
  solutionVisible,
  onRevealSolution,
  onClose,
}: HintDrawerProps) {
  const hints = [
    { text: question.hint1, label: 'Conceptual Hint', colorClass: 'hint-1', icon: '💡' },
    { text: question.hint2, label: 'Structural Hint', colorClass: 'hint-2', icon: '🏗' },
    { text: question.hint3, label: 'Near-Solution Hint', colorClass: 'hint-3', icon: '🎯' },
  ];

  const isCode = (text: string) => text.includes('SELECT') || text.includes('FROM') || text.includes('\n');

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        zIndex: 50,
        maxHeight: '50vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface-2)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 16 }}>💡</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
          Hints & Solution
        </span>
        <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i < hintsUsed ? 'var(--warning)' : 'var(--border)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
        <div style={{ flex: 1 }} />
        {hintsUsed < 3 && (
          <button
            id="btn-reveal-hint"
            onClick={onRevealHint}
            className="btn btn-ghost"
            style={{ fontSize: 12 }}
          >
            Reveal Hint {hintsUsed + 1}
          </button>
        )}
        {!solutionVisible && (
          <button
            id="btn-reveal-solution"
            onClick={onRevealSolution}
            className="btn btn-danger"
            style={{ fontSize: 12 }}
          >
            🔑 Show Solution
          </button>
        )}
        <button
          onClick={onClose}
          className="btn btn-ghost btn-icon"
          style={{ fontSize: 14 }}
          aria-label="Close hints"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {hintsUsed === 0 && !solutionVisible && (
          <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>
            Click "Reveal Hint 1" to get a conceptual hint. Hints won't affect your progress.
          </div>
        )}

        {hints.slice(0, hintsUsed).map((hint, i) => (
          <div key={i} className={`hint-level ${hint.colorClass} animate-fade-in`} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              {hint.icon} {hint.label}
            </div>
            {isCode(hint.text) ? (
              <>
                {hint.text.split('```').map((part, pi) =>
                  pi % 2 === 1 ? (
                    <div key={pi} className="hint-code">{part.trim()}</div>
                  ) : (
                    <p key={pi} style={{ margin: 0 }}>{part}</p>
                  )
                )}
                {!hint.text.includes('```') && hint.text.includes('SELECT') && (
                  <div className="hint-code">{hint.text}</div>
                )}
              </>
            ) : (
              <p style={{ margin: 0 }}>{hint.text}</p>
            )}
          </div>
        ))}

        {solutionVisible && (
          <div
            className="animate-fade-in"
            style={{
              background: 'rgba(220,38,38,0.05)',
              border: '1px solid rgba(220,38,38,0.3)',
              borderRadius: 'var(--radius)',
              padding: 16,
              marginTop: hintsUsed > 0 ? 12 : 0,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 12, color: '#FCA5A5', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              🔑 Solution SQL
            </div>
            <div className="hint-code" style={{ color: '#86EFAC' }}>
              {question.solutionSQL}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
