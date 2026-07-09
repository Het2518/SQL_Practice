import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Lightbulb, Code, Building2, Tag, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AiHintPanel } from '@/features/ai/AiHintPanel';
import { AiSolutionReview } from '@/features/ai/AiSolutionReview';
import { runAutoHintAnalysis } from '@/features/ai/AutoHintMiddleware';
import { hasGroqKey, groqChat, buildAiSolutionPrompt, buildAiValidationPrompt } from '@/lib/groq';

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

export const QuestionCard = React.memo(function QuestionCard({
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
  // AI integration props
  currentSql = '',
  lastValidation = null,
  dbSchemaContext = '',
  executeQuery,
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
  // AI Solution generation state (for AI-generated questions)
  const [aiSolution, setAiSolution] = useState(null);       // generated SQL string
  const [aiSolutionLoading, setAiSolutionLoading] = useState(false);
  const [aiSolutionError, setAiSolutionError] = useState('');
  // AI Validation state (for AI-generated questions)
  const [aiValidation, setAiValidation] = useState(null);   // { correct, score, feedback, suggestion }
  const [aiValidationLoading, setAiValidationLoading] = useState(false);
  const [aiExpectedResult, setAiExpectedResult] = useState(null); // { columns, rows } for AI generated expected output

  // Auto-hint: client-side analysis shown inline
  const [autoHint, setAutoHint] = useState(null);
  const [showAiHint, setShowAiHint] = useState(false);
  const [showAiReview, setShowAiReview] = useState(false);
  
  // Real companies from Supabase mapping
  const [realCompanies, setRealCompanies] = useState([]);

  // Reset all state when question changes
  useEffect(() => {
    setTimeLeft(TIMER_DURATION);
    setTimerStarted(timedChallenges); // auto-start if timed mode is on
    timerExpiredRef.current = false;
    setShowHints(false);
    setHintsUsed(0);
    setShowSolution(false);
    setAiSolution(null);
    setAiSolutionError('');
    setAiValidation(null);
    setAiExpectedResult(null);

    setAutoHint(null);
    setShowAiHint(false);
    setShowAiReview(false);
    
    // Fetch actual mapped companies for this question from Supabase
    async function fetchCompanies() {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select(`
            id,
            question_company_mapping (
              companies ( name )
            )
          `)
          .eq('prompt', question.prompt)
          .single();
          
        if (data && data.question_company_mapping) {
          const comps = data.question_company_mapping
            .map(m => m.companies?.name)
            .filter(Boolean);
          setRealCompanies([...new Set(comps)]);
        } else {
          setRealCompanies([]);
        }
      } catch (err) {
        console.error("Failed to fetch companies", err);
        setRealCompanies([]);
      }
    }
    
    fetchCompanies();
  }, [question.id, question.prompt, timedChallenges]);

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

  // Auto-generate AI Solution and Expected Output on mount for AI questions
  useEffect(() => {
    let isMounted = true;
    if (!question.isAiGenerated || !hasGroqKey()) return;

    const generateExpectedOutput = async (sqlToRun) => {
      if (executeQuery) {
        try {
          const res = await executeQuery(sqlToRun);
          if (isMounted && res) {
            if (res.error) {
              setAiExpectedResult({ error: res.error });
            } else if (res.columns) {
              setAiExpectedResult({ columns: res.columns, rows: res.rows ? res.rows.slice(0, 100) : [] });
            }
          }
        } catch (e) {
          if (isMounted) setAiExpectedResult({ error: e.message });
          console.error('Failed to compute AI expected result:', e);
        }
      }
    };

    const cacheKey = `ai-sol-${question.id}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      setAiSolution(cached);
      generateExpectedOutput(cached);
      return;
    }

    const fetchAiSolution = async () => {
      setAiSolutionLoading(true);
      setAiSolutionError('');
      try {
        const msgs = buildAiSolutionPrompt({
          questionPrompt: question.prompt,
          schemaContext: dbSchemaContext,
          db: question.db || 'ecommerce',
        });
        const sql = await groqChat(msgs, undefined, 400, false);
        const clean = sql.replace(/```sql\n?/gi, '').replace(/```/g, '').trim();
        if (isMounted) {
          setAiSolution(clean);
          sessionStorage.setItem(cacheKey, clean);
          generateExpectedOutput(clean);
        }
      } catch (e) {
        if (isMounted) {
          setAiSolutionError(e.message === 'RATE_LIMIT' ? 'Rate limit. Wait 15 sec.' : 'Generation failed. Try again.');
        }
      } finally {
        if (isMounted) setAiSolutionLoading(false);
      }
    };

    fetchAiSolution();

    return () => { isMounted = false; };
  }, [question.id, question.prompt, question.isAiGenerated, question.db, dbSchemaContext, executeQuery]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const timerColor = timeLeft <= 60 ? 'var(--error)' : timeLeft <= 120 ? 'var(--warning)' : 'var(--success)';


  const handleToggleHint = () => {
    if (!showHints) {
      setShowHints(true);
      if (hintsUsed === 0) {
        setHintsUsed(1);
        // Run auto-hint middleware on current SQL
        if (currentSql?.trim()) {
          const { hint } = runAutoHintAnalysis(currentSql, question);
          if (hint) setAutoHint(hint);
        }
      }
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
            {difficultyLabel[question.difficulty] || question.difficulty?.toUpperCase() || 'CUSTOM'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
            {statusIcon[status] || '○'} {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          {question.isAiGenerated && (
            <span className="ai-badge" style={{ fontSize: 10, padding: '2px 8px' }}>✨ AI Generated</span>
          )}
        </div>

        {/* AI Challenge Banner */}
        {question.isAiGenerated && (
          <div style={{
            marginBottom: 16, padding: '10px 14px', borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))',
            border: '1px solid rgba(139,92,246,0.2)',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🤖</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', marginBottom: 3 }}>
                AI-Generated {question.companyName ? `${question.companyName} Challenge` : 'Challenge'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
                This question was generated by AI. It uses real schema tables — try it like any other question!
                No automatic validation — focus on writing correct SQL.
              </div>
            </div>
          </div>
        )}

        {/* Prompt */}
        <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text)', marginBottom: 20, fontWeight: 500 }}>
          {question.prompt}
        </div>

        {/* Keywords */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {/* Dynamic Supabase Companies */}
          {realCompanies.length > 0 && (
            <span key={'comp-group'} style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: 12,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '2px 0',
            }}>
              <Building2 size={13} style={{ color: 'var(--primary)' }} />
              <span><strong style={{color: 'var(--text)', fontWeight: 600}}>Asked in:</strong> {realCompanies.join(', ')}</span>
            </span>
          )}

          {(question.keywords || []).map(kw => {
            // Ignore the local hardcoded fake company tags
            if (kw.startsWith('company:')) {
              return null;
            }
            if (kw.startsWith('topic:')) {
              const topic = kw.split(':')[1];
              return (
                <span key={kw} style={{
                  background: 'var(--primary-muted)',
                  color: 'var(--primary)',
                  border: '1px solid var(--primary-light)',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <Tag size={13} /> {topic}
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
              maxHeight: showHints ? '700px' : '0px',
              transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Auto-Hint: Client-side analysis result */}
                {hintsUsed >= 1 && autoHint && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <h4 style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--warning)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      🔍 Smart Analysis
                    </h4>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {autoHint}
                    </p>
                  </div>
                )}
                {hintsUsed >= 1 && (
                  <div style={{ borderTop: autoHint ? '1px solid var(--border)' : '1px solid var(--border)', paddingTop: 16 }}>
                    <h4 style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>Conceptual Hint</h4>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {question.hint_conceptual || "Think about which SQL clause groups records together before filtering aggregated results."}
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
                
                {/* AI Hint — on demand */}
                {hintsUsed >= 1 && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    {!showAiHint ? (
                      <button
                        onClick={() => setShowAiHint(true)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(139,92,246,0.4)',
                          background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(59,130,246,0.06))',
                          cursor: 'pointer', fontSize: 13, fontWeight: 600,
                          color: '#8b5cf6', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#8b5cf6'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'}
                      >
                        ✨ Get AI Personalized Hint
                        {hasGroqKey() ? null : <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 4 }}>(needs key)</span>}
                      </button>
                    ) : (
                      <AiHintPanel
                        question={question}
                        studentSQL={currentSql}
                        dbSchemaContext={dbSchemaContext}
                      />
                    )}
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
                background: showSolution ? (question.isAiGenerated ? 'rgba(139,92,246,0.08)' : 'var(--success-muted)') : 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: showSolution ? (question.isAiGenerated ? '#8b5cf6' : 'var(--success)') : 'var(--text-secondary)',
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
                {question.isAiGenerated && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.25)' }}>
                    ✨ AI Generated
                  </span>
                )}
              </div>
              <ChevronDown size={18} style={{ transform: showSolution ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
            </button>
            <div style={{
              maxHeight: showSolution ? '600px' : '0px',
              transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '0 16px 16px 16px' }}>
                {question.isAiGenerated ? (
                  /* AI Question — generate solution on demand */
                  <div style={{ marginTop: 16 }}>
                    {!aiSolution && !aiSolutionLoading && (
                      <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.6 }}>
                          This is an AI-generated challenge. Click below to have the AI write the reference solution.
                        </p>
                        {!hasGroqKey() ? (
                          <div style={{ fontSize: 12, color: 'var(--warning)', background: 'var(--warning-muted)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--warning)' }}>
                            🔑 Add your Groq API key in <strong>Settings → AI Configuration</strong> to generate solutions.
                          </div>
                        ) : (
                          <button
                            onClick={async () => {
                              const cacheKey = `ai-sol-${question.id}`;
                              setAiSolutionLoading(true);
                              setAiSolutionError('');
                              try {
                                const msgs = buildAiSolutionPrompt({
                                  questionPrompt: question.prompt,
                                  schemaContext: dbSchemaContext,
                                  db: question.db || 'ecommerce',
                                });
                                const sql = await groqChat(msgs, undefined, 400, false);
                                const clean = sql.replace(/```sql\n?/gi, '').replace(/```/g, '').trim();
                                setAiSolution(clean);
                                sessionStorage.setItem(cacheKey, clean);
                                if (executeQuery) {
                                  const res = await executeQuery(clean);
                                  if (res) {
                                    if (res.error) setAiExpectedResult({ error: res.error });
                                    else if (res.columns) setAiExpectedResult({ columns: res.columns, rows: res.rows ? res.rows.slice(0, 100) : [] });
                                  }
                                }
                              } catch (e) {
                                setAiSolutionError(e.message === 'RATE_LIMIT' ? 'Rate limit. Wait 15 sec.' : 'Generation failed. Try again.');
                              } finally {
                                setAiSolutionLoading(false);
                              }
                            }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px',
                              borderRadius: 8, border: 'none', cursor: 'pointer',
                              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                              color: 'white', fontWeight: 700, fontSize: 13,
                              boxShadow: '0 2px 8px rgba(139,92,246,0.35)',
                            }}
                          >
                            ✨ Generate AI Solution
                          </button>
                        )}
                      </div>
                    )}
                    {aiSolutionLoading && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0', color: 'var(--muted)', fontSize: 13 }}>
                        <div style={{ width: 16, height: 16, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                        Generating SQL solution...
                      </div>
                    )}
                    {aiSolutionError && (
                      <div style={{ fontSize: 12, color: 'var(--warning)', padding: '10px 0' }}>⚠️ {aiSolutionError}</div>
                    )}
                    {aiSolution && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.25)' }}>✨ AI-Generated Solution</span>
                          <button
                            onClick={() => { setAiSolution(null); setAiExpectedResult(null); sessionStorage.removeItem(`ai-sol-${question.id}`); }}
                            style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                          >Regenerate</button>
                        </div>
                        <pre style={{
                          background: 'var(--bg)', padding: 14, borderRadius: 8,
                          fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)',
                          border: '1px solid var(--border)', margin: 0,
                          overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.6,
                        }}>{aiSolution}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Static question — show pre-computed solution */
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
                )}
              </div>
            </div>
          </div>


          {/* AI Solution Review — on demand, shown after any submission */}
          {currentSql?.trim() && (
            <div>
              {question.isAiGenerated ? (
                /* AI Question: Validate user's SQL with AI grader */
                <div>
                  {!aiValidation && !aiValidationLoading && (
                    <button
                      onClick={async () => {
                        if (!hasGroqKey()) return;
                        setAiValidationLoading(true);
                        try {
                          const msgs = buildAiValidationPrompt({
                            questionPrompt: question.prompt,
                            userSQL: currentSql,
                            sampleRows: lastValidation?.result?.rows?.slice(0, 5) || [],
                            schemaContext: dbSchemaContext,
                          });
                          const raw = await groqChat(msgs, undefined, 300, false);
                          const m = raw.match(/\{[\s\S]*\}/);
                          const parsed = m ? JSON.parse(m[0]) : { correct: false, score: 60, feedback: raw, suggestion: null };
                          setAiValidation(parsed);
                        } catch { setAiValidation({ correct: false, score: 0, feedback: 'Validation failed. Try again.', suggestion: null }); }
                        finally { setAiValidationLoading(false); }
                      }}
                      disabled={!currentSql?.trim() || !hasGroqKey()}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 16px', borderRadius: 8, border: '1px solid rgba(139,92,246,0.3)',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.04), rgba(59,130,246,0.04))',
                        cursor: currentSql?.trim() && hasGroqKey() ? 'pointer' : 'not-allowed',
                        fontSize: 14, fontWeight: 600, color: '#8b5cf6', transition: 'all 0.2s',
                        opacity: currentSql?.trim() ? 1 : 0.5,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={18} strokeWidth={2.5} />
                        <span>🤖 Validate Query with AI</span>
                        <span className="ai-badge">Groq</span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
                        {!currentSql?.trim() ? 'Write SQL first' : 'Get AI grade →'}
                      </span>
                    </button>
                  )}
                  {aiValidationLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', color: 'var(--muted)', fontSize: 13, border: '1px solid var(--border)', borderRadius: 8 }}>
                      <div style={{ width: 14, height: 14, border: '2px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      AI is evaluating your query...
                    </div>
                  )}
                  {aiValidation && (
                    <div style={{ borderRadius: 8, border: `1px solid ${aiValidation.correct ? 'var(--success)' : 'var(--warning)'}`, overflow: 'hidden' }}>
                      {/* Score header */}
                      <div style={{
                        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                        background: aiValidation.correct ? 'var(--success-muted)' : 'var(--warning-muted)',
                      }}>
                        <span style={{ fontSize: 22 }}>{aiValidation.correct ? '✅' : '⚠️'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: aiValidation.correct ? 'var(--success)' : 'var(--warning)' }}>
                            {aiValidation.correct ? 'Correct Approach!' : 'Needs Improvement'}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>AI-graded evaluation</div>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 22, color: aiValidation.correct ? 'var(--success)' : 'var(--warning)', minWidth: 50, textAlign: 'right' }}>
                          {aiValidation.score}<span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>/100</span>
                        </div>
                      </div>
                      {/* Feedback */}
                      <div style={{ padding: '12px 16px', background: 'var(--surface)' }}>
                        <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.65, margin: 0 }}>{aiValidation.feedback}</p>
                        {aiValidation.suggestion && (
                          <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6, background: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            <strong style={{ color: 'var(--text)', display: 'block', marginBottom: 3 }}>💡 Suggestion</strong>
                            {aiValidation.suggestion}
                          </div>
                        )}
                        <button
                          onClick={() => setAiValidation(null)}
                          style={{ marginTop: 10, fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Re-validate →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Static question: standard AI Solution Review */
                !showAiReview ? (
                  <button
                    onClick={() => setShowAiReview(true)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 16px', borderRadius: 8, border: '1px solid rgba(139,92,246,0.3)',
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.04), rgba(59,130,246,0.04))',
                      cursor: 'pointer', fontSize: 14, fontWeight: 600,
                      color: '#8b5cf6', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.04), rgba(59,130,246,0.04))'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={18} strokeWidth={2.5} />
                      <span>AI Solution Review</span>
                      <span className="ai-badge">Groq</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>Get full code review →</span>
                  </button>
                ) : (
                  <AiSolutionReview
                    question={question}
                    studentSQL={currentSql}
                    solutionSQL={question.solutionSQL}
                  />
                )
              )}
            </div>
          )}
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
            {question.isAiGenerated && aiSolutionLoading ? (
              <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
                <div style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: 8, verticalAlign: 'middle' }} />
                Computing expected result via AI...
              </div>
            ) : question.isAiGenerated && !aiExpectedResult ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>🤖</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                  AI challenges are open-ended
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 300, margin: '0 auto' }}>
                  There is no fixed expected output. Run your SQL, then use the <strong>Validate Query with AI</strong> button above to grade your approach!
                  <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>
                    (Or click <strong>Generate AI Solution</strong> in the Solution tab to generate a reference output table)
                  </div>
                </div>
              </div>
            ) : question.isAiGenerated && aiExpectedResult && aiExpectedResult.error ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: '#ef4444' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  AI-Generated SQL Error
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.5, opacity: 0.8, maxWidth: 300, margin: '0 auto' }}>
                  {aiExpectedResult.error}
                </div>
                <button
                  onClick={() => { setAiSolution(null); setAiExpectedResult(null); sessionStorage.removeItem(`ai-sol-${question.id}`); }}
                  style={{ marginTop: 12, fontSize: 12, padding: '6px 12px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 4, cursor: 'pointer' }}
                >
                  Regenerate AI Solution
                </button>
              </div>
            ) : (!question.isAiGenerated && !expectedResult) ? (
              <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
                Computing expected result...
              </div>
            ) : (question.isAiGenerated ? aiExpectedResult : expectedResult)?.columns?.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {(question.isAiGenerated ? aiExpectedResult : expectedResult).columns.map(col => (
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
                  {((question.isAiGenerated ? aiExpectedResult : expectedResult).rows || []).map((row, i) => (
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
            ) : (question.isAiGenerated ? aiExpectedResult : expectedResult)?.columns ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--muted)' }}>
                 <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
                 <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Query Successful</div>
                 <div style={{ fontSize: 13 }}>Returned 0 rows</div>
              </div>
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
});