import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BarChart, ShieldCheck, AlertTriangle, Building2, User, Briefcase, FileText, Rocket, Landmark, Zap, Database, ArrowRight, Monitor } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Header, HeaderBreadcrumbs } from '@/shared/ui/Header';
import { Button } from '@/shared/ui/Button';
import { useProctorStore } from './useProctorStore';

const DURATIONS = [
  { label: '30 Min (Screen)', value: 30 },
  { label: '45 Min (Standard)', value: 45 },
  { label: '60 Min (Deep Dive)', value: 60 },
  { label: '90 Min (System)', value: 90 },
];

const DIFFICULTIES = [
  { label: 'L3 / Junior', value: 'easy' },
  { label: 'L4 / Mid-Level', value: 'medium' },
  { label: 'L5 / Senior', value: 'hard' },
  { label: 'L6+ / Staff', value: 'mixed' },
];

const COMPANIES = [
  { id: 'faang', name: 'FAANG / Big Tech', icon: Rocket, color: 'text-blue-500' },
  { id: 'fintech', name: 'FinTech (Stripe, Plaid)', icon: Landmark, color: 'text-emerald-500' },
  { id: 'startup', name: 'High-Growth Startup', icon: Zap, color: 'text-purple-500' },
  { id: 'data', name: 'Data Eng (Databricks)', icon: Database, color: 'text-orange-500' },
];

