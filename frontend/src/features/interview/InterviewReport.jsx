import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Target, ArrowLeft, RotateCcw, AlertTriangle, ShieldCheck, Loader2, Download, Building2, User, Star, CheckCircle, XCircle, Share2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '@/lib/api';
import { evaluateInterview } from '@/lib/groq';

export function InterviewReport() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(location.state?.session || null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let payload = location.state?.sessionPayload;
    if (!payload) {
      try {
        const stored = sessionStorage.getItem('pending_interview_report');
        if (stored) payload = JSON.parse(stored);
      } catch(e) {}
    }

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
        let response = '';
        try {
          response = await evaluateInterview({
            companyName: payload.companyName,
            candidateName: payload.candidateName,
            roleName: payload.roleName,
            initialTask: payload.initialTask,
            sql: payload.sql
          });
        } catch (apiErr) {
          if (apiErr.message === 'MISSING_API_KEY') {
            setError('Missing API Key: Please configure your Groq API key in Settings to receive AI evaluations.');
            throw apiErr;
          } else {
            throw apiErr;
          }
        }
        
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

      sessionStorage.removeItem('pending_interview_report');
      navigate(location.pathname, { replace: true, state: { session: localSession } });
    } catch (err) {
      console.error(err);
      setError('A network error occurred while grading your interview.');
    } finally {
      setIsEvaluating(false);
    }
  };
  
  if (!session && !location.state?.sessionPayload && !sessionStorage.getItem('pending_interview_report')) {
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

      <div className="min-h-screen bg-bg text-text p-6 md:p-12 overflow-y-auto page-enter relative overflow-hidden">
        
        {/* Dynamic Ambient Background Glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 no-print">
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full blur-[150px] opacity-[0.15] dark:opacity-[0.1] transition-colors duration-1000 ${isHire ? 'bg-success' : isNoHire ? 'bg-error' : 'bg-warning'}`} />
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.015]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
        </div>

        <div className="max-w-[900px] mx-auto print:max-w-full relative z-10">
          
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
          <div className="bg-surface/80 backdrop-blur-2xl border border-border/80 print-border rounded-[2.5rem] p-10 md:p-16 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] mb-8 relative overflow-hidden print-break-inside transition-all">
            <div className={`absolute top-0 left-0 w-full h-2 no-print ${isHire ? 'bg-gradient-to-r from-success/50 via-success to-success/50' : isNoHire ? 'bg-gradient-to-r from-error/50 via-error to-error/50' : 'bg-gradient-to-r from-warning/50 via-warning to-warning/50'}`} />
            
            <div className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none no-print ${isHire ? 'bg-success' : isNoHire ? 'bg-error' : 'bg-warning'}`} />
            <div className={`absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none no-print ${isHire ? 'bg-success' : isNoHire ? 'bg-error' : 'bg-warning'}`} />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2 flex items-center justify-center gap-2">
                <Building2 size={14}/> {safeSession.companyId?.name || safeSession.companyName || 'Enterprise'} Interview Report
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
                {safeSession.candidateName || 'Candidate'}
              </h2>
              <p className="text-text-secondary mb-6">{safeSession.roleName || 'Software Engineer'}</p>

              <div className="flex flex-col items-center gap-2 my-6">
                <div className="relative">
                  <div className={`absolute inset-0 blur-3xl opacity-20 ${isHire ? 'bg-success' : isNoHire ? 'bg-error' : 'bg-warning'}`} />
                  <div className={`text-8xl md:text-[8rem] font-black tracking-tighter relative z-10 leading-none ${isHire ? 'text-success' : isNoHire ? 'text-error' : 'text-warning'}`} style={{ textShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
                    {safeSession.score || 0}<span className="text-4xl text-text-secondary/50 font-bold tracking-normal align-baseline">/100</span>
                  </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print-break-inside">
            {/* Strengths */}
            <div className="bg-surface/70 backdrop-blur-xl border border-border print-border rounded-3xl p-8 shadow-lg hover:shadow-xl hover:border-success/30 transition-all group">
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
            <div className="bg-surface/70 backdrop-blur-xl border border-border print-border rounded-3xl p-8 shadow-lg hover:shadow-xl hover:border-error/30 transition-all group">
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
          <div className="bg-surface/70 backdrop-blur-xl border border-border print-border rounded-3xl p-8 md:p-10 shadow-lg mb-8 print-break-inside hover:border-primary/30 transition-all">
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
            <div className="bg-surface/70 backdrop-blur-xl border border-border print-border rounded-3xl p-8 md:p-10 shadow-lg print-break-inside relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-warning/5 rounded-bl-full blur-3xl group-hover:bg-warning/10 transition-colors pointer-events-none" />
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
