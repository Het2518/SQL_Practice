import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Lightbulb, Code } from 'lucide-react';

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
  timedChallenges = false,
  onTimerExpire,
}) {
  // Timer challenge state
  const TIMER_DURATION = 5 * 60; // 5 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [timerStarted, setTimerStarted] = useState(false);
  const timerExpiredRef = useRef(false);
  
  // Hint/Solution State locally
  const [showHints, setShowHints] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  // Reset all state when question changes
  useEffect(() => {
    setTimeLeft(TIMER_DURATION);
    setTimerStarted(timedChallenges); // auto-start if timed mode is on
    timerExpiredRef.current = false;
    setShowHints(false);
    setHintsUsed(0);
    setShowSolution(false);
  }, [question.id, timedChallenges]);

  // Countdown tick
  useEffect(() => {
    if (!timerStarted || !timedChallenges) return;
    if (timeLeft <= 0) {
      if (!timerExpiredRef.current) {
        timerExpiredRef.current = true;
        if (onTimerExpire) onTimerExpire();
      }
      return;
    }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [timerStarted, timeLeft, timedChallenges, onTimerExpire]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const timerColor = timeLeft <= 60 ? 'var(--error)' : timeLeft <= 120 ? 'var(--warning)' : 'var(--success)';


  const handleToggleHint = () => {
    if (!showHints) {
      setShowHints(true);
      if (hintsUsed === 0) setHintsUsed(1);
    } else {
      setShowHints(false);
    }
  };

  const handleNextHint = () => {
    setHintsUsed(n => Math.min(n + 1, 3));
  };

  return (
    <div style={{
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
        <button onClick={onOpenBrowser} className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 8px', fontWeight: 600 }}>
          ☰ All Questions
        </button>
        <div style={{ flex: 1 }} />
        {/* Timed Challenge Timer */}
        {timedChallenges && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: timeLeft <= 60 ? 'rgba(239,68,68,0.1)' : 'var(--surface)',
            border: `1px solid ${timerColor}`,
            borderRadius: 8, padding: '4px 10px',
            animation: timeLeft <= 30 ? 'pulse 1s ease infinite' : 'none'
          }}>
            <span style={{ fontSize: 16 }}>⏱</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: timerColor, fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>
              {timeLeft <= 0 ? 'Time\'s Up!' : formatTime(timeLeft)}
            </span>
          </div>
        )}
        <button onClick={() => onNavigate('prev')} disabled={!hasPrev} className="btn btn-ghost btn-icon" style={{ fontSize: 12 }}>←</button>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
          {questionNumber} / {totalQuestions}
        </span>
        <button onClick={() => onNavigate('next')} disabled={!hasNext} className="btn btn-ghost btn-icon" style={{ fontSize: 12 }}>→</button>
      </div>

      {/* Question Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {/* Difficulty + Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
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
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
            {statusIcon[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {/* Prompt */}
        <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text)', marginBottom: 20, fontWeight: 500 }}>
          {question.prompt}
        </div>

        {/* Keywords */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {question.keywords.map(kw => {
            if (kw.startsWith('company:')) {
              const company = kw.split(':')[1];
              return (
                <span key={kw} style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(5,150,105,0.2)',
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
                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(79,70,229,0.2)',
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

        {/* Unified Hint/Solution Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          
          {/* Hints Accordion */}
          <div style={{
            background: 'var(--surface-2)',
            borderRadius: 8,
            border: '1px solid var(--border)',
            overflow: 'hidden'
          }}>
            <button 
              onClick={handleToggleHint} 
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: showHints ? 'var(--warning-muted)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: showHints ? 'var(--warning)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 14,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { if (!showHints) e.currentTarget.style.background = 'var(--surface)'; }}
              onMouseLeave={e => { if (!showHints) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lightbulb size={18} strokeWidth={2.5} />
                <span>Hints {hintsUsed > 0 ? `(${hintsUsed}/3)` : ''}</span>
              </div>
              <ChevronDown size={18} style={{ transform: showHints ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
            </button>
            <div style={{
              maxHeight: showHints ? '500px' : '0px',
              transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {hintsUsed >= 1 && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <h4 style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>Conceptual Hint</h4>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {question.hint_conceptual || "Use a basic SELECT statement to retrieve specific columns from the table."}
                    </p>
                  </div>
                )}
                {hintsUsed >= 2 && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <h4 style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>Structural Hint</h4>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {question.hint_structural || "SELECT column1, column2 FROM table_name;"}
                    </p>
                  </div>
                )}
                {hintsUsed >= 3 && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <h4 style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>Near-Solution Hint</h4>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {question.hint_near_solution || "SELECT first_name, last_name, gender FROM patients;"}
                    </p>
                  </div>
                )}
                
                {hintsUsed < 3 && (
                  <button 
                    onClick={handleNextHint} 
                    className="btn btn-secondary" 
                    style={{ marginTop: (hintsUsed === 0 ? 16 : 8), fontSize: 13, padding: '8px 16px', alignSelf: 'flex-start' }}
                  >
                    Reveal Next Hint
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Solution Accordion */}
          <div style={{
            background: 'var(--surface-2)',
            borderRadius: 8,
            border: '1px solid var(--border)',
            overflow: 'hidden'
          }}>
            <button 
              onClick={() => setShowSolution(!showSolution)} 
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: showSolution ? 'var(--success-muted)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: showSolution ? 'var(--success)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 14,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { if (!showSolution) e.currentTarget.style.background = 'var(--surface)'; }}
              onMouseLeave={e => { if (!showSolution) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Code size={18} strokeWidth={2.5} />
                <span>Solution SQL</span>
              </div>
              <ChevronDown size={18} style={{ transform: showSolution ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
            </button>
            <div style={{
              maxHeight: showSolution ? '500px' : '0px',
              transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '0 16px 16px 16px' }}>
                <div style={{
                  background: 'var(--bg)',
                  padding: 12,
                  borderRadius: 6,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  marginTop: 16
                }}>
                  {question.solutionSQL}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expected Output */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <h3 style={{ fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>Expected Output</h3>
          <div style={{
            background: 'var(--surface)',
            borderRadius: 6,
            border: '1px solid var(--border)',
            overflow: 'auto',
            maxHeight: 300
          }}>
            {!expectedResult ? (
              <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
                Computing expected result...
              </div>
            ) : expectedResult.columns.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {expectedResult.columns.map(col => (
                      <th key={col} style={{
                        padding: '8px 12px',
                        textAlign: 'left',
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--surface-2)',
                        position: 'sticky',
                        top: 0,
                        fontWeight: 600,
                        color: 'var(--text)'
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(expectedResult.rows || []).map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      {row.map((val, j) => (
                        <td key={j} style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                          {val === null ? <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>null</span> : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
                No specific output required.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}