import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, BarChart2, Star, BookOpen, Target, ChevronRight, Zap, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getCompanyKB, getDifficultyDistribution } from '@/lib/companyKnowledgeBase';
const TABS = [
  { id: 'overview',    icon: '📊', label: 'Overview' },
  { id: 'questions',  icon: '❓', label: 'Question Bank' },
  { id: 'experiences', icon: '💬', label: 'Experiences' },
  { id: 'roadmap',    icon: '🗺️', label: 'Learning Path' },
];

function extractTopics(sql) {
  if (!sql) return [];
  const up = sql.toUpperCase();
  const topics = [];
  if (up.includes('JOIN')) topics.push('Joins');
  if (/OVER\s*\(/.test(up) && up.includes('PARTITION')) topics.push('Window Functions');
  if (up.includes('GROUP BY')) topics.push('Aggregations');
  if (/WITH\s+\w+\s+AS/.test(up)) topics.push('CTEs');
  if (up.includes('CASE')) topics.push('CASE Statements');
  if (up.includes('HAVING')) topics.push('HAVING');
  if (/IN\s*\(/.test(up) || /EXISTS\s*\(/.test(up)) topics.push('Subqueries');
  if (/RANK|ROW_NUMBER|DENSE_RANK/.test(up)) topics.push('Ranking');
  if (/LAG|LEAD/.test(up)) topics.push('LAG/LEAD');
  return topics;
}

function difficultyStyle(d) {
  const l = (d || '').toLowerCase();
  if (l === 'hard' || l === 'expert') return { color: 'var(--error)', bg: 'var(--error-muted)' };
  if (l === 'medium') return { color: 'var(--warning)', bg: 'var(--warning-muted)' };
  return { color: 'var(--success)', bg: 'var(--success-muted)' };
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, color }) {
  return (
    <div style={{
      flex: 1, padding: '16px 20px', background: 'var(--surface)',
      border: '1px solid var(--border)', borderRadius: 12, textAlign: 'center', minWidth: 100,
    }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: color || 'var(--text)', lineHeight: 1.1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {label}
      </div>
    </div>
  );
}

// ── Difficulty bar ───────────────────────────────────────────────────────────
function DiffBar({ easy, medium, hard }) {
  return (
    <div style={{ display: 'flex', height: 10, borderRadius: 10, overflow: 'hidden', width: '100%', gap: 2 }}>
      <div style={{ flex: easy, background: 'var(--success)', borderRadius: '10px 0 0 10px', transition: 'flex 0.8s ease', opacity: easy > 0 ? 1 : 0 }} />
      <div style={{ flex: medium, background: 'var(--warning)', transition: 'flex 0.8s ease', opacity: medium > 0 ? 1 : 0 }} />
      <div style={{ flex: hard, background: 'var(--error)', borderRadius: '0 10px 10px 0', transition: 'flex 0.8s ease', opacity: hard > 0 ? 1 : 0 }} />
    </div>
  );
}

// ── Topic tag ─────────────────────────────────────────────────────────────────
function TopicTag({ label, onClick }) {
  return (
    <span
      style={{
        display: 'inline-block', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
        background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)',
        cursor: onClick ? 'pointer' : 'default', transition: 'all 0.15s',
        userSelect: 'none',
      }}
      onClick={onClick}
      onMouseEnter={e => onClick && (e.target.style.background = 'var(--primary-muted)', e.target.style.color = 'var(--primary)', e.target.style.borderColor = 'var(--primary)')}
      onMouseLeave={e => onClick && (e.target.style.background = 'var(--surface-2)', e.target.style.color = 'var(--text-secondary)', e.target.style.borderColor = 'var(--border)')}
    >
      {label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function CompanyPrepPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [company, setCompany] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(true);

  const kbSlug = slug?.replace(/-/g, ' ');
  const kb = getCompanyKB(kbSlug || slug || '');
  const diffDist = getDifficultyDistribution(kbSlug || slug || '');
  const accentColor = kb?.color || '#6366f1';

  // Derive company name from slug
  const companyName = kb?.name || slug?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Company';

  useEffect(() => {
    if (!slug) return;
    const namePart = slug.split('-')[0];
    supabase.from('companies').select('*').ilike('name', `%${namePart}%`).limit(1)
      .then(({ data }) => {
        if (data && data[0]) setCompany(data[0]);
        else setCompany({ name: companyName });
      });
  }, [slug]);

  useEffect(() => {
    if (!company?.id) { setLoadingQ(false); return; }
    setLoadingQ(true);
    supabase.from('questions')
      .select(`*, question_company_mapping!inner(company_id, frequency_score)`)
      .eq('question_company_mapping.company_id', company.id)
      .order('difficulty')
      .then(({ data }) => { setQuestions(data || []); setLoadingQ(false); });
  }, [company?.id]);

  const companyObj = useMemo(() => ({
    name: companyName,
    slug: kbSlug || slug,
    ...(company || {}),
  }), [companyName, kbSlug, slug, company]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 50%, var(--bg) 100%)`,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 32px 0' }}>
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20,
              fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none',
              cursor: 'pointer', fontWeight: 600, padding: 0,
            }}
          >
            <ArrowLeft size={15} /> Back to Companies
          </button>

          {/* Company header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 28 }}>
            {/* Logo */}
            <div style={{
              width: 80, height: 80, borderRadius: 20, flexShrink: 0,
              background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}44)`,
              border: `2px solid ${accentColor}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, boxShadow: `0 4px 20px ${accentColor}30`,
            }}>
              {kb?.emoji || companyName.charAt(0)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--text)', margin: 0, lineHeight: 1 }}>
                  {companyName}
                </h1>
                {company?.category && (
                  <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}40` }}>
                    {company.category}
                  </span>
                )}
                {kb?.avgDifficulty && (
                  <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, ...difficultyStyle(kb.avgDifficulty) }}>
                    Avg: {kb.avgDifficulty}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, maxWidth: 640 }}>
                {kb?.style?.slice(0, 200) || `Interview preparation guide for ${companyName}`}
              </p>
            </div>

            {/* Quick action */}
            <button
              onClick={() => navigate('/practice/ecommerce')}
              style={{
                flexShrink: 0, padding: '10px 18px', borderRadius: 10, border: 'none',
                background: `linear-gradient(135deg, ${accentColor}, #3b82f6)`,
                color: 'white', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', boxShadow: `0 3px 12px ${accentColor}40`,
                display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
            >
              💻 Practice
            </button>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <StatCard value={questions.length || '—'} label="Questions" />
            <StatCard value={kb?.interviewRounds || '3–5'} label="Rounds" />
            <StatCard value={kb?.topics?.length || '—'} label="SQL Topics" />
            <StatCard value={`${diffDist.hard}%`} label="Hard Questions" color="var(--error)" />
            <StatCard value={kb?.avgDifficulty || 'Medium'} label="Avg Difficulty" />
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: -1 }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '10px 18px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  background: activeTab === t.id ? 'var(--surface)' : 'transparent',
                  color: activeTab === t.id ? accentColor : 'var(--muted)',
                  borderBottom: activeTab === t.id ? `2px solid ${accentColor}` : '2px solid transparent',
                  borderRadius: '8px 8px 0 0', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Body ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px' }}>

        {/* ━━ OVERVIEW ━━ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Difficulty distribution */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accentColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart2 size={16} style={{ color: accentColor }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Difficulty Distribution</div>
              </div>
              <DiffBar easy={diffDist.easy} medium={diffDist.medium} hard={diffDist.hard} />
              <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
                <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                  Easy {diffDist.easy}%
                </span>
                <span style={{ fontSize: 13, color: 'var(--warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--warning)', display: 'inline-block' }} />
                  Medium {diffDist.medium}%
                </span>
                <span style={{ fontSize: 13, color: 'var(--error)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--error)', display: 'inline-block' }} />
                  Hard {diffDist.hard}%
                </span>
              </div>
            </div>

            {/* Frequently asked topics */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accentColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={16} style={{ color: accentColor }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Frequently Asked Topics</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(kb?.topics || []).map(t => (
                  <TopicTag key={t} label={t} onClick={() => { setActiveTab('ai_generate'); }} />
                ))}
              </div>
            </div>

            {/* Interview patterns */}
            {kb?.patterns && kb.patterns.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accentColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Target size={16} style={{ color: accentColor }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Common Question Patterns at {companyName}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {kb.patterns.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px 16px', borderRadius: 10, background: 'var(--surface-2)',
                        border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)',
                        lineHeight: 1.55, display: 'flex', gap: 10, alignItems: 'flex-start',
                      }}
                    >
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{['📊', '📈', '🔍', '⚡', '🎯', '💡'][i % 6]}</span>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick links */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, gridColumn: '1 / -1' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>🚀 Quick Actions</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/practice/ecommerce')}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}
                >
                  💻 Practice SQL Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ━━ QUESTION BANK ━━ */}
        {activeTab === 'questions' && (
          <div>
            {loadingQ ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                Loading questions...
              </div>
            ) : questions.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>No mapped questions yet</h3>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
                  We are working on adding more questions for this company. Check back soon!
                </p>
              </div>
            ) : (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Question Bank</span>
                  <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                    {questions.length} questions
                  </span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)' }}>
                      <th style={{ padding: '11px 20px', textAlign: 'left', fontWeight: 700, color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Title</th>
                      <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Topics</th>
                      <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Difficulty</th>
                      <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Time</th>
                      <th style={{ padding: '11px 20px', textAlign: 'right', fontWeight: 700, color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Practice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map(q => {
                      const topics = extractTopics(q.solution_sql);
                      const { color, bg } = difficultyStyle(q.difficulty);
                      return (
                        <tr key={q.id}
                          style={{ borderTop: '1px solid var(--border)', transition: 'background 0.15s', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}
                        >
                          <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text)', maxWidth: 280 }}>
                            {q.title}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {topics.slice(0, 2).map(t => (
                                <span key={t} style={{ padding: '2px 7px', borderRadius: 8, fontSize: 10, fontWeight: 600, background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ padding: '3px 9px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: bg, color }}>
                              {q.difficulty}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: 12 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={12} />{q.estimated_time_minutes || 15}m
                            </span>
                          </td>
                          <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                            <Link
                              to={`/practice/${(q.schema_name || 'ecommerce').toLowerCase()}`}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
                                background: 'var(--primary)', color: 'white',
                                fontWeight: 700, fontSize: 12, transition: 'all 0.2s',
                              }}
                            >
                              Practice <ChevronRight size={12} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ━━ EXPERIENCES ━━ */}
        {activeTab === 'experiences' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>💬 Real Interview Experiences</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
              Real SQL interview experiences reported by candidates at {companyName}.
            </p>
            {(kb?.experiences && kb.experiences.length > 0) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {kb.experiences.map((exp, i) => (
                  <div key={i} style={{
                    padding: '20px 24px', borderRadius: 12, background: 'var(--surface)',
                    border: '1px solid var(--border)', position: 'relative',
                    borderLeft: `3px solid ${accentColor}`,
                  }}>
                    <span style={{
                      position: 'absolute', top: 16, left: -14, fontSize: 28,
                      width: 28, height: 28, background: 'var(--surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>💬</span>
                    <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text)', margin: 0, paddingLeft: 8 }}>{exp}</p>
                    <div style={{ marginTop: 10, paddingLeft: 8, fontSize: 12, color: 'var(--muted)' }}>
                      — {companyName} Interview Candidate
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                No experiences available for this company yet.
              </div>
            )}
          </div>
        )}

        {/* ━━ ROADMAP ━━ */}
        {activeTab === 'roadmap' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>🗺️ Learning Path for {companyName}</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 28 }}>
              Master these topics in order to be ready for {companyName} SQL interviews.
            </p>
            {(kb?.recommendedTopics && kb.recommendedTopics.length > 0) ? (
              <div style={{ position: 'relative' }}>
                {/* Vertical line */}
                <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {kb.recommendedTopics.map((topic, i) => {
                    const isLast = i === kb.recommendedTopics.length - 1;
                    return (
                      <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', position: 'relative', paddingLeft: 10 }}>
                        {/* Step circle */}
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                          background: `linear-gradient(135deg, ${accentColor}, #3b82f6)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 800, fontSize: 15,
                          boxShadow: `0 2px 8px ${accentColor}40`, zIndex: 1,
                        }}>
                          {i + 1}
                        </div>
                        {/* Content */}
                        <div style={{
                          flex: 1, padding: '14px 18px', background: 'var(--surface)',
                          border: '1px solid var(--border)', borderRadius: 12,
                          display: 'flex', alignItems: 'center', gap: 16,
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>{topic}</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                              {['Master the basics', 'Build complexity', 'Practice optimization', 'Learn advanced patterns', 'Speed and accuracy'][i % 5]}
                            </div>
                          </div>
                          <Link
                            to="/practice/ecommerce"
                            style={{
                              flexShrink: 0, padding: '7px 14px', borderRadius: 8, textDecoration: 'none',
                              background: `${accentColor}15`, color: accentColor,
                              border: `1px solid ${accentColor}30`, fontWeight: 700, fontSize: 12,
                              display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
                            }}
                          >
                            Practice <ChevronRight size={12} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
                Learning path not available for this company yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
