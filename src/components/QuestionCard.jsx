import { useState, useEffect } from 'react';
const difficultyLabel = {
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD'
};
const statusIcon = {
  complete: '✅',
  attempted: '🔄',
  incomplete: '○'
};
export function QuestionCard({
  question,
  expectedResult,
  status,
  onOpenBrowser,
  onNavigate,
  hasPrev,
  hasNext,
  questionNumber,
  totalQuestions,
  onHint,
  onSolution
}) {
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  useEffect(() => {
    setElapsed(0);
    setTimerActive(false);
  }, [question.id]);
  useEffect(() => {
    if (!timerActive) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [timerActive]);
  const formatTime = s => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };
  return <div style={{
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--surface)',
    borderLeft: '1px solid var(--border)',
    overflow: 'hidden'
  }}>
      {/* Header */}
      <div style={{
      padding: '10px 14px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface-2)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0
    }}>
        <button onClick={onOpenBrowser} className="btn btn-ghost" style={{
        fontSize: 12,
        padding: '4px 8px',
        fontWeight: 600
      }}>
          ☰ All Questions
        </button>
        <div style={{
        flex: 1
      }} />
        <button onClick={() => onNavigate('prev')} disabled={!hasPrev} className="btn btn-ghost btn-icon" style={{
        fontSize: 12
      }}>
          ←
        </button>
        <span style={{
        fontSize: 12,
        color: 'var(--muted)',
        fontWeight: 500
      }}>
          {questionNumber} / {totalQuestions}
        </span>
        <button onClick={() => onNavigate('next')} disabled={!hasNext} className="btn btn-ghost btn-icon" style={{
        fontSize: 12
      }}>
          →
        </button>
      </div>

      {/* Question Content */}
      <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: 20
    }}>
        {/* Difficulty + Status */}
        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16
      }}>
          <span style={{
          background: 'var(--primary-muted)',
          color: 'var(--primary)',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.5px'
        }}>
            {difficultyLabel[question.difficulty]}
          </span>
          <span style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
          fontWeight: 500
        }}>
            {statusIcon[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {/* Prompt */}
        <div style={{
        fontSize: 15,
        lineHeight: 1.6,
        color: 'var(--text)',
        marginBottom: 20,
        fontWeight: 500
      }}>
          {question.prompt}
        </div>

        {/* Keywords */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 24
        }}>
          {question.keywords.map(kw => {
            if (kw.startsWith('company:')) {
              const company = kw.split(':')[1];
              return (
                <span key={kw} style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  🏢 {company} Interview
                </span>
              );
            }
            if (kw.startsWith('topic:')) {
              const topic = kw.split(':')[1];
              return (
                <span key={kw} style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  🎯 {topic}
                </span>
              );
            }
            return (
              <span key={kw} style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600
              }}>
                {kw}
              </span>
            );
          })}
        </div>

        {/* Actions (Hints / Solution) */}
        <div style={{
        display: 'flex',
        gap: 10,
        marginBottom: 24
      }}>
          <button onClick={onHint} className="btn btn-ghost" style={{
          flex: 1,
          padding: '8px 0',
          fontSize: 13
        }}>
            💡 Get Hint
          </button>
          <button onClick={onSolution} className="btn btn-ghost" style={{
          flex: 1,
          padding: '8px 0',
          fontSize: 13
        }}>
            👁 View Solution
          </button>
        </div>

        {/* Expected Output */}
        <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: 16,
        marginTop: 8
      }}>
          <h3 style={{
          fontSize: 14,
          color: 'var(--text)',
          marginBottom: 12
        }}>Expected Output</h3>
          <div style={{
          background: 'var(--surface)',
          borderRadius: 6,
          border: '1px solid var(--border)',
          overflow: 'auto',
          maxHeight: 300
        }}>
            {!expectedResult ? <div style={{
            padding: 16,
            textAlign: 'center',
            color: 'var(--muted)',
            fontSize: 12
          }}>
                Computing expected result...
              </div> : expectedResult.columns.length > 0 ? <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 12
          }}>
                <thead>
                  <tr>
                    {expectedResult.columns.map(col => <th key={col} style={{
                  padding: '6px 10px',
                  textAlign: 'left',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  position: 'sticky',
                  top: 0,
                  fontWeight: 600,
                  color: 'var(--text)'
                }}>
                        {col}
                      </th>)}
                  </tr>
                </thead>
                <tbody>
                  {(expectedResult.rows || []).map((row, i) => <tr key={i} style={{
                borderBottom: '1px solid var(--border)'
              }}>
                      {row.map((val, j) => <td key={j} style={{
                  padding: '6px 10px',
                  color: 'var(--text-secondary)'
                }}>
                          {val === null ? <span style={{
                    color: 'var(--muted)',
                    fontStyle: 'italic'
                  }}>null</span> : String(val)}
                        </td>)}
                    </tr>)}
                </tbody>
              </table> : <div style={{
            padding: 16,
            textAlign: 'center',
            color: 'var(--muted)',
            fontSize: 12
          }}>
                No specific output required.
              </div>}
          </div>
        </div>
      </div>
    </div>;
}