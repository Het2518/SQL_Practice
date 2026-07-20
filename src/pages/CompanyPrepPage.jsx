import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getCompanyKB, getDifficultyDistribution } from '@/lib/companyKnowledgeBase';

const TABS = [
  { id: 'overview',     label: 'Overview' },
  { id: 'questions',   label: 'Question Bank' },
  { id: 'experiences', label: 'Experiences' },
  { id: 'roadmap',     label: 'Learning Path' },
];

function extractTopics(sql) {
  if (!sql) return [];
  const up = sql.toUpperCase();
  const topics = [];
  if (up.includes('JOIN')) topics.push('Joins');
  if (/OVER\s*\(/.test(up) && up.includes('PARTITION')) topics.push('Window Functions');
  if (up.includes('GROUP BY')) topics.push('Aggregations');
  if (/WITH\s+\w+\s+AS/.test(up)) topics.push('CTEs');
  if (up.includes('CASE')) topics.push('CASE');
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

function StatCard({ value, label, color }) {
  return (
    <div style={{
      flex: 1, padding: '16px 20px', background: 'var(--surface)',
      border: '1px solid var(--border)', borderRadius: 10, textAlign: 'center', minWidth: 96,
    }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: color || 'var(--text)', lineHeight: 1.1, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </div>
    </div>
  );
}

function DiffBar({ easy, medium, hard }) {
  return (
    <div style={{ display: 'flex', height: 8, borderRadius: 8, overflow: 'hidden', width: '100%', gap: 2 }}>
      <div style={{ flex: easy, background: 'var(--success)', borderRadius: '8px 0 0 8px', opacity: easy > 0 ? 1 : 0, transition: 'flex 0.8s' }} />
      <div style={{ flex: medium, background: 'var(--warning)', opacity: medium > 0 ? 1 : 0, transition: 'flex 0.8s' }} />
      <div style={{ flex: hard, background: 'var(--error)', borderRadius: '0 8px 8px 0', opacity: hard > 0 ? 1 : 0, transition: 'flex 0.8s' }} />
    </div>
  );
}

function SectionCard({ title, children, span }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
      padding: 24, gridColumn: span ? '1 / -1' : undefined,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 18, letterSpacing: '-0.1px' }}>
        {title}
      </div>
      {children}
    </div>
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

  const companyName = kb?.name || slug?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Company';

  useEffect(() => {
    if (!slug) return;
    const namePart = slug.split('-')[0];
    supabase.from('companies').select('*').ilike('name', `%${namePart}%`).limit(1)
      .then(({ data }) => {
        if (data?.[0]) setCompany(data[0]);
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <header style={{
        height: 56, padding: '0 32px', display: 'flex', alignItems: 'center',
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button
          onClick={() => navigate('/interview')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'none',
            border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 13,
            fontWeight: 600, fontFamily: 'var(--font-sans)', padding: 0,
          }}
        >
          <ArrowLeft size={14} /> Companies
        </button>
        <span style={{ margin: '0 12px', color: 'var(--border)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{companyName}</span>
      </header>

      {/* ── Company Hero ── */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px 0' }}>

          {/* Company title row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
            {/* Logo mark */}
            <div style={{
              width: 56, height: 56, borderRadius: 14, flexShrink: 0,
              background: 'var(--primary-muted)', border: '1px solid var(--primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-mono)',
            }}>
              {companyName.charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.5px' }}>
                  {companyName}
                </h1>
                {company?.category && (
                  <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'var(--primary-muted)', color: 'var(--primary)', border: '1px solid var(--primary-light)' }}>
                    {company.category}
                  </span>
                )}
                {kb?.avgDifficulty && (
                  <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, ...difficultyStyle(kb.avgDifficulty) }}>
                    Avg: {kb.avgDifficulty}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, maxWidth: 600 }}>
                {kb?.style?.slice(0, 180) || `SQL interview preparation guide for ${companyName}`}
              </p>
            </div>

            <button
              onClick={() => navigate('/practice/ecommerce')}
              style={{
                flexShrink: 0, padding: '10px 20px', borderRadius: 8, border: 'none',
                background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: 'var(--font-sans)', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
            >
              Practice SQL
            </button>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            <StatCard value={questions.length || '—'} label="Questions" />
            <StatCard value={kb?.interviewRounds || '3–5'} label="Rounds" />
            <StatCard value={kb?.topics?.length || '—'} label="SQL Topics" />
            <StatCard value={`${diffDist.hard}%`} label="Hard" color="var(--error)" />
            <StatCard value={kb?.avgDifficulty || 'Medium'} label="Avg Difficulty" />
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: -1 }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '10px 20px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  fontWeight: activeTab === t.id ? 700 : 500, fontSize: 13,
                  background: 'none', transition: 'all 0.15s',
                  color: activeTab === t.id ? 'var(--primary)' : 'var(--muted)',
                  borderBottom: activeTab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
                  borderRadius: '6px 6px 0 0',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 32px 64px' }}>

        {/* ━━ OVERVIEW ━━ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <SectionCard title="Difficulty Distribution">
              <DiffBar easy={diffDist.easy} medium={diffDist.medium} hard={diffDist.hard} />
              <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
                {[
                  { label: 'Easy', pct: diffDist.easy, color: 'var(--success)' },
                  { label: 'Medium', pct: diffDist.medium, color: 'var(--warning)' },
                  { label: 'Hard', pct: diffDist.hard, color: 'var(--error)' },
                ].map(d => (
                  <span key={d.label} style={{ fontSize: 12, color: d.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                    {d.label} {d.pct}%
                  </span>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Frequently Asked Topics">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {(kb?.topics || ['Joins', 'Window Functions', 'Aggregations', 'Subqueries', 'CTEs']).map(t => (
                  <span
                    key={t}
                    style={{
                      padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </SectionCard>

            {kb?.patterns && kb.patterns.length > 0 && (
              <SectionCard title={`Common Question Patterns at ${companyName}`} span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {kb.patterns.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px 16px', borderRadius: 8, background: 'var(--surface-2)',
                        border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)',
                        lineHeight: 1.55, display: 'flex', gap: 10, alignItems: 'flex-start',
                      }}
                    >
                      <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                      {p}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            <SectionCard title="Quick Actions" span>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/practice/ecommerce')}
                  style={{
                    padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 8,
                    background: 'var(--surface-2)', color: 'var(--text)', fontFamily: 'var(--font-sans)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-muted)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
                >
                  Practice SQL Now
                </button>
                <button
                  onClick={() => setActiveTab('roadmap')}
                  style={{
                    padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 8,
                    background: 'var(--surface-2)', color: 'var(--text)', fontFamily: 'var(--font-sans)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-muted)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
                >
                  View Learning Path
                </button>
                <button
                  onClick={() => setActiveTab('experiences')}
                  style={{
                    padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 8,
                    background: 'var(--surface-2)', color: 'var(--text)', fontFamily: 'var(--font-sans)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-muted)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
                >
                  Read Experiences
                </button>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ━━ QUESTION BANK ━━ */}
        {activeTab === 'questions' && (
          <div>
            {loadingQ ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Loading questions...</div>
            ) : questions.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No questions mapped yet</div>
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 auto', maxWidth: 400 }}>
                  We are working on adding more questions for this company. Check back soon!
                </p>
              </div>
            ) : (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Question Bank</span>
                  <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                    {questions.length}
                  </span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)' }}>
                      {['Title', 'Topics', 'Difficulty', 'Time', 'Practice'].map((h, i) => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: i === 4 ? 'right' : 'left', fontWeight: 700, color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map(q => {
                      const topics = extractTopics(q.solution_sql);
                      const { color, bg } = difficultyStyle(q.difficulty);
                      return (
                        <tr
                          key={q.id}
                          style={{ borderTop: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.12s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}
                        >
                          <td style={{ padding: '13px 16px', fontWeight: 600, color: 'var(--text)', maxWidth: 280 }}>{q.title}</td>
                          <td style={{ padding: '13px 16px' }}>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {topics.slice(0, 2).map(t => (
                                <span key={t} style={{ padding: '2px 7px', borderRadius: 5, fontSize: 10, fontWeight: 600, background: 'var(--primary-muted)', color: 'var(--primary)' }}>{t}</span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '13px 16px' }}>
                            <span style={{ padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: bg, color }}>{q.difficulty}</span>
                          </td>
                          <td style={{ padding: '13px 16px', color: 'var(--muted)', fontSize: 12 }}>
                            {q.estimated_time_minutes || 15}m
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                            <Link
                              to={`/practice/${(q.schema_name || 'ecommerce').toLowerCase()}`}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                padding: '6px 12px', borderRadius: 7, textDecoration: 'none',
                                background: 'var(--primary)', color: '#fff',
                                fontWeight: 700, fontSize: 12,
                              }}
                            >
                              Practice
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
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px', color: 'var(--text)' }}>Real Interview Experiences</h2>
              <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
                Reported by SQL candidates at {companyName}.
              </p>
            </div>
            {(kb?.experiences && kb.experiences.length > 0) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {kb.experiences.map((exp, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '20px 24px', borderRadius: 10, background: 'var(--surface)',
                      border: '1px solid var(--border)', borderLeft: '3px solid var(--primary)',
                    }}
                  >
                    <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text)', margin: '0 0 10px' }}>{exp}</p>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>— {companyName} Interview Candidate</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>No experiences yet</div>
                <div style={{ fontSize: 13 }}>No experiences available for this company yet.</div>
              </div>
            )}
          </div>
        )}

        {/* ━━ ROADMAP ━━ */}
        {activeTab === 'roadmap' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px', color: 'var(--text)' }}>Learning Path for {companyName}</h2>
              <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
                Master these topics in order to be ready for {companyName} SQL interviews.
              </p>
            </div>
            {(kb?.recommendedTopics && kb.recommendedTopics.length > 0) ? (
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 27, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {kb.recommendedTopics.map((topic, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingLeft: 8 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800, fontSize: 14, zIndex: 1,
                      }}>
                        {i + 1}
                      </div>
                      <div style={{
                        flex: 1, padding: '14px 18px', background: 'var(--surface)',
                        border: '1px solid var(--border)', borderRadius: 10,
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
                            flexShrink: 0, padding: '7px 14px', borderRadius: 7, textDecoration: 'none',
                            background: 'var(--primary-muted)', color: 'var(--primary)',
                            border: '1px solid var(--primary-light)', fontWeight: 700, fontSize: 12,
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}
                        >
                          Practice <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Learning path not available</div>
                <div style={{ fontSize: 13 }}>No recommended learning path for this company yet.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
