import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, BarChart, ShieldCheck, AlertTriangle, Building2, User,
  Rocket, Landmark, Zap, Database, ArrowRight, GraduationCap,
  Briefcase, ShoppingBag, Sparkles, CheckCircle2, Target, Code2
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Header, HeaderBreadcrumbs } from '@/shared/ui/Header';
import { Button } from '@/shared/ui/Button';
import { useProctorStore } from './useProctorStore';

// ─── Experience Modes ────────────────────────────────────────────────────────
const MODES = [
  {
    id: 'learning',
    name: 'Beginner & Learning',
    badge: 'Beginner Friendly',
    badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    description: 'Friendly practice, guidance hints allowed, relaxed environment, no sudden disqualification.',
    icon: GraduationCap,
    accent: 'emerald',
  },
  {
    id: 'standard',
    name: 'Standard Technical Screen',
    badge: 'Balanced',
    badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    description: 'Realistic technical mock interview with structured timer and full AI scorecard evaluation.',
    icon: Briefcase,
    accent: 'blue',
  },
  {
    id: 'proctored',
    name: 'Strict FAANG Proctored',
    badge: 'Zero Tolerance',
    badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    description: 'Live webcam & screen verification, tab lock enforcement, and Hiring Committee audit report.',
    icon: ShieldCheck,
    accent: 'rose',
  },
];

// ─── Skill & Learning Levels ────────────────────────────────────────────────
const DIFFICULTIES = [
  {
    id: 'beginner',
    label: 'Beginner / Foundations',
    levelTag: 'SQL 101',
    description: 'SELECT, WHERE filters, basic AND/OR, COUNT/SUM/AVG, simple ORDER BY & LIMIT',
    topics: ['SELECT filtering', 'Basic Aggregates', 'Simple Aliases', 'SQL Syntax 101'],
    accentBorder: 'hover:border-emerald-500/40',
    activeBg: 'border-emerald-500 bg-emerald-500/10 text-emerald-500',
  },
  {
    id: 'intermediate',
    label: 'Intermediate / Applied',
    levelTag: 'Mid-Level',
    description: 'INNER & LEFT JOINs, GROUP BY, HAVING thresholds, CASE WHEN, Subqueries, Date math',
    topics: ['Multi-Table JOINs', 'HAVING Filters', 'CASE WHEN Logic', 'Subquery Lookups'],
    accentBorder: 'hover:border-blue-500/40',
    activeBg: 'border-blue-500 bg-blue-500/10 text-blue-500',
  },
  {
    id: 'senior',
    label: 'Senior / Production',
    levelTag: 'Senior L5',
    description: 'Window functions (RANK, DENSE_RANK, LEAD/LAG), Multi-table CTEs, Running Totals',
    topics: ['Window Ranking', 'CTEs & Pipelines', 'LAG/LEAD Analytics', 'Complex Aggregates'],
    accentBorder: 'hover:border-purple-500/40',
    activeBg: 'border-purple-500 bg-purple-500/10 text-purple-500',
  },
  {
    id: 'master',
    label: 'Master / Staff Architect',
    levelTag: 'Staff L6+',
    description: 'Complex Query Optimization, Gaps & Islands, Cohort Churn, Recursive CTEs',
    topics: ['Gaps & Islands', 'Cohort Retention', 'Recursive CTEs', 'Query Optimization'],
    accentBorder: 'hover:border-amber-500/40',
    activeBg: 'border-amber-500 bg-amber-500/10 text-amber-500',
  },
  {
    id: 'mixed',
    label: 'Adaptive FAANG Ladder',
    levelTag: 'L3 -> L6',
    description: 'Progressive warmup from Level 1 to Level 5 challenge across multi-table domains',
    topics: ['Progressive Difficulty', 'Multi-Domain', 'Full Assessment', 'FAANG Benchmark'],
    accentBorder: 'hover:border-primary/40',
    activeBg: 'border-primary bg-primary/10 text-primary',
  },
];

