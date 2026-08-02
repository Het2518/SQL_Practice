import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BarChart, ShieldCheck, PlayCircle, AlertTriangle } from 'lucide-react';
import { Header, HeaderBreadcrumbs } from '@/shared/ui/Header';
import { Button } from '@/shared/ui/Button';

const DURATIONS = [
  { label: '15 Minutes', value: 15 },
  { label: '30 Minutes', value: 30 },
  { label: '45 Minutes', value: 45 },
  { label: '60 Minutes', value: 60 },
];

const DIFFICULTIES = [
  { label: 'Mixed', value: 'mixed' },
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
];

export function InterviewPage({ user, onShowAuth, onShowSettings }) {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] = useState('mixed');

  const handleStart = () => {
    navigate(`/interview/permissions?duration=${duration}&difficulty=${difficulty}`);
  };

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-bg text-text flex flex-col page-enter">
      <Header
        user={user}
        onShowAuth={onShowAuth}
        onShowSettings={onShowSettings}
        leftContent={
          <HeaderBreadcrumbs
            items={[{ label: 'Home', onClick: () => navigate('/') }, { label: 'Mock Interview Setup' }]}
          />
        }
      />

      <div className="py-16 px-8 bg-gradient-to-b from-surface to-bg border-b border-border flex flex-col items-center text-center">
        <div
          className="px-4 py-1 rounded-full bg-primary-muted border border-primary-light text-[11px] font-bold text-primary tracking-widest mb-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
        >
          STRICT PROCTORING ENABLED
        </div>
        <h1 className="text-5xl font-black text-text leading-[1.1] tracking-[-1px] mb-4 max-w-[800px]">
          Proctored Mock Interview
        </h1>
        <p className="text-lg text-text-secondary max-w-[600px] leading-[1.6]">
          Configure your mock interview. Once started, you will enter a strictly proctored environment that prevents tab switching, copy-pasting, and requires full-screen mode.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 w-full flex flex-col gap-10">
        
        {/* Time Limit */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-primary" />
            <h2 className="text-xl font-bold">Time Limit</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Difficulty */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart size={20} className="text-primary" />
            <h2 className="text-xl font-bold">Difficulty Level</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Warnings */}
        <div className="bg-warning-muted border border-warning-light rounded-xl p-5 flex items-start gap-3 mt-4">
          <AlertTriangle className="text-warning shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-text mb-1">Before you begin</h4>
            <ul className="text-sm text-text-secondary list-disc ml-4 space-y-1">
              <li>You must grant Fullscreen permission.</li>
              <li>Leaving the tab or pressing Escape will trigger a <b>Zero-Tolerance</b> violation.</li>
              <li>Copy, paste, and context menus are completely disabled.</li>
              <li>There are no warnings. A single violation will instantly terminate your interview.</li>
            </ul>
          </div>
        </div>

        {/* Start Button */}
        <Button size="xl" variant="primary" onClick={handleStart} className="w-full mt-4 text-lg py-5 shadow-lg shadow-primary/20">
          <ShieldCheck size={20} />
          Enter Proctored Setup
        </Button>

      </div>
    </div>
  );
}
