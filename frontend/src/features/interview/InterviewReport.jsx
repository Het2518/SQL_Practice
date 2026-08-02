import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Target, ArrowLeft, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function InterviewReport() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const session = location.state?.session;
  
  if (!session) {
    return <Navigate to="/interview" replace />;
  }

  const isHire = session.verdict === 'Hire' || session.verdict === 'Strong Hire';
  const isNoHire = session.verdict === 'No Hire' || session.verdict === 'Fail';

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-12 overflow-y-auto page-enter">
      <div className="max-w-[800px] mx-auto">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/interview')} className="text-text-secondary">
            <ArrowLeft size={16} /> Back to Dashboard
          </Button>
          <Button variant="ghost" onClick={() => navigate(`/interview/preflight/${session.companyId?.name || 'FAANG'}`)}>
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
            
            <div className="flex justify-center items-end gap-2 mb-6">
              <span className={`text-7xl font-black leading-none ${isHire ? 'text-success' : isNoHire ? 'text-error' : 'text-warning'}`}>
                {session.overallScore}
              </span>
              <span className="text-2xl font-bold text-text-secondary mb-2">/100</span>
            </div>

            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border bg-surface-2 text-lg font-bold">
              {isHire ? (
                <><ShieldCheck size={20} className="text-success" /> <span className="text-success">{session.verdict.toUpperCase()}</span></>
              ) : isNoHire ? (
                <><AlertTriangle size={20} className="text-error" /> <span className="text-error">{session.verdict.toUpperCase()}</span></>
              ) : (
                <><Target size={20} className="text-warning" /> <span className="text-warning">{session.verdict.toUpperCase()}</span></>
              )}
            </div>
          </div>
        </div>

        {/* AI Feedback Report */}
        <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-text mb-6 pb-4 border-b border-border flex items-center gap-2">
            <BotIcon /> Interviewer Feedback
          </h3>
          
          <div className="prose prose-p:my-4 prose-headings:text-text prose-strong:text-text prose-ul:text-text-secondary text-text-secondary max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {session.aiFeedbackSummary}
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
