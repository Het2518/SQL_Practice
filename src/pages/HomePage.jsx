import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun, Moon, BookOpen, Settings as SettingsIcon, User, Database,
  Play, ArrowRight, Trophy, CheckCircle, Clock, BarChart2,
  Briefcase, Upload, ChevronRight, Layers, Target, Zap, TrendingUp, Building2
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { DB_INFO } from '@/data/schemas';
import { allQuestions, getQuestionsForDb } from '@/data/index';

const DB_NAMES = Object.keys(DB_INFO);

export function DbSelector({ progress, gameState, user, onShowAuth, onShowSettings, onShowInterview, settings, onToggleDark }) {
  const navigate = useNavigate();
  const totalComplete  = Object.values(progress).filter(s => s === 'complete').length;
  const totalAttempted = Object.values(progress).filter(s => s === 'attempted').length;
  const totalPct = Math.round((totalComplete + totalAttempted * 0.5) / allQuestions.length * 100);

  const score = useMemo(() => {
    let s = 0;
    Object.keys(progress).forEach(qId => {
      if (progress[qId] === 'complete') {
        const q = allQuestions.find(x => String(x.id) === String(qId));
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

      {/* ── Sticky Navbar ── */}
      <header className="home-header">
        <div className="home-logo">
          <div className="home-logo-badge">
            <Database size={16} color="var(--primary)" strokeWidth={2.5} />
          </div>
          <div>
            <div className="home-title">DataDesk</div>
            <div className="home-subtitle">SQL Practice Platform</div>
          </div>
        </div>

        <div className="home-header-sep" />

        <nav className="home-nav">
          <button className="nav-btn" onClick={() => navigate('/guide')}>
            <BookOpen size={14} /> Docs
          </button>
          <button className="nav-btn" onClick={() => onShowInterview()} style={{ color: 'var(--primary)', fontWeight: 600 }}>
            <Briefcase size={14} /> Interviews
          </button>
          <button className="nav-btn" onClick={onShowSettings}>
            <SettingsIcon size={14} /> Settings
          </button>
          <button className="nav-btn nav-btn-icon" onClick={onToggleDark} title={settings?.darkMode ? 'Light Mode' : 'Dark Mode'}>
            {settings?.darkMode ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
          </button>
          {user ? (
            <Button variant="primary" size="sm" onClick={() => navigate('/profile')}>
              <User size={14} strokeWidth={2.5} /> My Profile
            </Button>
          ) : (
            <button className="nav-btn-primary" onClick={onShowAuth}>Sign In</button>
          )}
        </nav>
      </header>

      {/* ── Progress Strip ── */}
      <div className="global-progress-bar">
        <div className="global-progress-fill" style={{ width: `${totalPct}%` }} />
      </div>

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="home-hero-inner">
          {/* Left: headline */}
          <div className="home-hero-left">
            <div className="home-hero-badge">
              <Target size={11} /> SQL Interview Practice
            </div>

            <h1 className="home-hero-h1">
              Master SQL with<br />
              <span className="home-hero-accent">Real-World Data</span>
            </h1>

            <p className="home-hero-desc">
              10 hand-crafted databases. {allQuestions.length}+ progressive questions.
              Practice JOINs, Window Functions, CTEs and more — exactly the SQL
              that gets asked at FAANG and top tech companies.
            </p>

            <ul className="home-hero-features">
              <li><CheckCircle size={14} /> Real schemas: Airlines, Hospital, E-commerce &amp; more</li>
              <li><CheckCircle size={14} /> Instant query execution — no setup required</li>
              <li><CheckCircle size={14} /> AI-generated placement-style questions</li>
              <li><CheckCircle size={14} /> Upload your own CSV or SQLite database</li>
            </ul>

            <div className="hero-cta-row">
              <Button size="lg" onClick={() => navigate('/practice/airlines')}>
                <Play size={14} strokeWidth={2.5} fill="currentColor" />
                Start Practicing
                <ArrowRight size={14} strokeWidth={2} />
              </Button>
              <Button variant="secondary" size="lg" onClick={() => onShowInterview()}>
                <Briefcase size={14} /> Interview Mode
              </Button>
            </div>
          </div>

          {/* Right: stats */}
          <div className="home-hero-right">
            <div className="hero-stats-grid">
              <div className="hero-stat-card">
                <div className="hero-stat-icon-wrap" style={{ background: 'var(--success-muted)', border: '1px solid var(--success-light, rgba(5,150,105,0.2))', color: 'var(--success)' }}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div className="hero-stat-value" style={{ color: 'var(--success)' }}>{totalComplete}</div>
                  <div className="hero-stat-label">Solved</div>
                </div>
              </div>

              <div className="hero-stat-card">
                <div className="hero-stat-icon-wrap" style={{ background: 'var(--warning-muted)', border: '1px solid var(--warning-light, rgba(217,119,6,0.2))', color: 'var(--warning)' }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <div className="hero-stat-value" style={{ color: 'var(--warning)' }}>{totalAttempted}</div>
                  <div className="hero-stat-label">In Progress</div>
                </div>
              </div>

              <div className="hero-stat-card">
                <div className="hero-stat-icon-wrap" style={{ background: 'var(--primary-muted)', border: '1px solid var(--primary-light)', color: 'var(--primary)' }}>
                  <Target size={20} />
                </div>
                <div>
                  <div className="hero-stat-value" style={{ color: 'var(--primary)' }}>{score.toLocaleString()}</div>
                  <div className="hero-stat-label">Score</div>
                </div>
              </div>

              <div className="hero-stat-card">
                <div className="hero-stat-icon-wrap" style={{ background: 'var(--primary-muted)', border: '1px solid var(--primary-light)', color: 'var(--primary)' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <div className="hero-stat-value" style={{ color: 'var(--primary)' }}>{totalPct}%</div>
                  <div className="hero-stat-label">Complete</div>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="hero-quick-links">
              <Button variant="outline" size="sm" icon={Upload} onClick={() => navigate('/sandbox')}>
                Custom Dataset
              </Button>
              <Button variant="outline" size="sm" icon={BookOpen} onClick={() => navigate('/guide')}>
                Documentation
              </Button>
              <Button variant="outline" size="sm" icon={Zap} onClick={() => navigate('/practice/airlines')}>
                Quick Start
              </Button>
            </div>
          </div>
        </div>
      </section>

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
            Upload any CSV or SQLite file and practice SQL on your own data —
            with schema-aware autocomplete and AI-generated questions.
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
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
          const completed = dbQs.filter(q => progress[q.id] === 'complete').length;
          const attempted  = dbQs.filter(q => progress[q.id] === 'attempted').length;
          const pct = Math.round(completed / info.questionCount * 100);
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
                    <span className="db-card-count">{info.tableCount} tables · {info.questionCount} questions</span>
                  </div>
                  <div className={`db-card-pct${pct === 100 ? ' complete' : ''}`}>{pct}%</div>
                </div>
                <p className="db-card-desc">{info.description}</p>
                <div className="db-card-concepts">
                  {info.concepts.slice(0, 4).map(c => <span key={c} className="tag">{c}</span>)}
                </div>
              </div>
              <div className="db-card-footer">
                <div className="db-progress-bar">
                  <div className="db-progress-fill" style={{ width: `${pct}%` }} />
                  {attempted > 0 && (
                    <div className="db-progress-attempted" style={{ width: `${Math.round(attempted / info.questionCount * 100)}%`, left: `${pct}%` }} />
                  )}
                </div>
                <span className="db-progress-label">{completed}/{info.questionCount}</span>
              </div>
            </button>
          );
        })}
      </main>
    </div>
  );
}
