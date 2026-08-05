import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  BookOpen, Target, Play, ArrowRight, Briefcase, Zap, Bot,
  Database, Trophy, CheckCircle, Clock, BarChart3, Upload,
  ChevronRight, Layers, TrendingUp, Building2, Terminal, Code,
  Code2, Link2, Sparkles, LayoutTemplate, ShieldAlert, Star,
  Users, Activity, Lock, Cpu, Globe, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Header } from '@/shared/ui/Header';
import { DailyChallengeWidget } from '@/features/gamification/DailyChallengeWidget';
import { DB_INFO } from '@/data/schemas';
import { allQuestions, getQuestionsForDb } from '@/data/index';
import { useAuth } from '@/stores/useAuthStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { useGamificationStore } from '@/stores/useGamificationStore';

const DB_NAMES = Object.keys(DB_INFO);

// --- Sub-Components ---

const HeroSection = ({ onShowInterview, navigate }) => (
  <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center overflow-hidden px-6 pt-32 pb-16 bg-bg border-b border-border">
    {/* Background gradients */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
      <div className="absolute w-[800px] h-[600px] bg-blue-500/15 rounded-full blur-[120px] opacity-60 animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute w-[600px] h-[400px] bg-purple-500/15 rounded-full blur-[100px] translate-y-20 translate-x-32 opacity-60" />
    </div>

    <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-surface-2 border border-border shadow-sm text-xs font-bold uppercase tracking-widest text-primary animate-fade-in-up">
        <Sparkles size={14} /> The Ultimate SQL Mastery Platform
      </div>
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-text leading-[1.1] mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        Master SQL.<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary bg-300% animate-gradient">
          Crack FAANG Interviews.
        </span>
      </h1>
      <p className="text-text-secondary text-lg md:text-xl max-w-2xl mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        Practice on real-world datasets with a zero-latency WASM SQLite engine. Get instant AI feedback, visualize execution plans, and ace your next data engineering interview.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <Button className="h-14 px-8 text-lg rounded-2xl hero-btn-primary shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all" onClick={() => navigate('/practice/airlines')}>
          <Play size={18} fill="currentColor" className="mr-2" /> Start Practicing
        </Button>
        <Button variant="outline" className="h-14 px-8 text-lg rounded-2xl bg-surface/50 backdrop-blur border-border hover:bg-surface-2 transition-all group" onClick={onShowInterview}>
          <Briefcase size={18} className="mr-2 text-muted group-hover:text-text transition-colors" /> Mock Interview Mode
        </Button>
      </div>
    </div>

    {/* App Preview Mockup */}
    <div className="relative w-full max-w-5xl mx-auto mt-20 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
      <div 
        className="rounded-t-3xl border border-slate-200/80 dark:border-border border-b-0 bg-slate-50 dark:bg-surface overflow-hidden aspect-[16/9] md:aspect-[21/9] flex flex-col relative"
        style={{ WebkitMaskImage: 'linear-gradient(to top, transparent, black 35%)', maskImage: 'linear-gradient(to top, transparent, black 35%)' }}
      >
        <div className="h-10 bg-slate-100/50 dark:bg-surface-2 border-b border-slate-200/80 dark:border-border flex items-center px-4 gap-2 backdrop-blur-md">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm border border-black/10 dark:border-transparent" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm border border-black/10 dark:border-transparent" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm border border-black/10 dark:border-transparent" />
        </div>
        <div className="flex-1 p-6 flex gap-6 bg-slate-50 dark:bg-transparent">
          <div className="w-1/4 bg-white dark:bg-bg rounded-xl border border-slate-200 dark:border-border p-4 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:hidden" />
            <ShimmerLine className="h-4 w-24 bg-slate-200 dark:bg-border rounded" delay="0ms" />
            <ShimmerLine className="h-3 w-full bg-slate-100 dark:bg-border/50 rounded" delay="100ms" />
            <ShimmerLine className="h-3 w-3/4 bg-slate-100 dark:bg-border/50 rounded" delay="200ms" />
            <ShimmerLine className="h-3 w-5/6 bg-slate-100 dark:bg-border/50 rounded mt-4" delay="300ms" />
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex-1 bg-white dark:bg-bg rounded-xl border border-slate-200 dark:border-border shadow-sm p-5 flex flex-col gap-2 font-mono text-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-100 to-transparent dark:hidden" />
              <div><span className="text-blue-600 dark:text-primary font-semibold">SELECT</span> <span className="text-slate-700 dark:text-text">user_id,</span> <span className="text-emerald-600 dark:text-success font-semibold">SUM</span><span className="text-slate-700 dark:text-text">(amount)</span></div>
              <div><span className="text-blue-600 dark:text-primary font-semibold">FROM</span> <span className="text-slate-700 dark:text-text">transactions</span></div>
              <div><span className="text-blue-600 dark:text-primary font-semibold">GROUP BY</span> <span className="text-slate-700 dark:text-text">user_id</span></div>
              <div><span className="text-blue-600 dark:text-primary font-semibold">HAVING</span> <span className="text-emerald-600 dark:text-success font-semibold">SUM</span><span className="text-slate-700 dark:text-text">(amount) {'>'}</span> <span className="text-amber-600 dark:text-warning font-semibold">1000</span><span className="text-slate-700 dark:text-text">;</span></div>
            </div>
            <div className="h-32 bg-white dark:bg-bg rounded-xl border border-slate-200 dark:border-border shadow-sm p-4 flex flex-col justify-center items-center gap-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:hidden" />
              <TablePlaceholder />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const ShimmerLine = ({ className, delay }) => (
  <div className={`relative overflow-hidden ${className}`} style={{ animationDelay: delay }}>
    <div 
      className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" 
      style={{ animationDelay: delay }}
    />
  </div>
);

const TablePlaceholder = () => (
  <div className="w-full flex flex-col gap-2">
    <div className="flex gap-2 border-b border-slate-200 dark:border-border pb-2">
      <ShimmerLine className="h-3 w-1/4 bg-slate-200 dark:bg-border rounded" delay="0ms" />
      <ShimmerLine className="h-3 w-1/4 bg-slate-200 dark:bg-border rounded" delay="100ms" />
      <ShimmerLine className="h-3 w-1/4 bg-slate-200 dark:bg-border rounded" delay="200ms" />
    </div>
    <div className="flex gap-2 opacity-80 mt-1">
      <ShimmerLine className="h-3 w-1/4 bg-slate-100 dark:bg-border/50 rounded" delay="300ms" />
      <ShimmerLine className="h-3 w-1/4 bg-slate-100 dark:bg-border/50 rounded" delay="400ms" />
      <ShimmerLine className="h-3 w-1/4 bg-slate-100 dark:bg-border/50 rounded" delay="500ms" />
    </div>
    <div className="flex gap-2 opacity-60">
      <ShimmerLine className="h-3 w-1/4 bg-slate-100 dark:bg-border/50 rounded" delay="600ms" />
      <ShimmerLine className="h-3 w-1/4 bg-slate-100 dark:bg-border/50 rounded" delay="700ms" />
      <ShimmerLine className="h-3 w-1/4 bg-slate-100 dark:bg-border/50 rounded" delay="800ms" />
    </div>
  </div>
);

const StatsBanner = () => (
  <div className="border-y border-border bg-slate-50 dark:bg-bg py-8 overflow-hidden relative">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-12 text-text-secondary font-semibold">
      <span className="text-sm tracking-widest uppercase">Trusted by engineers at top companies</span>
      <div className="flex flex-wrap justify-center items-center gap-8 opacity-80 grayscale">
        {/* Placeholder Logos */}
        <div className="flex items-center gap-2"><Globe size={20} /> Microsoft</div>
        <div className="flex items-center gap-2"><Cpu size={20} /> Databricks</div>
        <div className="flex items-center gap-2"><Lock size={20} /> Stripe</div>
        <div className="flex items-center gap-2"><Activity size={20} /> Meta</div>
      </div>
    </div>
  </div>
);

const FeatureBentoGrid = () => (
  <section className="py-24 px-6 max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-text">Everything you need to master SQL</h2>
      <p className="text-text-secondary text-lg max-w-2xl mx-auto">Say goodbye to slow, clunky server-side execution. Welcome to the future of browser-based data engineering practice.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
      
      {/* Bento 1: Zero Latency WASM */}
      <div className="md:col-span-2 relative rounded-3xl bg-surface border border-border p-8 overflow-hidden group hover:border-blue-400/50 transition-colors shadow-sm hover:shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors duration-500" />
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <Zap size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Zero-Latency Execution</h3>
            <p className="text-text-secondary max-w-sm leading-relaxed">Powered by WASM SQLite. Queries run directly in your browser. No server round-trips, no waiting. Instant feedback.</p>
          </div>
          <div className="font-mono text-xs text-primary/80 bg-bg p-4 rounded-xl border border-border/50 max-w-md w-full">
            <div className="flex justify-between border-b border-border/50 pb-2 mb-2"><span>Execution time</span><span className="font-bold text-success">1.2ms</span></div>
            <div className="flex justify-between border-b border-border/50 pb-2 mb-2"><span>Rows processed</span><span className="font-bold">50,000+</span></div>
            <div className="flex justify-between"><span>Network requests</span><span className="font-bold text-success">0</span></div>
          </div>
        </div>
      </div>

      {/* Bento 2: AI Tutor */}
      <div className="relative rounded-3xl bg-surface border border-border p-8 overflow-hidden group hover:border-purple-400/50 transition-colors shadow-sm hover:shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6">
              <Bot size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-2">AI Principal Engineer</h3>
            <p className="text-text-secondary leading-relaxed">Get instant code reviews, hints, and optimal solutions explained line-by-line.</p>
          </div>
          <div className="bg-bg rounded-xl border border-border p-4 relative overflow-hidden">
             <div className="text-xs text-text-secondary mb-1">Feedback</div>
             <div className="text-sm font-medium">Consider using a <span className="text-blue-400">CTE</span> instead of a subquery for better readability.</div>
          </div>
        </div>
      </div>

      {/* Bento 3: Visualizer */}
      <div className="relative rounded-3xl bg-surface border border-border p-8 overflow-hidden group hover:border-warning/50 transition-colors shadow-sm hover:shadow-md">
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-warning/10 rounded-full blur-[60px] translate-y-1/2 translate-x-1/4 group-hover:bg-warning/20 transition-colors duration-500" />
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center mb-6">
              <LayoutTemplate size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Execution Visualizer</h3>
            <p className="text-text-secondary leading-relaxed">Understand how the database engine evaluates your query under the hood.</p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-bg rounded-lg border border-warning/20 p-2 text-[10px] text-center text-text-secondary">FROM</div>
            <div className="flex-1 bg-bg rounded-lg border border-warning/20 p-2 text-[10px] text-center text-text-secondary">WHERE</div>
            <div className="flex-1 bg-bg rounded-lg border border-warning/20 p-2 text-[10px] text-center text-warning font-bold">SELECT</div>
          </div>
        </div>
      </div>

      {/* Bento 4: Datasets */}
      <div className="md:col-span-2 relative rounded-3xl bg-surface border border-border p-8 overflow-hidden group hover:border-success/50 transition-colors shadow-sm hover:shadow-md">
        <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
          <Database size={240} className="text-success translate-x-1/4 translate-y-1/4" />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center mb-6">
              <Layers size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-2">10+ Real-World Datasets</h3>
            <p className="text-text-secondary max-w-md leading-relaxed">Practice on massive schemas from E-Commerce, Healthcare, Airlines, and more. Or upload your own custom SQLite database instantly.</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
             {['Airlines', 'E-Commerce', 'Healthcare', 'Fintech', 'Social Media'].map(tag => (
               <div key={tag} className="px-3 py-1.5 bg-bg border border-border rounded-lg text-xs font-semibold text-text-secondary">{tag}</div>
             ))}
          </div>
        </div>
      </div>

    </div>
  </section>
);

const InterviewShowcase = ({ onShowInterview }) => (
  <section className="py-24 bg-bg border-y border-border overflow-hidden relative">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-error/10 rounded-full blur-[120px] pointer-events-none" />
    
    <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
      <div className="flex-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-error/10 border border-error/20 text-xs font-bold uppercase tracking-widest text-error">
          <ShieldAlert size={14} /> Proctored Mode
        </div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 text-text">Experience a Real FAANG Interview</h2>
        <p className="text-text-secondary text-lg mb-8 leading-relaxed">
          Step into our Proctored Interview Arena. A ticking clock, locked-down environment, and dynamically generated real-world business problems. Receive a detailed PDF scorecard when you finish.
        </p>
        <ul className="space-y-4 mb-8">
          {[
            'Strict time limits (15-60 mins)',
            'No AI hints or autocomplete',
            'Full PDF evaluation report',
            'Dynamic schema scenarios'
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-text font-medium" style={{ animationDelay: `${i * 100}ms` }}>
              <CheckCircle size={18} className="text-error" /> {item}
            </li>
          ))}
        </ul>
        <Button className="h-12 px-8 rounded-xl bg-error text-white hover:bg-error/90 border-none shadow-lg shadow-error/20" onClick={onShowInterview}>
          Enter Arena <ArrowUpRight size={16} className="ml-2" />
        </Button>
      </div>

      <div className="flex-1 w-full relative">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-2xl relative z-10 rotate-2 hover:rotate-0 transition-transform duration-500">
           <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
             <div className="font-black text-xl text-text">Google INTERVIEW</div>
             <div className="text-error font-mono font-bold animate-pulse">44:12</div>
           </div>
           <div className="space-y-3 opacity-60">
             <div className="h-4 w-full bg-surface-3 rounded" />
             <div className="h-4 w-5/6 bg-surface-3 rounded" />
             <div className="h-4 w-4/6 bg-surface-3 rounded" />
           </div>
           <div className="mt-8 border border-border bg-bg p-4 rounded-xl font-mono text-sm text-text-secondary">
             -- Write your optimal solution here...
           </div>
        </div>
      </div>
    </div>
  </section>
);

const GamificationPreview = () => (
  <section className="py-24 px-6 max-w-7xl mx-auto">
    <div className="flex flex-col md:flex-row items-center gap-12 bg-gradient-to-br from-surface to-surface-2 border border-border rounded-3xl p-8 md:p-12 shadow-lg hover:shadow-xl hover:border-blue-400/30 transition-all">
       <div className="flex-1">
         <h2 className="text-3xl md:text-4xl font-black mb-4 text-text">Learn. Earn. Level Up.</h2>
         <p className="text-text-secondary text-lg mb-8 leading-relaxed">
           Stay motivated with our engaging progress system. Complete daily challenges to maintain your streak, earn XP for solving complex queries, and unlock exclusive badges.
         </p>
         <div className="flex flex-wrap items-center gap-8">
           <div className="text-center group">
             <div className="text-3xl font-black text-primary mb-1 group-hover:scale-110 transition-transform">12</div>
             <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Day Streak</div>
           </div>
           <div className="w-px h-10 bg-border hidden sm:block" />
           <div className="text-center group">
             <div className="text-3xl font-black text-warning mb-1 group-hover:scale-110 transition-transform">450</div>
             <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Total XP</div>
           </div>
           <div className="w-px h-10 bg-border hidden sm:block" />
           <div className="text-center group">
             <div className="text-3xl font-black text-success mb-1 group-hover:scale-110 transition-transform">8</div>
             <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Badges</div>
           </div>
         </div>
       </div>
       <div className="flex-1 w-full grid grid-cols-2 gap-4">
         <div className="bg-bg border border-border p-6 rounded-2xl flex flex-col items-center text-center hover:border-warning/50 transition-colors">
           <Trophy size={32} className="text-warning mb-3 drop-shadow-md" />
           <div className="font-bold text-text mb-1">SQL Novice</div>
           <div className="text-xs text-text-secondary">Solve 10 Easy Queries</div>
         </div>
         <div className="bg-bg border border-border p-6 rounded-2xl flex flex-col items-center text-center hover:border-primary/50 transition-colors">
           <Zap size={32} className="text-primary mb-3 drop-shadow-md" />
           <div className="font-bold text-text mb-1">Speed Demon</div>
           <div className="text-xs text-text-secondary">Under 1ms Execution</div>
         </div>
       </div>
    </div>
  </section>
);

const DatabaseGrid = ({ navigate, progress, totalComplete }) => (
  <section className="py-24 bg-surface-2 border-t border-border">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-text">Explore Datasets</h2>
          <p className="text-text-secondary text-lg">Pick a domain and start mastering its schema.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-xl border border-border shadow-sm">
           <Target size={16} className="text-primary" />
           <span className="font-bold text-sm text-text">{allQuestions.length - totalComplete} Questions Remaining</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DB_NAMES.map((db) => {
          const info = DB_INFO[db];
          const dbQs = getQuestionsForDb(db);
          const completed = dbQs.filter((q) => progress[q.id] === 'complete').length;
          const pct = Math.round((completed / info.questionCount) * 100);
          
          return (
            <div
              key={db}
              onClick={() => navigate('/practice/' + db)}
              className="group cursor-pointer bg-bg border border-border rounded-3xl p-6 hover:border-blue-400/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full group-hover:bg-blue-500/10 transition-colors" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Database size={24} className="text-primary" />
                </div>
                <div className={`text-xl font-black tracking-tighter ${pct === 100 ? 'text-success' : 'text-text-secondary'}`}>{pct}%</div>
              </div>
              
              <h3 className="text-2xl font-bold mb-2 relative z-10 text-text">{info.label}</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6 flex-1 relative z-10 line-clamp-2">{info.description}</p>
              
              <div className="flex items-center justify-between text-[10px] font-bold text-text-secondary uppercase tracking-widest relative z-10">
                <span>{info.tableCount} Tables</span>
                <span>{completed} / {info.questionCount} Solved</span>
              </div>
              
              <div className="w-full h-1.5 bg-surface-2 rounded-full mt-4 overflow-hidden relative z-10">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Dataset CTA */}
      <div 
        onClick={() => navigate('/sandbox')}
        className="mt-12 group cursor-pointer bg-gradient-to-r from-blue-500/5 to-transparent border border-blue-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between hover:border-blue-500/50 transition-colors shadow-sm hover:shadow-md"
      >
        <div className="flex items-center gap-6 mb-6 md:mb-0">
          <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg flex-shrink-0">
            <Upload size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-1 flex items-center gap-3 text-text">
              Custom Sandbox <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] uppercase tracking-widest rounded">New</span>
            </h3>
            <p className="text-text-secondary">Upload your own SQLite or CSV files and practice locally.</p>
          </div>
        </div>
        <Button variant="secondary" className="group-hover:bg-primary group-hover:text-bg transition-colors flex-shrink-0 border-primary/20 text-primary hover:border-transparent">
          Upload Dataset <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  </section>
);

const Footer = ({ navigate }) => (
  <footer className="border-t border-border bg-bg pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <Terminal size={24} className="text-primary" />
          <span className="text-xl font-black tracking-tight text-text">DataDesk</span>
        </div>
        <p className="text-text-secondary text-sm max-w-sm leading-relaxed mb-6">
          The ultimate SQL practice platform. Master database queries directly in your browser with zero latency.
        </p>
        <div className="text-xs text-muted font-mono">
          Powered by WASM SQLite & React.
        </div>
      </div>
      <div>
        <h4 className="font-bold mb-4 text-text">Product</h4>
        <ul className="space-y-3 text-sm text-text-secondary">
          <li><button onClick={() => navigate('/practice/airlines')} className="hover:text-primary transition-colors">Practice</button></li>
          <li><button onClick={() => navigate('/sandbox')} className="hover:text-primary transition-colors">Sandbox</button></li>
          <li><button onClick={() => navigate('/leaderboard')} className="hover:text-primary transition-colors">Leaderboard</button></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-4 text-text">Resources</h4>
        <ul className="space-y-3 text-sm text-text-secondary">
          <li><button onClick={() => navigate('/guide')} className="hover:text-primary transition-colors">Documentation</button></li>
          <li><button onClick={() => navigate('/companies')} className="hover:text-primary transition-colors">Company Prep</button></li>
          <li><a href="https://github.com/Het2518/SQL_Practice" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">GitHub</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-4 text-text">Legal</h4>
        <ul className="space-y-3 text-sm text-text-secondary">
          <li><button onClick={() => navigate('/privacy')} className="hover:text-primary transition-colors">Privacy Policy</button></li>
          <li><button onClick={() => navigate('/terms')} className="hover:text-primary transition-colors">Terms of Service</button></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-6 border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted">
      <p>© {new Date().getFullYear()} DataDesk. All rights reserved.</p>
      <div className="flex gap-4 mt-4 md:mt-0">
        <button onClick={() => navigate('/privacy')} className="hover:text-text transition-colors">Privacy Policy</button>
        <button onClick={() => navigate('/terms')} className="hover:text-text transition-colors">Terms of Service</button>
      </div>
    </div>
  </footer>
);

// --- Main Page Component ---

export function DbSelector({ onShowAuth, onShowSettings, onShowInterview }) {
  const navigate = useNavigate();
  const { progress } = useProgressStore();
  
  const totalComplete = Object.values(progress).filter((s) => s === 'complete').length;
  const totalAttempted = Object.values(progress).filter((s) => s === 'attempted').length;
  const totalPct = Math.round(((totalComplete + totalAttempted * 0.5) / allQuestions.length) * 100);

  return (
    <div className="relative flex-1 w-full h-full overflow-y-auto bg-bg text-text page-enter">
      <Helmet>
        <title>DataDesk | Master SQL & Crack FAANG Interviews</title>
        <meta name="description" content="The ultimate in-browser SQL practice platform. Master JOINs, Window Functions, and CTEs with a local SQLite sandbox." />
        <link rel="canonical" href="https://sql-practice-sepia.vercel.app/" />
      </Helmet>

      {/* Progress Strip */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-transparent z-[60]">
        <div className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_var(--primary)]" style={{ width: `${totalPct}%` }} />
      </div>

      <Header
        onShowAuth={onShowAuth}
        onShowSettings={onShowSettings}
        navLinks={[
          { label: 'Documentation', onClick: () => navigate('/guide') },
          { label: 'Sandbox', onClick: () => navigate('/sandbox'), primary: true },
        ]}
      />

      <HeroSection onShowInterview={onShowInterview} navigate={navigate} />
      <StatsBanner />
      
      <div className="max-w-7xl mx-auto px-6 mt-16 mb-8">
        <DailyChallengeWidget progress={progress} />
      </div>

      <FeatureBentoGrid />
      <GamificationPreview />
      <InterviewShowcase onShowInterview={onShowInterview} />
      <DatabaseGrid navigate={navigate} progress={progress} totalComplete={totalComplete} />
      <Footer navigate={navigate} />

    </div>
  );
}
