import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BarChart, ShieldCheck, AlertTriangle, Building2, User, Briefcase, FileText } from 'lucide-react';
import { Header, HeaderBreadcrumbs } from '@/shared/ui/Header';
import { Button } from '@/shared/ui/Button';

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
  { id: 'faang', name: 'FAANG / Big Tech', logo: '🚀' },
  { id: 'fintech', name: 'FinTech (Stripe, Plaid)', logo: '💳' },
  { id: 'startup', name: 'High-Growth Startup', logo: '🦄' },
  { id: 'data', name: 'Data Eng (Databricks)', logo: '📊' },
];

export function InterviewPage({ user, onShowAuth, onShowSettings }) {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(45);
  const [difficulty, setDifficulty] = useState('medium');
  const [company, setCompany] = useState('faang');
  const [role, setRole] = useState('Data Engineer');
  
  // Profile state for candidate lobby
  const [candidateName, setCandidateName] = useState(user?.name || '');

  const handleStart = () => {
    navigate(`/interview/permissions?duration=${duration}&difficulty=${difficulty}&company=${company}&role=${encodeURIComponent(role)}&name=${encodeURIComponent(candidateName)}`);
  };

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-bg text-text flex flex-col page-enter">
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

      <div className="py-12 px-8 bg-gradient-to-b from-surface to-bg border-b border-border flex flex-col items-center text-center">
        <div className="px-4 py-1 rounded-full bg-error/10 border border-error/20 text-[11px] font-bold text-error tracking-widest mb-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <ShieldCheck size={12} className="inline mr-1 -mt-0.5" />
          ZERO-TOLERANCE PROCTORING ENABLED
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-text leading-[1.1] tracking-[-1px] mb-4 max-w-[800px]">
          Enterprise Interview Lobby
        </h1>
        <p className="text-lg text-text-secondary max-w-[600px] leading-[1.6]">
          Configure your mock technical screen. You will enter a strictly proctored environment simulating a top-tier tech company interview.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Configuration */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          {/* Candidate Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User size={20} className="text-primary" />
              <h2 className="text-xl font-bold">Candidate Profile</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-secondary">Full Name</label>
                <input 
                  type="text" 
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="px-4 py-3 bg-surface border border-border rounded-xl text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-secondary">Target Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="px-4 py-3 bg-surface border border-border rounded-xl text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                >
                  <option value="Data Engineer">Data Engineer</option>
                  <option value="Backend Engineer">Backend Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Analytics Engineer">Analytics Engineer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Target Company */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={20} className="text-primary" />
              <h2 className="text-xl font-bold">Target Company Style</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {COMPANIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCompany(c.id)}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer ${
                    company === c.id
                      ? 'border-primary bg-primary/10 text-text shadow-sm'
                      : 'border-border bg-surface hover:bg-surface-2 text-text-secondary'
                  }`}
                >
                  <span className="text-xl">{c.logo}</span>
                  <span className="text-left">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart size={20} className="text-primary" />
              <h2 className="text-xl font-bold">Interview Level</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer ${
                    difficulty === d.value
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border bg-surface hover:bg-surface-2 text-text-secondary'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Limit */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={20} className="text-primary" />
              <h2 className="text-xl font-bold">Session Duration</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer ${
                    duration === d.value
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border bg-surface hover:bg-surface-2 text-text-secondary'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="lg:border-l lg:border-border lg:pl-10 flex flex-col gap-6">
          <div className="bg-surface-2 rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <FileText size={18} className="text-text-secondary" />
              Session Summary
            </h3>
            
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-text-secondary">Candidate</span>
                <span className="font-semibold text-text truncate max-w-[150px]">{candidateName || 'Anonymous'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-text-secondary">Role</span>
                <span className="font-semibold text-text">{role}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-text-secondary">Level</span>
                <span className="font-semibold text-text">{DIFFICULTIES.find(d => d.value === difficulty)?.label}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-text-secondary">Duration</span>
                <span className="font-semibold text-text">{duration} mins</span>
              </div>
            </div>
          </div>

          <div className="bg-error/5 border border-error/20 rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-error">
              <AlertTriangle size={18} />
              <h4 className="font-bold text-sm">Strict Zero-Tolerance Policy</h4>
            </div>
            <ul className="text-xs text-error/80 list-disc ml-4 space-y-1.5 leading-relaxed font-medium">
              <li>Full-screen mode will be strictly enforced.</li>
              <li>Leaving the tab or pressing ESC instantly terminates the interview (Score: 0).</li>
              <li>Copy/Paste and context menus are disabled.</li>
              <li>Camera, Screen, and Microphone must remain active.</li>
            </ul>
          </div>

          <Button 
            size="xl" 
            variant="primary" 
            onClick={handleStart} 
            className="w-full text-base py-5 shadow-lg shadow-primary/20 mt-auto"
            disabled={!candidateName.trim()}
          >
            <ShieldCheck size={18} />
            Continue to Setup
          </Button>
          {!candidateName.trim() && (
            <p className="text-xs text-center text-error mt-2">Please enter your name to continue.</p>
          )}
        </div>

      </div>
    </div>
  );
}
