import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  BarChart2,
  Briefcase,
  Upload,
  ChevronRight,
  Layers,
  Target,
  Zap,
  TrendingUp,
  Building2,
  Terminal,
  LineChart,
  Code,
  Code2,
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
    <div className="home-root page-enter">
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
      <div className="global-progress-bar">
        <div className="global-progress-fill" style={{ width: `${totalPct}%` }} />
      </div>

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="hero-glow-bg" />

        {/* Floating Background Icons */}
        <div className="floating-icon icon-1">
          <Database size={32} />
        </div>
        <div className="floating-icon icon-2">
          <Terminal size={32} />
        </div>
        <div className="floating-icon icon-3">
          <LineChart size={32} />
        </div>
        <div className="floating-icon icon-4">
          <Code2 size={32} />
        </div>
        <div className="floating-icon icon-5">
          <CheckCircle size={32} />
        </div>
        <div className="floating-icon icon-6">
          <Trophy size={32} />
        </div>

        <div className="home-hero-content">
          <div className="home-hero-badge">
            <Target size={12} /> SQL Interview Practice
          </div>

          <h1 className="home-hero-h1">
            Master SQL with
            <br />
            <span className="home-hero-accent">Real-World Data</span>
          </h1>

          <p className="home-hero-desc">
            10 hand-crafted databases. {allQuestions.length}+ progressive questions. Practice JOINs,
            Window Functions, CTEs and more — exactly the SQL that gets asked at FAANG and top tech
            companies.
          </p>

          <div className="hero-cta-row">
            <Button
              className="hero-btn-primary"
              size="lg"
              onClick={() => navigate('/practice/airlines')}
            >
              <Play size={15} strokeWidth={2.5} fill="currentColor" />
              Start Practicing
              <ArrowRight size={15} strokeWidth={2} />
            </Button>
            <Button className="hero-btn-secondary" size="lg" onClick={() => onShowInterview()}>
              <Briefcase size={15} /> Interview Mode
            </Button>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="hero-stats-row">
          <div className="hero-stat-card">
            <div
              className="hero-stat-icon-wrap"
              style={{
                color: 'var(--success)',
                background: 'var(--success-muted)',
                borderColor: 'var(--success-light)',
              }}
            >
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="hero-stat-value" style={{ color: 'var(--success)' }}>
                {totalComplete}
              </div>
              <div className="hero-stat-label">Solved</div>
            </div>
          </div>
          <div className="hero-stat-card">
            <div
              className="hero-stat-icon-wrap"
              style={{
                color: 'var(--warning)',
                background: 'var(--warning-muted)',
                borderColor: 'var(--warning-light)',
              }}
            >
              <BookOpen size={22} />
            </div>
            <div>
              <div className="hero-stat-value" style={{ color: 'var(--warning)' }}>
                {totalAttempted}
              </div>
              <div className="hero-stat-label">In Progress</div>
            </div>
          </div>
          <div className="hero-stat-card">
            <div
              className="hero-stat-icon-wrap"
              style={{
                color: 'var(--primary)',
                background: 'var(--primary-muted)',
                borderColor: 'var(--primary-light)',
              }}
            >
              <Target size={22} />
            </div>
            <div>
              <div className="hero-stat-value" style={{ color: 'var(--primary)' }}>
                {score.toLocaleString()}
              </div>
              <div className="hero-stat-label">Score</div>
            </div>
          </div>
          <div className="hero-stat-card">
            <div
              className="hero-stat-icon-wrap"
              style={{
                color: 'var(--primary)',
                background: 'var(--primary-muted)',
                borderColor: 'var(--primary-light)',
              }}
            >
              <Building2 size={22} />
            </div>
            <div>
              <div className="hero-stat-value" style={{ color: 'var(--primary)' }}>
                {totalPct}%
              </div>
              <div className="hero-stat-label">Complete</div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
        <DailyChallengeWidget progress={progress} />
      </div>

      {/* ── Custom Dataset Section ── */}
      <div className="custom-db-banner" onClick={() => navigate('/sandbox')}>
        <div className="custom-db-banner-icon">
          <Upload size={20} color="var(--primary)" strokeWidth={2} />
        </div>
        <div className="custom-db-banner-body">
          <div className="custom-db-banner-title">
            Custom Dataset Practice
            <span className="custom-db-banner-badge">NEW</span>
          </div>
          <div className="custom-db-banner-desc">
            Upload any CSV or SQLite file and practice SQL on your own data — with schema-aware
            autocomplete and AI-generated questions.
          </div>
        </div>
        <div className="custom-db-banner-action">
          Upload &amp; Practice <ChevronRight size={14} strokeWidth={2.5} />
        </div>
      </div>

      {/* ── Database Grid Header ── */}
      <div className="db-grid-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Layers size={14} color="var(--muted)" />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Built-in Databases
          </span>
          <span className="db-grid-pill">{DB_NAMES.length}</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          {allQuestions.length - totalComplete} questions remaining
        </span>
      </div>

      {/* ── DB Cards ── */}
      <main className="db-grid">
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
              className="db-card"
              onClick={() => navigate('/practice/' + db)}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="db-card-body">
                <div className="db-card-header">
                  <div className="db-card-icon-wrap">
                    <Database size={18} color="var(--primary)" strokeWidth={1.5} />
                  </div>
                  <div className="db-card-meta">
                    <span className="db-card-name">{info.label}</span>
                    <span className="db-card-count">
                      {info.tableCount} tables · {info.questionCount} questions
                    </span>
                  </div>
                  <div className={`db-card-pct${pct === 100 ? ' complete' : ''}`}>{pct}%</div>
                </div>
                <p className="db-card-desc">{info.description}</p>
                <div className="db-card-concepts">
                  {info.concepts.slice(0, 4).map((c) => (
                    <span key={c} className="tag">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="db-card-footer">
                <div className="db-progress-bar">
                  <div className="db-progress-fill" style={{ width: `${pct}%` }} />
                  {attempted > 0 && (
                    <div
                      className="db-progress-attempted"
                      style={{
                        width: `${Math.round((attempted / info.questionCount) * 100)}%`,
                        left: `${pct}%`,
                      }}
                    />
                  )}
                </div>
                <span className="db-progress-label">
                  {completed}/{info.questionCount}
                </span>
              </div>
            </button>
          );
        })}
      </main>
    </div>
  );
}
