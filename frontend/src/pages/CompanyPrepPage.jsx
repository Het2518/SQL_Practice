import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { getCompanyKB, getDifficultyDistribution } from '@/lib/companyKnowledgeBase';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Header, HeaderBreadcrumbs } from '@/shared/ui/Header';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'questions', label: 'Question Bank' },
  { id: 'experiences', label: 'Experiences' },
  { id: 'roadmap', label: 'Learning Path' },
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

function StatCard({ value, label, color }) {
  return (
    <div
      style={{
        flex: 1,
        padding: '16px 20px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        textAlign: 'center',
        minWidth: 96,
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: color || 'var(--text)',
          lineHeight: 1.1,
          marginBottom: 4,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}
      >
        {label}
      </div>
    </div>
  );
}

function DiffBar({ easy, medium, hard }) {
  return (
    <div
      style={{
        display: 'flex',
        height: 8,
        borderRadius: 8,
        overflow: 'hidden',
        width: '100%',
        gap: 2,
      }}
    >
      <div
        style={{
          flex: easy,
          background: 'var(--success)',
          borderRadius: '8px 0 0 8px',
          opacity: easy > 0 ? 1 : 0,
          transition: 'flex 0.8s',
        }}
      />
      <div
        style={{
          flex: medium,
          background: 'var(--warning)',
          opacity: medium > 0 ? 1 : 0,
          transition: 'flex 0.8s',
        }}
      />
      <div
        style={{
          flex: hard,
          background: 'var(--error)',
          borderRadius: '0 8px 8px 0',
          opacity: hard > 0 ? 1 : 0,
          transition: 'flex 0.8s',
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function CompanyPrepPage(props) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const kbSlug = slug?.replace(/-/g, ' ');
  const kb = getCompanyKB(kbSlug || slug || '');
  const diffDist = getDifficultyDistribution(kbSlug || slug || '');

  const companyName =
    kb?.name ||
    slug
      ?.split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') ||
    'Company';
  const { data: company } = useQuery({
    queryKey: ['company', slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        const { data } = await api.companies.getBySlug(slug);
        return data.data.company || { name: companyName };
      } catch {
        return { name: companyName };
      }
    },
    enabled: !!slug,
  });

  const { data: questions = [], isLoading: loadingQ } = useQuery({
    queryKey: ['company-questions', company?._id],
    queryFn: async () => {
      if (!company?._id) return [];
      const { data } = await api.questions.getByCompany(company._id);
      return data.data.questions ?? [];
    },
    enabled: !!company?._id,
  });

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-bg text-text page-enter">
      {/* ── Global Header ── */}
      <Header
        onShowAuth={props.onShowAuth}
        onShowSettings={props.onShowSettings}
        leftContent={
          <HeaderBreadcrumbs
            items={[
              { label: 'Interview Prep', onClick: () => navigate('/interview') },
              { label: companyName },
            ]}
          />
        }
      />

      {/* ── Premium Company Hero ── */}
      <div
        style={{
          background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px 0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 20,
              marginBottom: 32,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              {/* Logo mark */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 18,
                  flexShrink: 0,
                  background:
                    'linear-gradient(135deg, var(--primary) 0%, var(--primary-muted) 100%)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  fontWeight: 900,
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {companyName.charAt(0).toUpperCase()}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <h1
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      color: 'var(--text)',
                      margin: 0,
                      letterSpacing: '-0.5px',
                    }}
                  >
                    {companyName}
                  </h1>
                  {company?.category && <Badge variant="primary">{company.category}</Badge>}
                  {kb?.avgDifficulty && (
                    <Badge variant={kb.avgDifficulty}>Avg: {kb.avgDifficulty}</Badge>
                  )}
                </div>
                <p
                  style={{
                    fontSize: 15,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                    maxWidth: 600,
                  }}
                >
                  {kb?.style?.slice(0, 180) ||
                    `Comprehensive SQL interview preparation guide for ${companyName}`}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(`/interview/preflight/${slug}`)}
              style={{ padding: '0 32px' }}
            >
              Start Mock Interview
            </Button>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
            <StatCard value={questions.length || '—'} label="Questions" />
            <StatCard value={kb?.interviewRounds || '3–5'} label="Rounds" />
            <StatCard value={kb?.topics?.length || '—'} label="SQL Topics" />
            <StatCard value={`${diffDist.hard}%`} label="Hard" color="var(--error)" />
          </div>

          {/* Segmented Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: -1 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: activeTab === t.id ? 700 : 500,
                  fontSize: 14,
                  background: activeTab === t.id ? 'var(--surface-2)' : 'transparent',
                  transition: 'all 0.15s ease',
                  color: activeTab === t.id ? 'var(--text)' : 'var(--text-secondary)',
                  borderTop:
                    activeTab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
                  borderLeft:
                    activeTab === t.id ? '1px solid var(--border)' : '1px solid transparent',
                  borderRight:
                    activeTab === t.id ? '1px solid var(--border)' : '1px solid transparent',
                  borderRadius: '8px 8px 0 0',
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
            <Card title="Difficulty Distribution">
              <DiffBar easy={diffDist.easy} medium={diffDist.medium} hard={diffDist.hard} />
              <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
                {[
                  { label: 'Easy', pct: diffDist.easy, color: 'var(--success)' },
                  { label: 'Medium', pct: diffDist.medium, color: 'var(--warning)' },
                  { label: 'Hard', pct: diffDist.hard, color: 'var(--error)' },
                ].map((d) => (
                  <span
                    key={d.label}
                    style={{
                      fontSize: 12,
                      color: d.color,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: d.color,
                        display: 'inline-block',
                      }}
                    />
                    {d.label} {d.pct}%
                  </span>
                ))}
              </div>
            </Card>

            <Card title="Frequently Asked Topics">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {(
                  kb?.topics || ['Joins', 'Window Functions', 'Aggregations', 'Subqueries', 'CTEs']
                ).map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Card>

            {kb?.patterns && kb.patterns.length > 0 && (
              <Card
                title={`Common Question Patterns at ${companyName}`}
                style={{ gridColumn: '1 / -1' }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 12,
                  }}
                >
                  {kb.patterns.slice(0, 3).map((p, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 8,
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.55,
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          color: 'var(--primary)',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}.
                      </span>
                      {p}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card title="Quick Actions" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setActiveTab('questions')}
                  style={{ flex: 1, minWidth: 160, justifyContent: 'center' }}
                >
                  Browse {questions.length} Questions
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/practice/ecommerce')}
                  style={{ flex: 1, minWidth: 160, justifyContent: 'center' }}
                >
                  Start Mock Interview
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setActiveTab('roadmap')}
                  style={{ flex: 1, minWidth: 160, justifyContent: 'center' }}
                >
                  View Learning Path
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ━━ QUESTION BANK ━━ */}
        {activeTab === 'questions' && (
          <div>
            {loadingQ ? (
              <div
                style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}
              >
                Loading questions...
              </div>
            ) : questions.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center' }}>
                <div
                  style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}
                >
                  No questions mapped yet
                </div>
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 auto', maxWidth: 400 }}>
                  We are working on adding more questions for this company. Check back soon!
                </p>
              </div>
            ) : (
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Question Bank</span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      background: 'var(--primary-muted)',
                      color: 'var(--primary)',
                    }}
                  >
                    {questions.length}
                  </span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)' }}>
                      {['Title', 'Topics', 'Difficulty', 'Time', 'Practice'].map((h, i) => (
                        <th
                          key={h}
                          style={{
                            padding: '10px 16px',
                            textAlign: i === 4 ? 'right' : 'left',
                            fontWeight: 700,
                            color: 'var(--muted)',
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q) => {
                      const topics = extractTopics(q.solution_sql);
                      return (
                        <tr
                          key={q.id}
                          style={{
                            borderTop: '1px solid var(--border)',
                            cursor: 'pointer',
                            transition: 'background 0.12s',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = 'var(--surface-2)')
                          }
                          onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                        >
                          <td
                            style={{
                              padding: '13px 16px',
                              fontWeight: 600,
                              color: 'var(--text)',
                              maxWidth: 280,
                            }}
                          >
                            {q.title}
                          </td>
                          <td style={{ padding: '13px 16px' }}>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {topics.slice(0, 2).map((t) => (
                                <span
                                  key={t}
                                  style={{
                                    padding: '2px 7px',
                                    borderRadius: 5,
                                    fontSize: 10,
                                    fontWeight: 600,
                                    background: 'var(--primary-muted)',
                                    color: 'var(--primary)',
                                  }}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '13px 16px' }}>
                            <Badge variant={q.difficulty}>{q.difficulty}</Badge>
                          </td>
                          <td style={{ padding: '13px 16px', color: 'var(--muted)', fontSize: 12 }}>
                            {q.estimated_time_minutes || 15}m
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                            <Link
                              to={`/practice/${(q.schema_name || 'ecommerce').toLowerCase()}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '6px 12px',
                                borderRadius: 7,
                                textDecoration: 'none',
                                background: 'var(--primary)',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: 12,
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
              <h2
                style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px', color: 'var(--text)' }}
              >
                Real Interview Experiences
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
                Reported by SQL candidates at {companyName}.
              </p>
            </div>
            {kb?.experiences && kb.experiences.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {kb.experiences.map((exp, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '20px 24px',
                      borderRadius: 10,
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderLeft: '3px solid var(--primary)',
                    }}
                  >
                    <p
                      style={{
                        fontSize: 14,
                        lineHeight: 1.75,
                        color: 'var(--text)',
                        margin: '0 0 10px',
                      }}
                    >
                      {exp}
                    </p>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      — {companyName} Interview Candidate
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
                <div
                  style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}
                >
                  No experiences yet
                </div>
                <div style={{ fontSize: 13 }}>No experiences available for this company yet.</div>
              </div>
            )}
          </div>
        )}

        {/* ━━ ROADMAP ━━ */}
        {activeTab === 'roadmap' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2
                style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px', color: 'var(--text)' }}
              >
                Learning Path for {companyName}
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
                Master these topics in order to be ready for {companyName} SQL interviews.
              </p>
            </div>
            {kb?.recommendedTopics && kb.recommendedTopics.length > 0 ? (
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 27,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: 'var(--border)',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {kb.recommendedTopics.map((topic, i) => (
                    <div
                      key={i}
                      style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingLeft: 8 }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          flexShrink: 0,
                          background: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: 14,
                          zIndex: 1,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          padding: '14px 18px',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 14,
                              color: 'var(--text)',
                              marginBottom: 3,
                            }}
                          >
                            {topic}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                            {
                              [
                                'Master the basics',
                                'Build complexity',
                                'Practice optimization',
                                'Learn advanced patterns',
                                'Speed and accuracy',
                              ][i % 5]
                            }
                          </div>
                        </div>
                        <Link
                          to="/practice/ecommerce"
                          style={{
                            flexShrink: 0,
                            padding: '7px 14px',
                            borderRadius: 7,
                            textDecoration: 'none',
                            background: 'var(--primary-muted)',
                            color: 'var(--primary)',
                            border: '1px solid var(--primary-light)',
                            fontWeight: 700,
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
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
                <div
                  style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}
                >
                  Learning path not available
                </div>
                <div style={{ fontSize: 13 }}>
                  No recommended learning path for this company yet.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
