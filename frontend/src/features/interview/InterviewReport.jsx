import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Target, ArrowLeft, RotateCcw, AlertTriangle, ShieldCheck, Loader2, Download, Building2, User, Star, CheckCircle, XCircle, Share2 } from 'lucide-react';
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
      let jsonFeedback = {
        correctness: '',
        strengths: [],
        weaknesses: [],
        optimization: '',
        optimal_sql: ''
      };

      if (payload.forceZero) {
        score = 0;
        verdict = 'No Hire';
        jsonFeedback.correctness = `**PROCTORING VIOLATION DETECTED**\n\nYour interview was terminated due to a violation of the strict proctoring policy:\n\n> ${payload.violationMsg}`;
        jsonFeedback.strengths = ['None recorded due to termination'];
        jsonFeedback.weaknesses = ['Zero-Tolerance Integrity Policy Violation'];
      } else {
        const systemPrompt = `[IDENTITY]: You are the Hiring Manager at ${payload.companyName} evaluating a ${payload.roleName} candidate named ${payload.candidateName}.
[TASK]: Evaluate the candidate's final SQL query based on this prompt: "${payload.initialTask}"
Their code:
\`\`\`sql
${payload.sql}
\`\`\`
[RULES]: 
1. Evaluate purely on logic, correctness, efficiency, and edge-case handling.
2. DO NOT hallucinate.
3. You MUST output a strictly valid JSON object matching this schema exactly, and nothing else (no markdown wrappers, just raw JSON):
{
  "score": 85, // number from 0 to 100
  "verdict": "Hire", // must be "Strong Hire", "Hire", "Lean Hire", or "No Hire"
  "correctness": "Detailed analysis of what works and what fails",
  "strengths": ["string", "string"], // 2-3 bullet points
  "weaknesses": ["string", "string"], // 2-3 bullet points
  "optimization": "How to optimize this query further",
  "optimal_sql": "The optimal solution code"
}`;
        
        let response = await groqChat([{ role: 'system', content: systemPrompt }], MODEL_SMART, 1000, false);
        
        try {
          // Robustly extract JSON block using regex to ignore markdown or conversational filler
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          const cleanJsonString = jsonMatch ? jsonMatch[0] : response;
          const parsed = JSON.parse(cleanJsonString);
          score = parsed.score || 0;
          verdict = parsed.verdict || 'No Hire';
          jsonFeedback = parsed;
        } catch(e) {
          console.error("Failed to parse JSON feedback:", e);
          score = 50;
          verdict = 'Borderline';
          jsonFeedback.correctness = "Feedback parsing error. Raw response: " + response;
        }
      }

      const localSession = {
        companyId: { name: payload.companyName },
        candidateName: payload.candidateName,
        roleName: payload.roleName,
        score,
        verdict,
        feedback: JSON.stringify(jsonFeedback), // store as string in DB
        durationMinutes: payload.durationMinutes,
        createdAt: new Date().toISOString()
      };

      try {
        const res = await api.interviews.saveScore({
          companyName: payload.companyName,
          score,
          verdict,
          feedback: JSON.stringify(jsonFeedback),
          durationMinutes: payload.durationMinutes
        });
        setSession(res.data?.data?.session || res.data?.session || res.data || localSession);
      } catch (saveErr) {
        console.error('Failed to save score:', saveErr);
        setSession(localSession);
      }

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
        <h1 className="text-3xl font-black mb-4">Hiring Committee Review...</h1>
        <p className="text-text-secondary text-lg max-w-md text-center">
          The Principal Engineers are evaluating your code for correctness, efficiency, and scale.
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
        <Button variant="primary" onClick={() => navigate('/interview')}>Return to Lobby</Button>
      </div>
    );
  }

  const safeSession = session || {};
  const isHire = safeSession.verdict === 'Hire' || safeSession.verdict === 'Strong Hire';
  const isNoHire = safeSession.verdict === 'No Hire' || safeSession.verdict === 'Fail' || (safeSession.verdict || '').toLowerCase().includes('violation');
  
  let parsedFeedback = {};
  try {
    parsedFeedback = JSON.parse(safeSession.feedback || '{}');
  } catch(e) {}

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareText = `I just scored ${safeSession.score || 0}/100 on my ${safeSession.companyId?.name || safeSession.companyName || 'Enterprise'} Mock Interview via DataDesk! Verdict: ${(safeSession.verdict || 'Hire').toUpperCase()}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Interview Score', text: shareText, url: window.location.href });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Score copied to clipboard!');
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print { 
          body { background: white; color: black; }
          .no-print { display: none !important; }
          .print-break-inside { break-inside: avoid; }
          .print-border { border: 1px solid #ddd !important; }
        }
      `}} />

      <div className="min-h-screen bg-bg text-text p-6 md:p-12 overflow-y-auto page-enter">
        <div className="max-w-[900px] mx-auto print:max-w-full">
          
          {/* Header Actions (No Print) */}
          <div className="flex items-center justify-between mb-8 no-print">
            <Button variant="ghost" onClick={() => navigate('/interview')} className="text-text-secondary">
              <ArrowLeft size={16} /> Back to Lobby
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleShare} className="no-print">
                <Share2 size={16} /> Share Score
              </Button>
              <Button variant="outline" onClick={handlePrint} className="no-print">
                <Download size={16} /> Download PDF
              </Button>
              <Button variant="primary" onClick={() => navigate('/interview')} className="no-print">
                <RotateCcw size={16} /> Retake Interview
              </Button>
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-surface border border-border print-border rounded-3xl p-8 md:p-12 text-center shadow-xl mb-8 relative overflow-hidden print-break-inside">
            <div className={`absolute inset-0 opacity-10 no-print ${isHire ? 'bg-gradient-to-br from-success to-transparent' : isNoHire ? 'bg-gradient-to-br from-error to-transparent' : 'bg-gradient-to-br from-warning to-transparent'}`} />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2 flex items-center justify-center gap-2">
                <Building2 size={14}/> {safeSession.companyId?.name || safeSession.companyName || 'Enterprise'} Interview Report
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
                {safeSession.candidateName || 'Candidate'}
              </h2>
              <p className="text-text-secondary mb-6">{safeSession.roleName || 'Software Engineer'}</p>

              <div className="flex flex-col items-center gap-2">
                <div className={`text-7xl font-black tracking-tighter ${isHire ? 'text-success' : isNoHire ? 'text-error' : 'text-warning'}`}>
                  {safeSession.score || 0}<span className="text-3xl text-text-secondary">/100</span>
                </div>
              </div>

              <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full border bg-surface-2 text-lg font-bold mt-6 ${isHire ? 'border-success/30' : isNoHire ? 'border-error/30' : 'border-warning/30'}`}>
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

          {/* Feedback Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print-break-inside">
            {/* Strengths */}
            <div className="bg-surface border border-border print-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-text">
                <CheckCircle size={18} className="text-success" /> Key Strengths
              </h3>
              <ul className="space-y-3">
                {parsedFeedback.strengths?.length > 0 ? (
                  parsedFeedback.strengths.map((str, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                      <span className="text-success mt-1">•</span> {str}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-text-muted">No specific strengths identified.</li>
                )}
              </ul>
            </div>
            
            {/* Weaknesses */}
            <div className="bg-surface border border-border print-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-text">
                <XCircle size={18} className="text-error" /> Areas for Improvement
              </h3>
              <ul className="space-y-3">
                {parsedFeedback.weaknesses?.length > 0 ? (
                  parsedFeedback.weaknesses.map((str, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                      <span className="text-error mt-1">•</span> {str}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-text-muted">No specific weaknesses identified.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Correctness & Logic */}
          <div className="bg-surface border border-border print-border rounded-2xl p-8 shadow-sm mb-8 print-break-inside">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="text-primary" /> Hiring Committee Feedback
            </h3>
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-text-secondary">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {parsedFeedback.correctness || safeSession.feedback || 'No feedback available.'}
              </ReactMarkdown>
            </div>
          </div>

          {/* Optimal Solution */}
          {parsedFeedback.optimal_sql && (
            <div className="bg-surface border border-border print-border rounded-2xl p-8 shadow-sm print-break-inside">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Star className="text-warning" /> Optimal FAANG Solution
              </h3>
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-text-secondary">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {`\`\`\`sql\n${parsedFeedback.optimal_sql}\n\`\`\``}
                </ReactMarkdown>
                <div className="mt-4 text-sm bg-surface-2 p-4 rounded-xl border border-border">
                  <span className="font-bold block mb-1">Optimization Notes:</span>
                  {parsedFeedback.optimization || 'N/A'}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
