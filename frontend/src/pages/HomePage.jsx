import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Sun,
  Moon,
  BookOpen,
  Settings as SettingsIcon,
  User,
  Database,
  Play,
  ArrowRight,
  Trophy,
  CheckCircle,
  Clock,
  BarChart3,
  Briefcase,
  Upload,
  ChevronRight,
  Layers,
  Target,
  Zap,
  TrendingUp,
  Building2,
  Terminal,
  Code,
  Code2,
  Link2,
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Header } from '@/shared/ui/Header';
import { DailyChallengeWidget } from '@/features/gamification/DailyChallengeWidget';
import { DB_INFO } from '@/data/schemas';
import { allQuestions, getQuestionsForDb } from '@/data/index';
import { useAuth } from '@/hooks/useAuth';
import { useProgressStore } from '@/stores/useProgressStore';
import { useGamificationStore } from '@/stores/useGamificationStore';

const DB_NAMES = Object.keys(DB_INFO);

export function DbSelector({ onShowAuth, onShowSettings, onShowInterview }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress } = useProgressStore();
  const { gameState } = useGamificationStore();
  const totalComplete = Object.values(progress).filter((s) => s === 'complete').length;
  const totalAttempted = Object.values(progress).filter((s) => s === 'attempted').length;
  const totalPct = Math.round(((totalComplete + totalAttempted * 0.5) / allQuestions.length) * 100);

  const score = useMemo(() => {
    let s = 0;
    Object.keys(progress).forEach((qId) => {
      if (progress[qId] === 'complete') {
        const q = allQuestions.find((x) => String(x.id) === String(qId));
        if (q) {
          if (q.difficulty === 'easy') s += 10;
          else if (q.difficulty === 'medium') s += 30;
          else if (q.difficulty === 'hard') s += 50;
        }
      }
    });
    return s;
  }, [progress]);

  const badges = (gameState?.badges ?? []).length;

  return (
    <div className="relative flex-1 w-full h-full overflow-y-auto bg-bg text-text pb-20 page-enter">
      <Helmet>
        <title>DataDesk | Practice SQL & Prepare for Interviews</title>
        <meta name="description" content="Master SQL with real-world databases. Interactive practice environment for JOINs, CTEs, and Window Functions." />
      </Helmet>
      {/* ── Global Header ── */}
      <Header
        onShowAuth={onShowAuth}
        onShowSettings={onShowSettings}
        navLinks={[
          { label: 'Docs', onClick: () => navigate('/guide') },
          { label: 'Interviews', onClick: () => onShowInterview(), primary: true },
        ]}
      />

      {/* ── Progress Strip ── */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-surface-2 z-50">
        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${totalPct}%` }} />
      </div>

      {/* ── Hero ── */}
      <section className="relative px-6 pt-16 pb-12 overflow-hidden flex flex-col items-center text-center border-b border-border bg-surface">
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-1.5 px-3 py-1 mb-6 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
            <Target size={12} /> SQL Interview Practice
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text leading-tight mb-4">
            Master SQL with
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Real-World Data</span>
          </h1>

          <p className="text-text-secondary text-base md:text-lg max-w-xl mb-8 leading-relaxed">
            10 hand-crafted databases. {allQuestions.length}+ progressive questions. Practice JOINs,
            Window Functions, CTEs and more — exactly the SQL that gets asked at FAANG and top tech
            companies.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              className="hero-btn-primary"
              size="lg"
              onClick={() => navigate('/practice/airlines')}
            >
              <Play size={15} strokeWidth={2.5} fill="currentColor" />
              Start Practicing
              <ArrowRight size={15} strokeWidth={2} />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => onShowInterview()}>
              <Briefcase size={15} /> Interview Mode
            </Button>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl z-10 px-6">
          <div className="flex items-center gap-4 px-6 py-4 bg-bg border border-border rounded-xl shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg border border-success/20 text-success bg-success-muted">
              <TrendingUp size={22} />
            </div>
            <div className="text-left">
              <div className="text-2xl font-black tabular-nums tracking-tight text-success">
                {totalComplete}
              </div>
              <div className="text-xs font-semibold text-text-secondary uppercase tracking-widest mt-0.5">Solved</div>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4 bg-bg border border-border rounded-xl shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg border border-warning/20 text-warning bg-warning-muted">
              <BookOpen size={22} />
            </div>
            <div className="text-left">
              <div className="text-2xl font-black tabular-nums tracking-tight text-warning">
                {totalAttempted}
              </div>
              <div className="text-xs font-semibold text-text-secondary uppercase tracking-widest mt-0.5">In Progress</div>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4 bg-bg border border-border rounded-xl shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg border border-primary/20 text-primary bg-primary-muted">
              <Target size={22} />
            </div>
            <div className="text-left">
              <div className="text-2xl font-black tabular-nums tracking-tight text-primary">
                {score.toLocaleString()}
              </div>
              <div className="text-xs font-semibold text-text-secondary uppercase tracking-widest mt-0.5">Score</div>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4 bg-bg border border-border rounded-xl shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg border border-primary/20 text-primary bg-primary-muted">
              <Building2 size={22} />
            </div>
            <div className="text-left">
              <div className="text-2xl font-black tabular-nums tracking-tight text-primary">
                {totalPct}%
              </div>
              <div className="text-xs font-semibold text-text-secondary uppercase tracking-widest mt-0.5">Complete</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[900px] mx-auto px-6">
        <DailyChallengeWidget progress={progress} />
      </div>

      {/* ── Custom Dataset Section ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 max-w-7xl mx-auto mt-12 mx-6 p-6 rounded-2xl bg-gradient-to-br from-surface to-surface-2 border border-border shadow-sm cursor-pointer transition-all hover:border-primary/50 hover:shadow-md group" onClick={() => navigate('/sandbox')}>
        <div className="w-12 h-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Upload size={20} color="var(--primary)" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-lg font-bold text-text mb-1">
            Custom Dataset Practice
            <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-primary text-bg rounded-md tracking-wider">NEW</span>
          </div>
          <div className="text-sm text-text-secondary leading-relaxed max-w-2xl">
            Upload any CSV or SQLite file and practice SQL on your own data — with schema-aware
            autocomplete and AI-generated questions.
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-bold text-primary mt-4 md:mt-0 transition-transform group-hover:translate-x-1">
          Upload &amp; Practice <ChevronRight size={14} strokeWidth={2.5} />
        </div>
      </div>

      {/* ── Database Grid Header ── */}
      <div className="flex items-center justify-between max-w-7xl mx-auto mt-12 mb-6 px-6">
        <div className="flex items-center gap-2.5">
          <Layers size={14} className="text-muted" />
          <span className="text-xs font-bold text-text-secondary uppercase tracking-[0.08em]">
            Built-in Databases
          </span>
          <span className="px-2 py-0.5 bg-surface-2 text-text text-xs font-bold rounded-md border border-border">{DB_NAMES.length}</span>
        </div>
        <span className="text-xs text-muted">
          {allQuestions.length - totalComplete} questions remaining
        </span>
      </div>

      {/* ── DB Cards ── */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-6">
        {DB_NAMES.map((db, i) => {
          const info = DB_INFO[db];
          const dbQs = getQuestionsForDb(db);
          const completed = dbQs.filter((q) => progress[q.id] === 'complete').length;
          const attempted = dbQs.filter((q) => progress[q.id] === 'attempted').length;
          const pct = Math.round((completed / info.questionCount) * 100);
          return (
            <button
              key={db}
              id={`db-card-${db}`}
              className="relative flex flex-col text-left bg-surface rounded-2xl border border-border shadow-sm overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md hover:border-border-hover group outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => navigate('/practice/' + db)}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                    <Database size={18} color="var(--primary)" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-base font-bold text-text truncate">{info.label}</span>
                    <span className="text-xs font-medium text-text-secondary">
                      {info.tableCount} tables · {info.questionCount} questions
                    </span>
                  </div>
                  <div className={`text-sm font-black tabular-nums transition-colors text-text-secondary ${pct === 100 ? 'text-success' : ''}`}>{pct}%</div>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-4 flex-1 line-clamp-2">{info.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {info.concepts.slice(0, 4).map((c) => (
                    <span key={c} className="px-2 py-1 bg-surface-2 text-text-secondary text-[10px] font-semibold uppercase tracking-wider rounded-md border border-border whitespace-nowrap">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 px-5 py-3 bg-surface-2 border-t border-border">
                <div className="flex-1 h-1.5 bg-bg rounded-full overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  {attempted > 0 && (
                    <div
                      className="absolute top-0 h-full bg-warning rounded-full transition-all duration-500 opacity-60"
                      style={{
                        width: `${Math.round((attempted / info.questionCount) * 100)}%`,
                        left: `${pct}%`,
                      }}
                    />
                  )}
                </div>
                <span className="text-xs font-bold text-text-secondary tabular-nums">
                  {completed}/{info.questionCount}
                </span>
              </div>
            </button>
          );
        })}
      </main>

      {/* ── Learn SQL Section ── */}
      <div className="max-w-7xl mx-auto mt-20 mb-12 px-6">
        <div className="flex items-center gap-2.5 mb-6">
          <BookOpen size={14} className="text-muted" />
          <span className="text-xs font-bold text-text-secondary uppercase tracking-[0.08em]">
            Learn SQL Step-by-Step
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: '1. Basic Filtering', desc: 'SELECT, WHERE, AND/OR', icon: Target },
            { title: '2. Aggregations', desc: 'GROUP BY, HAVING, SUM/AVG', icon: BarChart3 },
            { title: '3. Joining Data', desc: 'INNER, LEFT, RIGHT JOINs', icon: Link2 },
            { title: '4. Subqueries', desc: 'Nested queries, IN, EXISTS', icon: Code },
            { title: '5. Date & Time', desc: 'Date math, EXTRACT, Formatting', icon: Clock },
            { title: '6. Window Functions', desc: 'ROW_NUMBER, RANK, OVER', icon: Layers },
            { title: '7. CTEs', desc: 'WITH clause, readability', icon: Code2 },
            { title: '8. Advanced Topics', desc: 'Recursive CTEs, PIVOT', icon: Zap },
          ].map((topic, i) => (
            <div key={topic.title} className="bg-surface border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group" onClick={() => navigate('/practice/hospital')}>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors border border-primary/20">
                <topic.icon size={20} strokeWidth={2} fill="none" />
              </div>
              <h3 className="text-base font-bold text-text mb-1.5">{topic.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{topic.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* ── Why DataDesk Section ── */}
      <section className="border-t border-border mt-20 py-20 bg-surface-2">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-3xl font-extrabold text-text mb-4">Why practice on DataDesk?</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">We built the ultimate environment for mastering SQL, focusing on the concepts that actually matter in tech interviews.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Database size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Real-world Schema</h3>
            <p className="text-sm text-text-secondary">Practice on full-scale databases (E-commerce, Healthcare, Airlines) with realistic data complexity, not toy tables.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-success-muted flex items-center justify-center text-success mb-4 border border-success-light">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Instant Verification</h3>
            <p className="text-sm text-text-secondary">Our in-browser SQLite engine validates your answers instantly against verified solutions, highlighting precise diffs.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-warning-muted flex items-center justify-center text-warning mb-4 border border-warning-light">
              <Trophy size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Interview Ready</h3>
            <p className="text-sm text-text-secondary">Questions are sourced directly from FAANG data science and data engineering interviews, organized by difficulty.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