// ─── Target Companies / Industry Tracks ─────────────────────────────────────
const COMPANIES = [
  { id: 'faang', name: 'FAANG / Big Tech', sub: 'Meta, Google, Amazon', icon: Rocket, color: 'text-blue-500' },
  { id: 'fintech', name: 'FinTech & Payments', sub: 'Stripe, Plaid, PayPal', icon: Landmark, color: 'text-emerald-500' },
  { id: 'startup', name: 'Marketplaces & Apps', sub: 'Uber, Airbnb, DoorDash', icon: Zap, color: 'text-purple-500' },
  { id: 'data', name: 'Cloud & Data Platforms', sub: 'Databricks, Snowflake', icon: Database, color: 'text-amber-500' },
  { id: 'ecommerce', name: 'E-Commerce & Retail', sub: 'Shopify, Amazon Retail', icon: ShoppingBag, color: 'text-cyan-500' },
  { id: 'health', name: 'Enterprise & Health', sub: 'Epic, Salesforce, Workday', icon: Building2, color: 'text-rose-500' },
];

// ─── Core Focus Topics ──────────────────────────────────────────────────────
const FOCUS_TOPICS = [
  { id: 'all', label: '🎯 All-Round (Balanced)' },
  { id: 'joins', label: '🔗 Multi-Table JOINs' },
  { id: 'aggregations', label: '📊 Aggregations & GROUP BY' },
  { id: 'window', label: '🪟 Window Functions & Ranking' },
  { id: 'ctes', label: '🧩 CTEs & Complex Subqueries' },
  { id: 'performance', label: '⚡ Performance & Optimization' },
];

// ─── Roles ──────────────────────────────────────────────────────────────────
const ROLES = [
  'Data Engineer',
  'Data Analyst / BI',
  'Backend Engineer',
  'Junior Software Engineer',
  'Analytics Engineer',
  'Data Scientist / ML',
  'Full-Stack Developer',
  'Database Administrator (DBA)',
];

// ─── Session Durations ──────────────────────────────────────────────────────
const DURATIONS = [
  { label: '15 Min (Quick Practice)', value: 15 },
  { label: '30 Min (Screening)', value: 30 },
  { label: '45 Min (Standard Mock)', value: 45 },
  { label: '60 Min (Deep Dive)', value: 60 },
];

