import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Target, ArrowLeft, RotateCcw, AlertTriangle, ShieldCheck, Loader2,
  Download, Building2, Star, CheckCircle, XCircle, Share2, Code2,
  HelpCircle, ListChecks, Trophy, TrendingUp, AlertCircle
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '@/lib/api';
import { groqChat, MODEL_SMART } from '@/lib/groq';
import { CodeBlock } from '@/shared/ui/CodeBlock';

// ─── Evaluate a single SQL answer against its question ───────────────────────
async function evaluateSqlAnswer(q, userSql, companyName) {
  if (!userSql || !userSql.trim() || userSql.includes('Write your SQL solution here')) {
    return { score: 0, feedback: 'No answer submitted for this question.', isCorrect: false };
  }
  const prompt = `You are a SQL interviewer at ${companyName}. Evaluate this SQL answer.

PROBLEM: ${(q.problemStatement ?? '').slice(0, 600)}
SCHEMA: ${q.tables?.map(t => `${t.name}(${t.columns?.map(c => c.name).join(',')})`).join('; ') ?? ''}
CANDIDATE SQL: ${userSql.slice(0, 600)}

Rate the answer from 0-20. Return ONLY compact JSON: {"score":N,"isCorrect":bool,"feedback":"1-2 sentences"}`;

  try {
    const raw = await groqChat(
      [{ role: 'system', content: prompt }],
      MODEL_SMART, 300, false, 'json_object'
    );
    const parsed = JSON.parse(raw);
    return { score: parsed.score ?? 0, isCorrect: parsed.isCorrect ?? false, feedback: parsed.feedback ?? '' };
  } catch {
    return { score: 0, isCorrect: false, feedback: 'Could not evaluate this answer.' };
  }
}

// ─── Score MCQ answers ────────────────────────────────────────────────────────
function scoreMcq(mcqQuestions, answers) {
  // answers[5..9] = { selectedIndex: N } | null
  let correct = 0;
  const details = (mcqQuestions ?? []).map((q, i) => {
    const ans = answers?.[i + 5];
    const selected = ans?.selectedIndex ?? null;
    const isCorrect = selected === q.correctIndex;
    if (isCorrect) correct++;
    return {
      question: q.question,
      selected,
      correctIndex: q.correctIndex,
      options: q.options,
      isCorrect,
      explanation: q.explanation,
    };
  });
  // 4 points per MCQ (5 × 4 = 20 total for MCQ)
  return { correct, total: mcqQuestions?.length ?? 0, score: correct * 4, details };
}

