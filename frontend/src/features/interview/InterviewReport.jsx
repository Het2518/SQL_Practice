import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Target, ArrowLeft, RotateCcw, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '@/lib/api';
import { groqChat, MODEL_SMART } from '@/lib/groq';

export function InterviewReport() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(location.state?.session || null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we received a raw payload, we need to grade it first!
    const payload = location.state?.sessionPayload;
    if (payload && !session && !isEvaluating && !error) {
      evaluateSubmission(payload);
    }
  }, [location.state, session, isEvaluating, error]);

  const evaluateSubmission = async (payload) => {
    setIsEvaluating(true);
    try {
      let score = 0;
      let verdict = 'No Hire';
      let feedback = payload.violationMsg || 'No feedback provided.';

      if (payload.forceZero) {
        // Zero-tolerance failure
        score = 0;
        verdict = 'No Hire';
        feedback = `**PROCTORING VIOLATION DETECTED**\n\nYour interview was instantly terminated and a score of 0 was recorded due to the following violation:\n\n> ${payload.violationMsg}\n\nFAANG interviews require strict adherence to proctoring rules. You may not exit fullscreen or switch tabs.`;
      } else {
        // AI Grading
        const systemPrompt = `[IDENTITY]: You are a Principal Engineer at ${payload.companyName} grading a SQL interview.
[TASK]: The candidate was given the problem: "${payload.initialTask}"
They have submitted their final SQL query:
\`\`\`sql
${payload.sql}
\`\`\`
[INSTRUCTIONS]: 
1. Ignore any previous chat history. Evaluate ONLY the final SQL query submitted.
2. Rate the query purely on logic, correctness, efficiency, and edge-case handling.
3. DO NOT hallucinate. If the query logically solves the prompt based on a reasonable schema assumption, pass it.
4. Provide a structured markdown response with:
   - **Verdict**: Hire / No Hire / Lean Hire
   - **Correctness**: What they got right/wrong.
   - **Efficiency**: Any optimization feedback.
   - **Optimal Solution**: (You MAY provide the correct SQL solution here in the final report).
CRITICAL: You MUST end your response with a JSON-like block containing the numeric score out of 100 and a short verdict ("Strong Hire", "Hire", "Borderline", "No Hire"), in exactly this format:
[SCORE: 85/100]
[VERDICT: Hire]`;
        
        const response = await groqChat([{ role: 'system', content: systemPrompt }], MODEL_SMART, 500, false);
        const scoreMatch = response.match(/\[SCORE:\s*(\d+)\/100\]/i);
        const verdictMatch = response.match(/\[VERDICT:\s*(.+?)\]/i);
        
        score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
        verdict = verdictMatch ? verdictMatch[1].trim() : 'Borderline';
        feedback = response.replace(/\[SCORE:.*?\]/i, '').replace(/\[VERDICT:.*?\]/i, '').trim();
      }

      const localSession = {
        companyId: { name: payload.companyName },
        score,
        verdict,
        feedback,
        durationMinutes: payload.durationMinutes,
        createdAt: new Date().toISOString()
      };

      try {
        // Save to database
        const res = await api.interviews.saveScore({
          companyName: payload.companyName,
          score,
          verdict,
          feedback,
          durationMinutes: payload.durationMinutes
        });
        setSession(res.data?.data?.session || res.data?.session || res.data || localSession);
      } catch (saveErr) {
        console.error('Failed to save score:', saveErr);
        // Continue showing report locally even if save fails
        setSession(localSession);
      }

      // Clear history to prevent resubmission on refresh
      window.history.replaceState({}, document.title);
    } catch (err) {
      console.error(err);
      setError('A network error occurred while grading your interview.');
    } finally {
      setIsEvaluating(false);
    }
  };
  
  if (!session && !location.state?.sessionPayload) {
    return <Navigate to="/interview" replace />;
  }

  if (isEvaluating) {
    return (
      <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-6 page-enter">
        <Loader2 size={64} className="animate-spin text-primary mb-6" />
        <h1 className="text-3xl font-black mb-4">Evaluating Submission...</h1>
        <p className="text-text-secondary text-lg max-w-md text-center">
          Our AI Principal Engineer is carefully reviewing your SQL query against FAANG standards. This takes about 5-10 seconds.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-6 page-enter">
        <AlertTriangle size={64} className="text-error mb-6" />
        <h1 className="text-3xl font-black mb-4 text-error">Evaluation Failed</h1>
        <p className="text-text-secondary text-lg max-w-md text-center mb-8">{error}</p>
        <Button variant="primary" onClick={() => navigate('/interview')}>Return to Dashboard</Button>
      </div>
    );
  }

  const safeSession = session || {};
  const isHire = safeSession.verdict === 'Hire' || safeSession.verdict === 'Strong Hire';
  const isNoHire = safeSession.verdict === 'No Hire' || safeSession.verdict === 'Fail' || (safeSession.verdict || '').toLowerCase().includes('violation');

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-12 overflow-y-auto page-enter">
      <div className="max-w-[800px] mx-auto">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/interview')} className="text-text-secondary">
            <ArrowLeft size={16} /> Back to Dashboard
          </Button>
          <Button variant="ghost" onClick={() => navigate(`/interview/preflight/${safeSession.companyId?.name || 'FAANG'}`)}>
            <RotateCcw size={16} /> Retake Interview
          </Button>
        </div>

        {/* Hero Section */}
        <div className="bg-surface border border-border rounded-3xl p-8 md:p-12 text-center shadow-xl mb-8 relative overflow-hidden">
          {/* Decorative background gradients based on verdict */}
          <div className={`absolute inset-0 opacity-10 ${isHire ? 'bg-gradient-to-br from-success to-transparent' : isNoHire ? 'bg-gradient-to-br from-error to-transparent' : 'bg-gradient-to-br from-warning to-transparent'}`} />
          
          <div className="relative z-10">
            <div className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-4">
              Mock Interview Results
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
              {safeSession.verdict || 'Evaluation Complete'}
            </h2>
            <div className="flex flex-col items-center gap-2">
              <div className="text-7xl font-black tracking-tighter" style={{ color: isHire ? 'var(--success)' : isNoHire ? 'var(--error)' : 'var(--warning)' }}>
                {safeSession.score || 0}<span className="text-3xl text-text-secondary">/100</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border bg-surface-2 text-lg font-bold mt-6">
              {isHire ? (
                <><ShieldCheck size={20} className="text-success" /> <span className="text-success">{(safeSession.verdict || 'Hire').toUpperCase()}</span></>
              ) : isNoHire ? (
                <><AlertTriangle size={20} className="text-error" /> <span className="text-error">{(safeSession.verdict || 'Fail').toUpperCase()}</span></>
              ) : (
                <><Target size={20} className="text-warning" /> <span className="text-warning">{(safeSession.verdict || 'Borderline').toUpperCase()}</span></>
              )}
            </div>
          </div>
        </div>

        {/* AI Feedback Report */}
        <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="text-primary" /> Interviewer Feedback
          </h3>
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-text-secondary">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {safeSession.feedback || 'No feedback available.'}
            </ReactMarkdown>
          </div>
        </div>

      </div>
    </div>
  );
}

function BotIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
    </svg>
  );
}