export function InterviewPage({ user, onShowAuth, onShowSettings }) {
  const navigate = useNavigate();

  // Primary configuration state
  const [mode, setMode]                 = useState('learning'); // 'learning' | 'standard' | 'proctored'
  const [difficulty, setDifficulty]     = useState('beginner'); // 'beginner' | 'intermediate' | 'senior' | 'master' | 'mixed'
  const [company, setCompany]           = useState('faang');
  const [role, setRole]                 = useState('Data Analyst / BI');
  const [focusTopic, setFocusTopic]     = useState('all');
  const [duration, setDuration]         = useState(30);
  const [candidateName, setCandidateName] = useState(user?.name || '');

  const { resetProctoring, clearSessionState } = useProctorStore();

  useEffect(() => {
    // Wipe any previous termination states or saved sessions when landing in the lobby
    resetProctoring();
    clearSessionState();
  }, [resetProctoring, clearSessionState]);

  const handleStart = () => {
    const params = new URLSearchParams({
      mode,
      difficulty,
      company,
      role,
      topic: focusTopic,
      duration: String(duration),
      name: candidateName.trim() || 'Candidate',
    });

    if (mode === 'learning') {
      // In learning mode, bypass strict hardware permissions and launch directly into the arena
      navigate(`/interview/arena?${params.toString()}&newSession=1`);
    } else {
      // Standard or Proctored mock: proceed through verification lobby
      navigate(`/interview/permissions?${params.toString()}`);
    }
  };

  const selectedDiffObj = DIFFICULTIES.find(d => d.id === difficulty) || DIFFICULTIES[0];
  const selectedModeObj = MODES.find(m => m.id === mode) || MODES[0];
  const selectedCompanyObj = COMPANIES.find(c => c.id === company) || COMPANIES[0];

  return (
    <div className="flex flex-col h-[100dvh] bg-bg overflow-hidden page-enter">
      <Helmet>
        <title>SQL Practice & Interview Arena | Beginner to Master | DataDesk</title>
        <meta
          name="description"
          content="Interactive SQL learning, practice exercises, and technical interview simulations from SQL 101 beginner to Staff Engineer master level."
        />
      </Helmet>

      <Header
        user={user}
        onShowAuth={onShowAuth}
        onShowSettings={onShowSettings}
        leftContent={
          <HeaderBreadcrumbs
            items={[{ label: 'Home', onClick: () => navigate('/') }, { label: 'Interview & Learning Lobby' }]}
          />
        }
      />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 w-full h-full">
        {/* ── LEFT PANEL: Dynamic Context Card ── */}
        <div className="hidden lg:flex lg:w-5/12 xl:w-4/12 bg-surface text-text p-10 xl:p-12 flex-col justify-between relative overflow-hidden border-r border-border">
          {/* Ambient background glow based on mode */}
          <div
            className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full blur-[120px] pointer-events-none transition-all duration-700 ${
              mode === 'learning'
                ? 'bg-emerald-500/10'
                : mode === 'standard'
                ? 'bg-blue-500/10'
                : 'bg-rose-500/10'
            }`}
          />

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${selectedModeObj.badgeColor}`}>
                <selectedModeObj.icon size={13} /> {selectedModeObj.name}
              </span>
            </div>

            <div>
              <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight text-text">
                SQL Learning & <br />
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
                  mode === 'learning'
                    ? 'from-emerald-400 to-teal-500'
                    : mode === 'standard'
                    ? 'from-blue-400 to-indigo-500'
                    : 'from-rose-500 to-orange-500'
                }`}>
                  {mode === 'learning' ? 'Interactive Practice' : 'Interview Arena'}
                </span>
              </h1>
              <p className="text-text-secondary text-sm mt-3 leading-relaxed">
                {mode === 'learning'
                  ? 'Master SQL from first principles to production mastery. Work through tailored problem sets with live SQLite execution and zero penalty for mistakes.'
                  : mode === 'standard'
                  ? 'Benchmark your technical abilities against realistic industry interview bars with timed questions and AI Hiring Committee scorecards.'
                  : 'Simulate high-stakes FAANG technical screens with active zero-tolerance proctoring, webcam analysis, and detailed evaluation.'}
              </p>
            </div>

            {/* Feature highlights tailored to mode */}
            <div className="space-y-4 pt-2">
              {mode === 'learning' ? (
                <>
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface-2 border border-border">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-500 font-bold">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-text">Beginner-Friendly Environment</h4>
                      <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                        Hints enabled, no proctored webcam lock, and instant query execution feedback.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface-2 border border-border">
                    <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0 text-teal-500 font-bold">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-text">Live SQLite WebAssembly</h4>
                      <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                        Real tables populated with authentic data. Queries execute directly inside your browser.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface-2 border border-border">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-500 font-bold">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-text">Calibrated to Real Hiring Bars</h4>
                      <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                        Industry-grade business scenarios tailored to {selectedCompanyObj.name}.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface-2 border border-border">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 text-orange-500 font-bold">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-text">
                        {mode === 'proctored' ? 'Strict Proctoring Active' : 'Timed Assessment Screen'}
                      </h4>
                      <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                        {mode === 'proctored'
                          ? 'Leaving the tab, pressing ESC, or pasting external code results in immediate disqualification.'
                          : 'Timed conditions to simulate actual technical phone screen pressure.'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Active selection summary preview */}
          <div className="relative z-10 pt-6 border-t border-border">
            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block mb-2">
              Curated Curriculum Blueprint
            </span>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                {selectedDiffObj.levelTag}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-surface-3 text-text-secondary border border-border">
                {selectedCompanyObj.name}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-surface-3 text-text-secondary border border-border">
                {role}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-surface-3 text-text-secondary border border-border">
                {FOCUS_TOPICS.find(t => t.id === focusTopic)?.label}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-2.5 line-clamp-2">
              {selectedDiffObj.description}
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL: Comprehensive Configurator ── */}
        <div className="flex-1 bg-bg flex flex-col relative overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-3xl mx-auto p-6 md:p-10 lg:p-12 flex flex-col gap-10 pb-36">

            {/* 1. EXPERIENCE MODE SELECTOR */}
            <section className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    1
                  </div>
                  <h2 className="text-lg font-bold text-text">Choose Practice Mode</h2>
                </div>
                <span className="text-xs text-text-secondary font-medium">Select your preferred learning style</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {MODES.map((m) => {
                  const isSelected = mode === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30'
                          : 'border-border bg-surface hover:border-primary/30 hover:bg-surface-2'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-text-secondary'
                          }`}>
                            <Icon size={16} />
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.badgeColor}`}>
                            {m.badge}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-text mb-1">{m.name}</h3>
                        <p className="text-xs text-text-secondary leading-relaxed">{m.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2. SKILL LEVEL (Beginner to Master) */}
            <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    2
                  </div>
                  <h2 className="text-lg font-bold text-text">Skill & Learning Level</h2>
                </div>
                <span className="text-xs text-text-secondary">From first query to staff architect</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {DIFFICULTIES.map((d) => {
                  const isSelected = difficulty === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficulty(d.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30'
                          : `border-border bg-surface ${d.accentBorder} hover:bg-surface-2`
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            isSelected ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-text-secondary'
                          }`}>
                            {d.levelTag}
                          </span>
                        </div>
                        <h3 className={`text-sm font-bold mb-1 ${isSelected ? 'text-primary' : 'text-text'}`}>
                          {d.label}
                        </h3>
                        <p className="text-xs text-text-secondary leading-relaxed mb-3">
                          {d.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-2 border-t border-border/60">
                        {d.topics.slice(0, 2).map((t) => (
                          <span key={t} className="text-[10px] font-semibold text-text-secondary bg-surface-2 px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 3. CANDIDATE & ROLE PROFILE */}
            <section className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    3
                  </div>
                  <h2 className="text-lg font-bold text-text">Candidate Profile & Target Role</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Full Name (for Scorecard)
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="px-4 py-3 bg-surface border border-border rounded-xl text-text font-medium text-sm shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Target Role Track
                  </label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text font-medium text-sm shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-text-secondary">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. COMPANY & INDUSTRY STYLE */}
            <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    4
                  </div>
                  <h2 className="text-lg font-bold text-text">Target Company & Industry Track</h2>
                </div>
                <span className="text-xs text-text-secondary">Tailors database schemas & scenarios</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {COMPANIES.map((c) => {
                  const isSelected = company === c.id;
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCompany(c.id)}
                      className={`flex items-start gap-3.5 p-3.5 rounded-xl border-2 transition-all duration-150 cursor-pointer text-left ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30'
                          : 'border-border bg-surface hover:border-primary/30 hover:bg-surface-2'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-text-secondary'
                      }`}>
                        <Icon size={18} className={isSelected ? '' : c.color} />
                      </div>
                      <div className="min-w-0">
                        <span className={`text-sm font-bold block truncate ${isSelected ? 'text-primary' : 'text-text'}`}>
                          {c.name}
                        </span>
                        <span className="text-xs text-text-secondary block truncate mt-0.5">
                          {c.sub}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 5. TOPIC FOCUS & DURATION */}
            <section className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    5
                  </div>
                  <h2 className="text-lg font-bold text-text">Topic Focus & Duration</h2>
                </div>
              </div>

              <div className="space-y-4">
                {/* Topic tags */}
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">
                    Primary Question Focus (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FOCUS_TOPICS.map((t) => {
                      const isSelected = focusTopic === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFocusTopic(t.id)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                              : 'border-border bg-surface text-text-secondary hover:text-text hover:border-border-hover hover:bg-surface-2'
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">
                    Time Allowance
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {DURATIONS.map((d) => {
                      const isSelected = duration === d.value;
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => setDuration(d.value)}
                          className={`py-2.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary border-primary shadow-sm'
                              : 'border-border bg-surface text-text-secondary hover:text-text hover:bg-surface-2'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sticky Action Footer */}
          <div className="sticky bottom-0 w-full bg-surface/90 backdrop-blur-xl border-t border-border p-4 md:px-10 flex items-center justify-between z-20 shadow-lg">
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
                Configuration Summary
              </span>
              <div className="text-xs sm:text-sm font-bold text-text flex items-center gap-1.5 flex-wrap">
                <span>{candidateName || 'Anonymous'}</span>
                <span className="text-border">•</span>
                <span className="text-primary">{selectedDiffObj.label}</span>
                <span className="text-border">•</span>
                <span>{selectedCompanyObj.name}</span>
                <span className="text-border">•</span>
                <span>{duration} mins</span>
                {mode === 'learning' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Learning Mode
                  </span>
                )}
              </div>
            </div>

            <div>
              <Button
                size="md"
                variant="primary"
                onClick={handleStart}
                className="px-6 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all rounded-xl"
              >
                {mode === 'learning' ? 'Start Learning Session' : 'Continue to Setup'}
                <ArrowRight size={16} className="ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
