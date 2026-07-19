import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Sun, Moon, BookOpen, Settings as SettingsIcon, User, Database, Play, ArrowRight, Trophy, Award, CheckCircle2, Timer, BarChart3, Briefcase } from 'lucide-react';
import { DB_INFO } from '@/data/schemas';
import { allQuestions, getQuestionsForDb } from '@/data/index';

const DB_NAMES = Object.keys(DB_INFO);

export function DbSelector({ progress, gameState, user, onShowAuth, onShowSettings, onShowInterview, settings, onToggleDark }) {
  const navigate = useNavigate();
  const totalComplete = Object.values(progress).filter(s => s === 'complete').length;
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

  return <div className="home-root page-enter">

    {/* ── Sticky Navbar ── */}
    <header className="home-header">
      <div className="home-logo" onClick={() => {}} style={{ cursor: 'default' }}>
        <div className="home-logo-badge">
          <Database size={17} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <div className="home-title">DataDesk</div>
          <div className="home-subtitle">10 databases · 600 questions</div>
        </div>
      </div>

      <div className="home-header-sep" />

      <nav className="home-nav">
        <button className="nav-btn" onClick={() => navigate('/guide')}>
          <BookOpen size={14} />
          Docs
        </button>
        <button className="nav-btn" onClick={() => onShowInterview()} style={{ color: 'var(--primary)', fontWeight: 600 }}>
          <Briefcase size={14} />
          Interviews
        </button>
        <button className="nav-btn" onClick={onShowSettings}>
          <SettingsIcon size={14} />
          Settings
        </button>
        <button
          className="nav-btn nav-btn-icon"
          onClick={onToggleDark}
          title={settings?.darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {settings?.darkMode ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
        </button>
        {user ? (
          <button className="nav-btn-primary" onClick={() => navigate('/profile')}>
            <User size={14} strokeWidth={2.5} />
            My Profile
          </button>
        ) : (
          <button className="nav-btn-primary" onClick={onShowAuth}>
            Sign In
          </button>
        )}
      </nav>
    </header>

    {/* ── Progress Strip ── */}
    <div className="global-progress-bar">
      <div className="global-progress-fill" style={{ width: `${totalPct}%` }} />
    </div>

    {/* ── Hero Banner ── */}
    <section className="home-hero">
      <div className="home-hero-content">
        <div className="home-hero-badge">
          <Database size={11} />
          Real-World DataDesk Practice
        </div>
        <h2>Master SQL with <span>Real Data</span></h2>
        <p>10 hand-crafted databases. 600 progressive questions. From beginner JOINs to advanced Window Functions — practice the SQL that matters in real jobs.</p>

        <div className="hero-cta-row">
          <button className="hero-btn-start" onClick={() => navigate('/practice/airlines')}>
            <Play size={15} strokeWidth={2.5} fill="currentColor" />
            Start Practicing
            <ArrowRight size={15} strokeWidth={2} style={{ marginLeft: 2 }} />
          </button>
          <span className="hero-meta">
            <Trophy size={13} strokeWidth={2} style={{ flexShrink: 0, color: '#f59e0b' }} />
            {score.toLocaleString()} pts
            <span style={{ width: 1, height: 12, background: 'var(--border)', display: 'inline-block', margin: '0 4px' }} />
            <Award size={13} strokeWidth={2} style={{ flexShrink: 0, color: '#8b5cf6' }} />
            {badges} badges
          </span>
        </div>

        <div className="hero-stats-row">
          <div className="hero-stat-card">
            <div className="hero-stat-icon" style={{ background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)' }}>
              <CheckCircle2 size={20} color="#059669" strokeWidth={2} />
            </div>
            <div className="hero-stat-info">
              <span className="hero-stat-value" style={{ color: 'var(--success)' }}>{totalComplete}</span>
              <span className="hero-stat-label">Solved</span>
            </div>
          </div>
          <div className="hero-stat-card">
            <div className="hero-stat-icon" style={{ background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.2)' }}>
              <Timer size={20} color="#d97706" strokeWidth={2} />
            </div>
            <div className="hero-stat-info">
              <span className="hero-stat-value" style={{ color: '#d97706' }}>{totalAttempted}</span>
              <span className="hero-stat-label">In Progress</span>
            </div>
          </div>
          <div className="hero-stat-card">
            <div className="hero-stat-icon" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <Trophy size={20} color="#7c3aed" strokeWidth={2} />
            </div>
            <div className="hero-stat-info">
              <span className="hero-stat-value" style={{ color: '#7c3aed' }}>{score.toLocaleString()}</span>
              <span className="hero-stat-label">Score</span>
            </div>
          </div>
          <div className="hero-stat-card">
            <div className="hero-stat-icon" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}>
              <BarChart3 size={20} color="#2563eb" strokeWidth={2} />
            </div>
            <div className="hero-stat-info">
              <span className="hero-stat-value" style={{ color: '#2563eb' }}>{totalPct}%</span>
              <span className="hero-stat-label">Complete</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Custom Dataset Banner ── */}
    <div style={{
      margin: '0 28px 20px',
      padding: '20px 28px',
      background: 'linear-gradient(135deg, var(--primary-muted) 0%, var(--surface) 100%)',
      border: '1.5px dashed var(--primary)',
      borderRadius: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}
      onClick={() => navigate('/sandbox')}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.005)'; e.currentTarget.style.boxShadow = '0 4px 24px var(--primary-muted)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
          boxShadow: '0 4px 12px var(--primary-muted)',
        }}>📂</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>Custom Dataset Practice</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', background: 'var(--primary)', color: '#fff', borderRadius: 99 }}>NEW ✨</span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Upload your own CSV or SQLite file — practice SQL on <strong>your data</strong> with schema-aware autocomplete.
          </span>
        </div>
      </div>
      <div style={{
        padding: '10px 20px', background: 'var(--primary)', color: '#fff',
        borderRadius: 10, fontWeight: 700, fontSize: 13,
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        boxShadow: '0 4px 12px var(--primary-muted)',
      }}>
        Upload &amp; Practice →
      </div>
    </div>

    {/* ── Grid Header ── */}
    <div className="db-grid-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Built-in Databases
        </h3>
        <span style={{ background: 'var(--primary-muted)', color: 'var(--primary)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
          {DB_NAMES.length}
        </span>
      </div>
      <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
        {allQuestions.length - totalComplete} questions remaining
      </span>
    </div>

    {/* ── DB Cards ── */}
    <main className="db-grid">
      {DB_NAMES.map((db, i) => {
        const info = DB_INFO[db];
        const dbQs = getQuestionsForDb(db);
        const completed = dbQs.filter(q => progress[q.id] === 'complete').length;
        const attempted = dbQs.filter(q => progress[q.id] === 'attempted').length;
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
                <span className="db-card-icon">{info.icon}</span>
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
                  <div className="db-progress-attempted" style={{
                    width: `${Math.round(attempted / info.questionCount * 100)}%`,
                    left: `${pct}%`
                  }} />
                )}
              </div>
              <span className="db-progress-label">{completed}/{info.questionCount}</span>
            </div>
          </button>
        );
      })}
    </main>
  </div>;
}
