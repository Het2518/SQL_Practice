import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Lightbulb, Code, Building2, Tag, Sparkles, CheckCircle, AlertTriangle, KeyRound, Cpu } from 'lucide-react';
import { AiHintPanel } from '@/features/ai/AiHintPanel';
import { AiSolutionReview } from '@/features/ai/AiSolutionReview';
import { runAutoHintAnalysis } from '@/features/ai/AutoHintMiddleware';
import { useProactiveTutor } from '@/features/ai/useProactiveTutor';
import { groqChat, buildAiSolutionPrompt, buildAiValidationPrompt } from '@/lib/groq';
import { QuestionHeader } from './QuestionHeader';
import { QuestionBody } from './QuestionBody';

const difficultyLabel = {
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD',
};

const statusIcon = {
  complete: '✓',
  attempted: '·',
  incomplete: '○',
};

export const QuestionCard = React.memo(function QuestionCard({
  question,
  expectedResult,
  status,
  onOpenBrowser,
  onOpenAiTutor,
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
  const [aiSolution, setAiSolution] = useState(null); // generated SQL string
  const [aiSolutionLoading, setAiSolutionLoading] = useState(false);
  const [aiSolutionError, setAiSolutionError] = useState('');
  // AI Validation state (for AI-generated questions)
  const [aiValidation, setAiValidation] = useState(null); // { correct, score, feedback, suggestion }
  const [aiValidationLoading, setAiValidationLoading] = useState(false);
  const [aiExpectedResult, setAiExpectedResult] = useState(null); // { columns, rows } for AI generated expected output

  // Auto-hint: client-side analysis shown inline
  const [autoHint, setAutoHint] = useState(null);
  const [showAiHint, setShowAiHint] = useState(false);
  const [showAiReview, setShowAiReview] = useState(false);

  // Real companies from Supabase mapping
  const [realCompanies, setRealCompanies] = useState([]);

  const hasKey = true;

  // Proactive Background AI Tutor (analyzes code if user is stuck for 30s)
  useProactiveTutor({
    sql: currentSql,
    question: question,
    dbSchemaContext,
    delayMs: 30000, 
    isEnabled: status !== 'complete', // Disable if already completed
  });

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
    // For now, static questions rely on question.companies if provided
    setRealCompanies(question.companies || []);
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
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timerStarted, timeLeft, timedChallenges, onTimerExpire]);

  // Auto-generate AI Solution and Expected Output on mount for AI questions
  useEffect(() => {
    let isMounted = true;
    if (!question.isAiGenerated || !hasKey) return;

    const generateExpectedOutput = async (sqlToRun) => {
      if (executeQuery) {
        try {
          const res = await executeQuery(sqlToRun);
          if (isMounted && res) {
            if (res.error) {
              setAiExpectedResult({ error: res.error });
            } else if (res.columns) {
              setAiExpectedResult({
                columns: res.columns,
                rows: res.rows ? res.rows.slice(0, 100) : [],
              });
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
        const clean = sql
          .replace(/```sql\n?/gi, '')
          .replace(/```/g, '')
          .trim();
        if (isMounted) {
          setAiSolution(clean);
          sessionStorage.setItem(cacheKey, clean);
          generateExpectedOutput(clean);
        }
      } catch (e) {
        if (isMounted) {
          setAiSolutionError(
            e.message === 'RATE_LIMIT'
              ? 'Rate limit. Wait 15 sec.'
              : 'Generation failed. Try again.'
          );
        }
      } finally {
        if (isMounted) setAiSolutionLoading(false);
      }
    };

    fetchAiSolution();

    return () => {
      isMounted = false;
    };
  }, [
    question.id,
    question.prompt,
    question.isAiGenerated,
    question.db,
    dbSchemaContext,
    executeQuery,
    hasKey,
  ]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const timerColor =
    timeLeft <= 60 ? 'var(--error)' : timeLeft <= 120 ? 'var(--warning)' : 'var(--success)';

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
    setHintsUsed((n) => Math.min(n + 1, 3));
  };

  const handleAiValidation = async () => {
    if (!hasKey) return;
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
      const parsed = m
        ? JSON.parse(m[0])
        : { correct: false, score: 60, feedback: raw, suggestion: null };
      setAiValidation(parsed);
    } catch {
      setAiValidation({
        correct: false,
        score: 0,
        feedback: 'Validation failed. Try again.',
        suggestion: null,
      });
    } finally {
      setAiValidationLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg border-r border-border">
      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <QuestionHeader
          question={question}
          status={status}
          timeLeft={timeLeft}
          timedChallenges={timedChallenges}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onNavigate={onNavigate}
          onOpenBrowser={onOpenBrowser}
        />

        <QuestionBody question={question} realCompanies={realCompanies} />

        {/* Unified Hint/Solution Section */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Hints Accordion */}
          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <button
              onClick={handleToggleHint}
              className={`w-full flex items-center justify-between px-4 py-3 border-none cursor-pointer font-semibold text-[13px] transition-all duration-150 ease-in-out ${showHints ? 'bg-amber-500/10 text-warning' : 'bg-transparent text-text-secondary hover:bg-surface'}`}
              onMouseEnter={(e) => {
                if (!showHints) e.currentTarget.classList.add('bg-surface');
              }}
              onMouseLeave={(e) => {
                if (!showHints) e.currentTarget.classList.remove('bg-surface');
              }}
            >
              <div className="flex items-center gap-2">
                <Lightbulb size={15} strokeWidth={2} />
                <span>Hints{hintsUsed > 0 ? ` (${hintsUsed}/3)` : ''}</span>
              </div>
              <ChevronDown
                size={15}
                className={`transition-transform duration-250 opacity-60 ${showHints ? 'rotate-180' : 'rotate-0'}`}
              />
            </button>
            <div
              className={`overflow-hidden transition-[max-height] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${showHints ? 'max-h-[700px]' : 'max-h-0'}`}
            >
              <div className="px-4 pb-4 flex flex-col gap-4">
                {/* Auto-Hint: Client-side analysis result */}
                {hintsUsed >= 1 && autoHint && (
                  <div className="border-t border-border pt-4">
                    <h4 className="m-0 mb-1.5 text-[13px] text-warning font-bold flex items-center gap-1.5">
                      🔍 Smart Analysis
                    </h4>
                    <p className="m-0 text-[13px] text-text-secondary leading-[1.5]">
                      {autoHint}
                    </p>
                  </div>
                )}
                {hintsUsed >= 1 && (
                  <div className="border-t border-border pt-4">
                    <h4 className="m-0 mb-1.5 text-[13px] text-text font-semibold">
                      Conceptual Hint
                    </h4>
                    <p className="m-0 text-[13px] text-text-secondary leading-relaxed">
                      {question.hint_conceptual ||
                        'Think about which SQL clause groups records together before filtering aggregated results.'}
                    </p>
                  </div>
                )}
                {hintsUsed >= 2 && (
                  <div className="border-t border-border pt-4">
                    <h4 className="m-0 mb-1.5 text-[13px] text-text font-semibold">
                      Structural Hint
                    </h4>
                    <p className="m-0 text-[13px] text-text-secondary font-mono">
                      {question.hint_structural || 'SELECT column1, column2 FROM table_name;'}
                    </p>
                  </div>
                )}
                {hintsUsed >= 3 && (
                  <div className="border-t border-border pt-4">
                    <h4 className="m-0 mb-1.5 text-[13px] text-text font-semibold">
                      Near-Solution Hint
                    </h4>
                    <p className="m-0 text-[13px] text-text-secondary font-mono">
                      {question.hint_near_solution ||
                        'SELECT first_name, last_name, gender FROM patients;'}
                    </p>
                  </div>
                )}

                {/* AI Hint — on demand */}
                {hintsUsed >= 1 && (
                  <div className="border-t border-border pt-3">
                    <button
                      onClick={onOpenAiTutor}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-primary/40 bg-gradient-to-br from-primary/5 to-blue-500/5 cursor-pointer text-[13px] font-semibold text-primary transition-all duration-200 hover:border-primary"
                    >
                      <Sparkles size={13} strokeWidth={2} /> Get AI Personalized Hint
                      {hasKey ? null : (
                        <span className="text-[10px] text-muted ml-1">
                          (needs key)
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {hintsUsed < 3 && (
                  <button
                    onClick={handleNextHint}
                    className={`btn btn-secondary text-[13px] px-4 py-2 self-start ${hintsUsed === 0 ? 'mt-4' : 'mt-2'}`}
                  >
                    Reveal Next Hint
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-surface-2 rounded-lg border border-border overflow-hidden">
            {/* Lock notice — only shown when not yet attempted */}
            {!Boolean(currentSql?.trim() || status === 'attempted' || status === 'complete') && (
              <div className="px-4 py-2 bg-surface border-b border-border text-[11px] text-muted flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-border shrink-0 inline-block" />
                Write and run a query first to unlock the solution
              </div>
            )}

            <button
              onClick={() => {
                const hasAttempted = Boolean(
                  currentSql?.trim() || status === 'attempted' || status === 'complete'
                );
                if (hasAttempted) setShowSolution(!showSolution);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 border-none font-semibold text-[13px] transition-all duration-150 ease-in-out ${
                Boolean(currentSql?.trim() || status === 'attempted' || status === 'complete')
                  ? 'cursor-pointer opacity-100'
                  : 'cursor-not-allowed opacity-50'
              } ${
                showSolution
                  ? question.isAiGenerated
                    ? 'bg-purple-500/10 text-primary'
                    : 'bg-emerald-500/10 text-success'
                  : Boolean(currentSql?.trim() || status === 'attempted' || status === 'complete')
                    ? 'bg-transparent text-text-secondary hover:bg-surface'
                    : 'bg-transparent text-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <Code size={15} strokeWidth={2} />
                <span>Solution & AI Review</span>
                {question.isAiGenerated && (
                  <span className="ai-badge text-[10px] px-1.5 py-[1px] flex items-center gap-1">
                    <Cpu size={9} /> AI
                  </span>
                )}
              </div>
              <ChevronDown
                size={15}
                className={`transition-transform duration-250 opacity-60 ${showSolution ? 'rotate-180' : 'rotate-0'}`}
              />
            </button>
            <div
              className={`overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${showSolution ? 'max-h-[1000px]' : 'max-h-0'}`}
            >
              <div className="px-4 pb-4">
                <div className="mt-4">
                  {question.isAiGenerated ? (
                    /* AI Question: Validate user's SQL with AI grader */
                    <div>
                      {!aiValidation && !aiValidationLoading && (
                        <button
                          onClick={handleAiValidation}
                          disabled={!currentSql?.trim() || !hasKey}
                          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg border border-primary/30 bg-gradient-to-br from-primary/5 to-blue-500/5 text-sm font-semibold text-primary transition-all duration-200 ${currentSql?.trim() && hasKey ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50'}`}
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles size={18} strokeWidth={2.5} />
                            <span>🤖 Validate Query with AI</span>
                            <span className="ai-badge">Groq</span>
                          </div>
                          <span className="text-xs text-muted font-medium">
                            {!currentSql?.trim() ? 'Write SQL first' : 'Get AI grade →'}
                          </span>
                        </button>
                      )}
                      {aiValidationLoading && (
                        <div className="flex items-center gap-2.5 px-4 py-3.5 text-muted text-[13px] border border-border rounded-lg">
                          <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          AI is evaluating your query...
                        </div>
                      )}
                      {aiValidation && (
                        <div className={`rounded-lg border overflow-hidden mb-4 ${aiValidation.correct ? 'border-success' : 'border-warning'}`}>
                          {/* Score header */}
                          <div
                            className={`px-4 py-3 flex items-center gap-3 ${aiValidation.correct ? 'bg-success-muted' : 'bg-warning-muted'}`}
                          >
                            {aiValidation.correct 
                              ? <CheckCircle size={22} strokeWidth={1.5} className="text-success" />
                              : <AlertTriangle size={22} strokeWidth={1.5} className="text-warning" />}
                            <div className="flex-1">
                              <div
                                className={`font-bold text-[13px] ${aiValidation.correct ? 'text-success' : 'text-warning'}`}
                              >
                                {aiValidation.correct ? 'Correct Approach!' : 'Needs Improvement'}
                              </div>
                              <div className="text-[11px] text-muted">
                                AI-graded evaluation
                              </div>
                            </div>
                            <div
                              className={`font-extrabold text-[22px] min-w-[50px] text-right ${aiValidation.correct ? 'text-success' : 'text-warning'}`}
                            >
                              {aiValidation.score}
                              <span className="text-xs text-muted font-medium">
                                /100
                              </span>
                            </div>
                          </div>
                          {/* Feedback */}
                          <div className="px-4 py-3 bg-surface">
                            <p className="text-xs text-text leading-relaxed m-0">
                              {aiValidation.feedback}
                            </p>
                            {aiValidation.suggestion && (
                              <div className="mt-2.5 px-3 py-2 rounded-md bg-surface-2 border border-border text-xs text-text-secondary leading-relaxed">
                                <strong className="text-text flex items-center gap-1 mb-1">
                                  <Lightbulb size={11} /> Suggestion
                                </strong>
                                {aiValidation.suggestion}
                              </div>
                            )}
                            <button
                              onClick={() => setAiValidation(null)}
                              className="mt-2.5 text-[11px] text-muted bg-transparent border-none cursor-pointer hover:text-text"
                            >
                              Re-validate →
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Generate Reference Solution */}
                      <div className="border-t border-border pt-4 mt-4">
                        {!aiSolution && !aiSolutionLoading && (
                          <div className="text-center">
                            <p className="text-xs text-muted mb-3.5 leading-relaxed">
                              Stuck? Have the AI generate a reference solution.
                            </p>
                            {!hasKey ? (
                              <div className="text-xs text-warning bg-warning-muted rounded-lg px-3.5 py-2.5 border border-warning flex items-center justify-center gap-1.5 text-left">
                                <KeyRound size={13} strokeWidth={2} className="shrink-0" />
                                <span>
                                  Add your Groq API key in{' '}
                                  <strong>Settings → AI Configuration</strong> to generate solutions.
                                </span>
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
                                    const clean = sql
                                      .replace(/```sql\n?/gi, '')
                                      .replace(/```/g, '')
                                      .trim();
                                    setAiSolution(clean);
                                    sessionStorage.setItem(cacheKey, clean);
                                    if (executeQuery) {
                                      const res = await executeQuery(clean);
                                      if (res) {
                                        if (res.error) setAiExpectedResult({ error: res.error });
                                        else if (res.columns)
                                          setAiExpectedResult({
                                            columns: res.columns,
                                            rows: res.rows ? res.rows.slice(0, 100) : [],
                                          });
                                      }
                                    }
                                  } catch (e) {
                                    setAiSolutionError(
                                      'Failed to generate solution. Please try again.'
                                    );
                                  } finally {
                                    setAiSolutionLoading(false);
                                  }
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-none bg-primary text-primary-foreground font-bold text-[13px] shadow-[0_2px_8px_rgba(139,92,246,0.35)] cursor-pointer hover:bg-primary/90 transition-colors"
                              >
                                <Sparkles size={13} strokeWidth={2} /> Generate AI Solution
                              </button>
                            )}
                          </div>
                        )}
                        {aiSolutionLoading && (
                          <div className="flex items-center gap-2.5 py-4 text-muted text-[13px]">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                            Generating SQL solution...
                          </div>
                        )}
                        {aiSolutionError && (
                          <div className="text-xs text-warning py-2.5 flex items-center gap-1.5">
                            <AlertTriangle size={13} className="shrink-0" /> {aiSolutionError}
                          </div>
                        )}
                        {aiSolution && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <span className="ai-badge text-[11px] font-bold px-2 py-0.5 flex items-center gap-1">
                                  <Cpu size={10} /> AI-Generated Solution
                                </span>
                              <button
                                onClick={() => {
                                  setAiSolution(null);
                                  setAiExpectedResult(null);
                                  sessionStorage.removeItem(`ai-sol-${question.id}`);
                                }}
                                className="ml-auto text-[11px] text-muted bg-transparent border-none cursor-pointer hover:text-text transition-colors"
                              >
                                Regenerate
                              </button>
                            </div>
                            <pre className="bg-bg p-3.5 rounded-lg font-mono text-xs text-text border border-border m-0 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                              {aiSolution}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Static question: standard AI Solution Review */
                    <button
                      onClick={onOpenAiTutor}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-surface-2 cursor-pointer text-[13px] font-semibold text-text transition-all duration-150 ease-in-out hover:bg-surface hover:border-primary/40 group"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles size={15} strokeWidth={2} className="text-primary" />
                        <span>AI Tutor Chat</span>
                        <span className="ai-badge text-[10px] px-1.5 py-[1px]">Groq</span>
                      </div>
                      <span className="text-xs text-text-secondary font-medium flex items-center gap-1 group-hover:text-primary transition-colors">
                        Ask the AI Tutor <ChevronRight size={14} />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expected Output */}
        <div className="border-t border-border pt-4">
          <h3 className="text-sm text-text mb-3 m-0">Expected Output</h3>
          <div className="bg-surface rounded-md border border-border overflow-auto max-h-[300px]">
            {question.isAiGenerated && aiSolutionLoading ? (
              <div className="p-4 text-center text-muted text-xs flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                Computing expected result via AI...
              </div>
            ) : question.isAiGenerated && !aiExpectedResult ? (
              <div className="px-4 py-8 text-center text-muted">
                <div className="text-3xl mb-3">🤖</div>
                <div className="text-sm font-semibold text-text mb-1.5">
                  AI challenges are open-ended
                </div>
                <div className="text-[13px] leading-relaxed max-w-[300px] mx-auto">
                  There is no fixed expected output. Run your SQL, then use the{' '}
                  <strong>Validate Query with AI</strong> button above to grade your approach!
                  <div className="mt-3 text-xs text-muted">
                    (Or click <strong>Generate AI Solution</strong> in the Solution tab to generate
                    a reference output table)
                  </div>
                </div>
              </div>
            ) : question.isAiGenerated && aiExpectedResult && aiExpectedResult.error ? (
              <div className="px-4 py-6 text-center text-error">
                <div className="text-2xl mb-2">⚠️</div>
                <div className="text-[13px] font-semibold mb-1">
                  AI-Generated SQL Error
                </div>
                <div className="text-xs leading-relaxed opacity-80 max-w-[300px] mx-auto">
                  {aiExpectedResult.error}
                </div>
                <button
                  onClick={() => {
                    setAiSolution(null);
                    setAiExpectedResult(null);
                    sessionStorage.removeItem(`ai-sol-${question.id}`);
                  }}
                  className="mt-3 text-xs px-3 py-1.5 bg-transparent text-error border border-error/30 rounded cursor-pointer hover:bg-error/10 transition-colors"
                >
                  Regenerate AI Solution
                </button>
              </div>
            ) : !question.isAiGenerated && !expectedResult ? (
              <div className="p-4 text-center text-muted text-xs">
                Computing expected result...
              </div>
            ) : (question.isAiGenerated ? aiExpectedResult : expectedResult)?.columns?.length >
              0 ? (
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    {(question.isAiGenerated ? aiExpectedResult : expectedResult).columns.map(
                      (col) => (
                        <th
                          key={col}
                          className="px-3 py-2 text-left border-b border-border bg-surface-2 sticky top-0 font-semibold text-text"
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {((question.isAiGenerated ? aiExpectedResult : expectedResult).rows || []).map(
                    (row, i) => (
                      <tr key={i} className="border-b border-border">
                        {row.map((val, j) => (
                          <td
                            key={j}
                            className="px-3 py-2 text-text-secondary"
                          >
                            {val === null ? (
                              <span className="text-muted italic">
                                null
                              </span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        ))}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            ) : (question.isAiGenerated ? aiExpectedResult : expectedResult)?.columns ? (
              <div className="px-4 py-8 text-center text-muted">
                <CheckCircle size={24} strokeWidth={1.5} className="text-success mb-2 mx-auto" />
                <div className="text-sm font-semibold text-text mb-1">
                  Query Successful
                </div>
                <div className="text-[13px]">Returned 0 rows</div>
              </div>
            ) : (
              <div className="p-4 text-center text-muted text-xs">
                No specific output required.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