export function InterviewReport() {
  const location = useLocation();
  const navigate = useNavigate();

  const [session, setSession]           = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError]               = useState(null);
  const [sqlEvals, setSqlEvals]         = useState([]); // per-question eval results
  const [mcqResult, setMcqResult]       = useState(null);

  useEffect(() => {
    let payload = location.state?.sessionPayload;
    if (!payload) {
      try { payload = JSON.parse(sessionStorage.getItem('pending_interview_report') || 'null'); } catch {}
    }
    if (payload && !session && !isEvaluating && !error) {
      evaluate(payload);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const evaluate = async (payload) => {
    setIsEvaluating(true);
    try {
      // ── Violation short-circuit ──────────────────────────────────────────
      if (payload.forceZero) {
        const result = buildViolationResult(payload);
        await finalizeSession(result, payload);
        return;
      }

      // ── MCQ scoring (instant, no AI needed) ──────────────────────────────
      const mcq = scoreMcq(payload.sessionData?.mcq_questions, payload.answers);
      setMcqResult(mcq);

      // ── SQL evaluation (AI, parallel per question) ────────────────────────
      const sqlQs = payload.sessionData?.sql_questions ?? [];
      const sqlAnswers = (payload.answers ?? []).slice(0, 5);

      const evals = await Promise.all(
        sqlQs.map((q, i) => evaluateSqlAnswer(q, sqlAnswers[i]?.sql, payload.companyName))
      );
      setSqlEvals(evals);

      // ── Compute overall score ─────────────────────────────────────────────
      // SQL: 80 points total (16 per question × 5) — wait, let's do:
      // SQL: 5 questions × 16 = 80 pts max
      // MCQ: 5 questions × 4  = 20 pts max
      // Total = 100
      const sqlScore = evals.reduce((sum, e) => sum + Math.min(e.score, 16), 0); // cap at 16 each
      const totalScore = Math.round(sqlScore + mcq.score);

      const verdict =
        totalScore >= 85 ? 'Strong Hire' :
        totalScore >= 70 ? 'Hire' :
        totalScore >= 50 ? 'Lean Hire' :
        'No Hire';

      const result = {
        candidateName: payload.candidateName,
        companyName: payload.companyName,
        roleName: payload.roleName,
        score: totalScore,
        verdict,
        sqlScore,
        mcqScore: mcq.score,
        sqlEvals: evals,
        mcqResult: mcq,
        durationMinutes: payload.durationMinutes,
        createdAt: new Date().toISOString(),
      };

      await finalizeSession(result, payload);
    } catch (err) {
      console.error('[Report] Evaluation error:', err);
      setError('Evaluation failed. ' + err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const buildViolationResult = (payload) => ({
    candidateName: payload.candidateName,
    companyName: payload.companyName,
    roleName: payload.roleName,
    score: 0,
    verdict: 'No Hire',
    sqlScore: 0,
    mcqScore: 0,
    sqlEvals: [],
    mcqResult: null,
    violationMsg: payload.violationMsg,
    forceZero: true,
    durationMinutes: payload.durationMinutes,
    createdAt: new Date().toISOString(),
  });

  const finalizeSession = async (result, payload) => {
    try {
      await api.interviews.saveScore({
        companyName: result.companyName,
        score: result.score,
        verdict: result.verdict,
        feedback: JSON.stringify(result),
        durationMinutes: result.durationMinutes,
      });
    } catch { /* non-fatal */ }

    sessionStorage.removeItem('pending_interview_report');
    setSqlEvals(result.sqlEvals ?? []);
    setMcqResult(result.mcqResult ?? null);
    setSession(result);
    navigate(location.pathname, { replace: true, state: { session: result } });
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!session && !location.state?.sessionPayload && !sessionStorage.getItem('pending_interview_report')) {
    return <Navigate to="/interview" replace />;
  }

  if (isEvaluating) {
    return (
      <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-6">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-surface-3 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Trophy size={28} className="text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-black mb-3">Evaluating Your Interview</h1>
        <p className="text-text-secondary text-lg max-w-md text-center mb-6">
          Grading your SQL answers and tallying MCQ scores...
        </p>
        <div className="flex items-center gap-2">
          <div className="h-1 w-40 bg-surface-3 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-6">
        <AlertTriangle size={64} className="text-error mb-6" />
        <h1 className="text-3xl font-black mb-4 text-error">Evaluation Failed</h1>
        <p className="text-text-secondary text-lg max-w-md text-center mb-8">{error}</p>
        <Button variant="primary" onClick={() => navigate('/interview')}>Return to Lobby</Button>
      </div>
    );
  }

  if (!session) return null;

  const isHire     = session.verdict === 'Hire' || session.verdict === 'Strong Hire';
  const isNoHire   = session.verdict === 'No Hire';
  const verdictColor = isHire ? 'success' : isNoHire ? 'error' : 'warning';

  const handleShare = async () => {
    const txt = `I scored ${session.score}/100 on my ${session.companyName} Mock Interview via DataDesk! Verdict: ${session.verdict.toUpperCase()}`;
    if (navigator.share) { try { await navigator.share({ title: 'Interview Score', text: txt }); } catch {} }
    else { navigator.clipboard.writeText(txt); }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `@media print { .no-print { display: none !important; } }` }} />
      <div className="min-h-screen bg-bg text-text p-6 md:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">

          {/* Nav */}
          <div className="flex items-center justify-between mb-8 no-print">
            <Button variant="ghost" onClick={() => navigate('/interview')} className="text-text-secondary">
              <ArrowLeft size={16} /> Back to Lobby
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleShare}><Share2 size={15} /> Share</Button>
              <Button variant="outline" onClick={() => window.print()}><Download size={15} /> PDF</Button>
              <Button variant="primary" onClick={() => navigate('/interview')}><RotateCcw size={15} /> Retake</Button>
            </div>
          </div>

          {/* ── HERO SCORE CARD ─────────────────────────────────────────────── */}
          <div className={`relative bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-10 text-center mb-8 overflow-hidden shadow-2xl`}>
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-${verdictColor} to-transparent`} />
            <div className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2 flex items-center justify-center gap-2">
              <Building2 size={13} /> {session.companyName} Interview Report
            </div>
            <h2 className="text-4xl font-black mb-1">{session.candidateName}</h2>
            <p className="text-text-secondary mb-6">{session.roleName}</p>

            {session.forceZero ? (
              <div className="py-4">
                <div className="text-7xl font-black text-error mb-2">0<span className="text-3xl text-text-secondary/40">/100</span></div>
                <div className="text-error font-bold text-lg border border-error/30 bg-error/10 rounded-xl px-6 py-3 inline-block">
                  ⚠️ Proctoring Violation: {session.violationMsg}
                </div>
              </div>
            ) : (
              <>
                <div className={`text-8xl font-black text-${verdictColor} mb-1`}>
                  {session.score}<span className="text-4xl text-text-secondary/40">/100</span>
                </div>
                <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full border border-${verdictColor}/30 bg-${verdictColor}/10 text-${verdictColor} font-bold text-lg mt-3`}>
                  {isHire ? <ShieldCheck size={20} /> : isNoHire ? <AlertTriangle size={20} /> : <Target size={20} />}
                  {session.verdict}
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-2 gap-4 mt-8 max-w-sm mx-auto">
                  <div className="bg-surface-2 border border-border rounded-2xl p-4">
                    <Code2 size={20} className="text-primary mx-auto mb-1" />
                    <p className="text-2xl font-black">{session.sqlScore ?? 0}<span className="text-sm text-text-secondary">/80</span></p>
                    <p className="text-xs text-text-secondary">SQL Coding</p>
                  </div>
                  <div className="bg-surface-2 border border-border rounded-2xl p-4">
                    <ListChecks size={20} className="text-success mx-auto mb-1" />
                    <p className="text-2xl font-black">{session.mcqScore ?? 0}<span className="text-sm text-text-secondary">/20</span></p>
                    <p className="text-xs text-text-secondary">MCQ Conceptual</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {!session.forceZero && (
            <>
              {/* ── SQL QUESTION BREAKDOWN ────────────────────────────────────── */}
              <div className="mb-8">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                  <Code2 size={20} className="text-primary" /> SQL Question Results
                </h3>
                <div className="space-y-4">
                  {(session.sqlEvals ?? sqlEvals).map((ev, i) => {
                    const q = location.state?.sessionPayload?.sessionData?.sql_questions?.[i] ?? {};
                    const userSql = location.state?.sessionPayload?.answers?.[i]?.sql ?? '';
                    const sc = Math.min(ev.score ?? 0, 16);
                    const pct = Math.round((sc / 16) * 100);
                    return (
                      <div key={i} className={`bg-surface/70 border rounded-2xl p-6 ${ev.isCorrect ? 'border-success/30' : sc > 8 ? 'border-warning/30' : 'border-border'}`}>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {ev.isCorrect
                                ? <CheckCircle size={16} className="text-success" />
                                : sc > 8 ? <AlertCircle size={16} className="text-warning" /> : <XCircle size={16} className="text-error" />
                              }
                              <span className="font-bold text-sm">SQL Q{i + 1}</span>
                            </div>
                            <p className="text-xs text-text-secondary line-clamp-2">{q.problemStatement ?? `Question ${i + 1}`}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className={`text-2xl font-black ${ev.isCorrect ? 'text-success' : sc > 8 ? 'text-warning' : 'text-error'}`}>{sc}<span className="text-sm text-text-secondary">/16</span></p>
                            <div className="w-16 h-1.5 bg-surface-3 rounded-full mt-1 overflow-hidden">
                              <div className={`h-full rounded-full ${ev.isCorrect ? 'bg-success' : sc > 8 ? 'bg-warning' : 'bg-error'}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-text-secondary bg-surface-2 rounded-xl p-3">{ev.feedback}</p>
                        {userSql && !userSql.includes('Write your SQL') && (
                          <div className="mt-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">Your Answer</p>
                            <pre className="text-xs font-mono bg-bg border border-border rounded-lg p-3 overflow-x-auto text-text-secondary">{userSql}</pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── MCQ BREAKDOWN ─────────────────────────────────────────────── */}
              {(session.mcqResult ?? mcqResult) && (
                <div className="mb-8">
                  <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                    <ListChecks size={20} className="text-success" /> MCQ Results
                    <span className="text-base text-text-secondary font-normal ml-2">
                      {(session.mcqResult ?? mcqResult).correct}/{(session.mcqResult ?? mcqResult).total} correct
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {(session.mcqResult ?? mcqResult).details?.map((d, i) => (
                      <div key={i} className={`bg-surface/70 border rounded-2xl p-5 ${d.isCorrect ? 'border-success/30' : 'border-error/30'}`}>
                        <div className="flex items-start gap-3 mb-3">
                          {d.isCorrect
                            ? <CheckCircle size={16} className="text-success shrink-0 mt-0.5" />
                            : <XCircle size={16} className="text-error shrink-0 mt-0.5" />
                          }
                          <p className="text-sm font-semibold text-text">{d.question}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {d.options?.map((opt, oi) => {
                            let style = 'border-border bg-surface-2 text-text-secondary';
                            if (oi === d.correctIndex) style = 'border-success/40 bg-success/10 text-success';
                            else if (oi === d.selected && !d.isCorrect) style = 'border-error/40 bg-error/10 text-error line-through';
                            return (
                              <div key={oi} className={`text-xs px-3 py-2 rounded-lg border ${style}`}>
                                <span className="font-bold mr-2">{['A','B','C','D'][oi]}.</span>{opt}
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-text-secondary bg-surface-2 rounded-lg px-3 py-2">{d.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}