export function InterviewPage({ user, onShowAuth, onShowSettings }) {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(45);
  const [difficulty, setDifficulty] = useState('medium');
  const [company, setCompany] = useState('faang');
  const [role, setRole] = useState('Data Engineer');
  
  // Profile state for candidate lobby
  const [candidateName, setCandidateName] = useState(user?.name || '');

  const { resetProctoring, clearSessionState } = useProctorStore();

  useEffect(() => {
    // Wipe any previous termination states or saved sessions when landing in the lobby
    resetProctoring();
    clearSessionState();
  }, [resetProctoring, clearSessionState]);

  const handleStart = () => {
    navigate(`/interview/permissions?duration=${duration}&difficulty=${difficulty}&company=${company}&role=${encodeURIComponent(role)}&name=${encodeURIComponent(candidateName)}`);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-bg overflow-hidden page-enter">
      <Helmet>
        <title>FAANG SQL Mock Interview | Proctored SQL Simulator</title>
        <meta name="description" content="Simulate a real FAANG SQL technical interview. Features strict zero-tolerance proctoring, AI Principal Engineer evaluation, and a full Hiring Committee PDF report." />
        <meta name="keywords" content="FAANG SQL interview, SQL mock interview, Databricks SQL interview, Meta SQL practice, AI SQL proctoring, tech interview simulator" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "FAANG SQL Interview Arena",
            "applicationCategory": "EducationalApplication",
            "description": "An enterprise-grade, zero-tolerance proctored SQL interview simulator featuring real-time AI evaluation from FAANG-calibre virtual engineers.",
            "provider": {
              "@type": "Organization",
              "name": "DataDesk",
              "sameAs": "https://sql-practice-sepia.vercel.app"
            }
          })}
        </script>
      </Helmet>
      
      <Header
        user={user}
        onShowAuth={onShowAuth}
        onShowSettings={onShowSettings}
        leftContent={
          <HeaderBreadcrumbs
            items={[{ label: 'Home', onClick: () => navigate('/') }, { label: 'Interview Lobby' }]}
          />
        }
      />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 w-full h-full">
        
        {/* ── LEFT PANEL: The Hook ── */}
        <div className="hidden lg:flex lg:w-1/2 bg-surface text-text p-12 xl:p-16 flex-col justify-center relative overflow-hidden border-r border-border/50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-error/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/2 left-1/2 translate-x-1/4 -translate-y-1/4 w-[600px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

          <div className="relative z-10 max-w-xl mx-auto w-full animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-error/20 bg-error/10 shadow-sm text-xs font-bold uppercase tracking-widest text-error backdrop-blur-md">
              <ShieldCheck size={14} className="text-error" /> Zero-Tolerance Proctoring
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-[1.05] text-text">
              Enterprise <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-error to-orange-500">Interview Arena</span>
            </h1>
            
            <p className="text-text-secondary text-lg mb-12 leading-relaxed max-w-md">
              Simulate a real FAANG technical screen. Enter a strictly proctored environment featuring an AI Principal Engineer evaluation and a full Hiring Committee PDF report.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-error/5 flex items-center justify-center shrink-0 border border-error/10 shadow-sm backdrop-blur-sm">
                  <AlertTriangle size={22} className="text-error" />
                </div>
                <div>
                  <h4 className="font-bold text-text mb-1">Strict Rules Enforced</h4>
                  <p className="text-sm text-text-secondary leading-relaxed max-w-xs">Leaving the tab, pressing ESC, or pasting code instantly terminates the interview (Score: 0).</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/5 flex items-center justify-center shrink-0 border border-orange-500/10 shadow-sm backdrop-blur-sm">
                  <ShieldCheck size={22} className="text-orange-500" />
                </div>
                <div>
                  <h4 className="font-bold text-text mb-1">Full A/V Monitoring</h4>
                  <p className="text-sm text-text-secondary leading-relaxed max-w-xs">Camera, screen, and microphone must remain active throughout the duration.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Configuration ── */}
        <div className="flex-1 bg-bg flex flex-col relative overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-3xl mx-auto p-8 md:p-12 lg:p-16 flex flex-col gap-12 pb-32">
            
            {/* Candidate Info */}
            <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><User size={16} /></div>
                <h2 className="text-xl font-bold text-text">Candidate Profile</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="px-5 py-3.5 bg-surface border border-border rounded-xl text-text font-medium shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Target Role</label>
                  <div className="relative">
                    <select 
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-5 py-3.5 bg-surface border border-border rounded-xl text-text font-medium shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="Data Engineer">Data Engineer</option>
                      <option value="Backend Engineer">Backend Engineer</option>
                      <option value="Data Scientist">Data Scientist</option>
                      <option value="Analytics Engineer">Analytics Engineer</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-text-secondary">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Target Company */}
            <section className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Building2 size={16} /></div>
                <h2 className="text-xl font-bold text-text">Target Company Style</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {COMPANIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCompany(c.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                      company === c.id
                        ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                        : 'border-border bg-surface hover:border-primary/30 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${company === c.id ? 'bg-primary text-bg' : 'bg-surface-2 group-hover:bg-primary/10 text-text-secondary group-hover:text-primary'}`}>
                      <c.icon size={20} className={company === c.id ? '' : c.color} />
                    </div>
                    <span className={`text-sm font-bold text-left ${company === c.id ? 'text-primary' : 'text-text group-hover:text-primary'}`}>{c.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Difficulty */}
            <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><BarChart size={16} /></div>
                <h2 className="text-xl font-bold text-text">Interview Level</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all cursor-pointer ${
                      difficulty === d.value
                        ? 'border-primary bg-primary text-bg shadow-md scale-[1.02]'
                        : 'border-border bg-surface hover:border-primary/30 hover:bg-surface-2 text-text-secondary hover:text-text'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Time Limit */}
            <section className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Clock size={16} /></div>
                <h2 className="text-xl font-bold text-text">Session Duration</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all cursor-pointer ${
                      duration === d.value
                        ? 'border-primary bg-primary text-bg shadow-md scale-[1.02]'
                        : 'border-border bg-surface hover:border-primary/30 hover:bg-surface-2 text-text-secondary hover:text-text'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </section>
          </div>
          
          {/* Sticky Footer Action */}
          <div className="sticky bottom-0 w-full bg-bg/80 backdrop-blur-2xl border-t border-border p-5 md:px-12 flex items-center justify-between z-20">
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Session Summary</span>
              <span className="text-sm font-bold text-text flex items-center gap-2">
                {candidateName || 'Anonymous'} <span className="text-border">•</span> {role} <span className="text-border">•</span> {duration} mins
              </span>
            </div>
            
            <div className="flex-1 sm:flex-none flex justify-end">
              <Button 
                size="lg" 
                variant="primary" 
                onClick={handleStart} 
                className="w-full sm:w-auto px-8 py-6 text-base font-bold shadow-[0_0_24px_rgba(var(--primary),0.2)] hover:shadow-[0_0_32px_rgba(var(--primary),0.3)] transition-all rounded-xl"
                disabled={!candidateName.trim()}
              >
                Continue to Setup <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
