import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { getCompanyKB, getDifficultyDistribution } from '@/lib/companyKnowledgeBase';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
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
    <div className="flex-1 px-5 py-4 bg-surface border border-border rounded-lg text-center min-w-[96px]">
      <div
        className="text-[22px] font-black leading-[1.1] mb-1 tabular-nums"
        style={{ color: color || 'var(--text)' }}
      >
        {value}
      </div>
      <div className="text-[10px] font-bold text-muted uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}

function DiffBar({ easy, medium, hard }) {
  return (
    <div className="flex h-2 rounded-lg overflow-hidden w-full gap-[2px]">
      <div
        className="bg-success rounded-l-lg transition-[flex] duration-800"
        style={{
          flex: easy,
          opacity: easy > 0 ? 1 : 0,
        }}
      />
      <div
        className="bg-warning transition-[flex] duration-800"
        style={{
          flex: medium,
          opacity: medium > 0 ? 1 : 0,
        }}
      />
      <div
        className="bg-error rounded-r-lg transition-[flex] duration-800"
        style={{
          flex: hard,
          opacity: hard > 0 ? 1 : 0,
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
      <div className="bg-gradient-to-b from-surface to-bg border-b border-border">
        <div className="max-w-[1100px] mx-auto px-8 pt-12 pb-0">
          <div className="flex items-start justify-between gap-5 mb-8 flex-wrap">
            <div className="flex gap-6 items-center">
              {/* Logo mark */}
              <div
                className="w-[72px] h-[72px] rounded-[18px] shrink-0 flex items-center justify-center text-[32px] font-black text-white font-mono shadow-[0_8px_24px_rgba(0,0,0,0.1)] bg-gradient-to-br from-primary to-primary-muted"
              >
                {companyName.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1
                    className="text-[32px] font-black text-text m-0 tracking-[-0.5px]"
                  >
                    {companyName}
                  </h1>
                  {company?.category && <Badge variant="primary">{company.category}</Badge>}
                  {kb?.avgDifficulty && (
                    <Badge variant={kb.avgDifficulty}>Avg: {kb.avgDifficulty}</Badge>
                  )}
                </div>
                <p
                  className="text-[15px] text-text-secondary leading-[1.6] m-0 max-w-[600px]"
                >
                  {kb?.style?.slice(0, 180) ||
                    `Comprehensive SQL interview preparation guide for ${companyName}`}
                </p>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex gap-4 mb-8 flex-wrap">
            <StatCard value={questions.length || '—'} label="Questions" />
            <StatCard value={kb?.interviewRounds || '3–5'} label="Rounds" />
            <StatCard value={kb?.topics?.length || '—'} label="SQL Topics" />
            <StatCard value={`${diffDist.hard}%`} label="Hard" color="var(--error)" />
          </div>

          {/* Segmented Tabs */}
          <div className="flex gap-2 -mb-[1px]">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-6 py-3 border-none cursor-pointer font-sans text-sm transition-all duration-150 rounded-t-lg border-t-2 border-l border-r ${
                  activeTab === t.id
                    ? 'font-bold bg-surface-2 text-text border-t-primary border-l-border border-r-border'
                    : 'font-medium bg-transparent text-text-secondary border-transparent border-t-transparent'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-[1100px] mx-auto px-8 pt-7 pb-16">
        {/* ━━ OVERVIEW ━━ */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Difficulty Distribution</CardTitle>
              </CardHeader>
              <CardContent>
              <DiffBar easy={diffDist.easy} medium={diffDist.medium} hard={diffDist.hard} />
              <div className="flex gap-4 mt-3.5">
                {[
                  { label: 'Easy', pct: diffDist.easy, color: 'var(--success)' },
                  { label: 'Medium', pct: diffDist.medium, color: 'var(--warning)' },
                  { label: 'Hard', pct: diffDist.hard, color: 'var(--error)' },
                ].map((d) => (
                  <span
                    key={d.label}
                    className="text-xs font-semibold flex items-center gap-1.5"
                    style={{ color: d.color }}
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ background: d.color }}
                    />
                    {d.label} {d.pct}%
                  </span>
                ))}
              </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Topics</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="flex flex-wrap gap-2">
                {(
                  kb?.topics || ['Joins', 'Window Functions', 'Aggregations', 'Subqueries', 'CTEs']
                ).map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-md text-xs font-semibold bg-surface-2 border border-border text-text-secondary"
                  >
                    {t}
                  </span>
                ))}
              </div>
              </CardContent>
            </Card>

            {kb?.patterns && kb.patterns.length > 0 && (
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle>Common Question Patterns at {companyName}</CardTitle>
                </CardHeader>
                <CardContent>
                <div
                  className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]"
                >
                  {kb.patterns.slice(0, 3).map((p, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 rounded-lg bg-surface-2 border border-border text-[13px] text-text-secondary leading-relaxed flex gap-2.5 items-start"
                    >
                      <span
                        className="text-[13px] text-primary font-bold shrink-0"
                      >
                        {i + 1}.
                      </span>
                      {p}
                    </div>
                  ))}
                </div>
                </CardContent>
              </Card>
            )}

            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="flex gap-2.5 flex-wrap">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setActiveTab('questions')}
                  className="flex-1 min-w-[160px] justify-center"
                >
                  Browse {questions.length} Questions
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/practice/ecommerce')}
                  className="flex-1 min-w-[160px] justify-center"
                >
                  Start Mock Interview
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setActiveTab('roadmap')}
                  className="flex-1 min-w-[160px] justify-center"
                >
                  View Learning Path
                </Button>
              </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ━━ QUESTION BANK ━━ */}
        {activeTab === 'questions' && (
          <div>
            {loadingQ ? (
              <div className="py-[60px] text-center text-muted text-sm">
                Loading questions...
              </div>
            ) : questions.length === 0 ? (
              <div className="p-[60px] text-center">
                <div
                  className="text-[15px] font-bold text-text mb-2"
                >
                  No questions mapped yet
                </div>
                <p className="text-muted text-[13px] mx-auto max-w-[400px]">
                  We are working on adding more questions for this company. Check back soon!
                </p>
              </div>
            ) : (
              <div
                className="bg-surface border border-border rounded-xl overflow-hidden"
              >
                <div
                  className="py-3.5 px-5 border-b border-border flex items-center gap-2.5"
                >
                  <span className="font-bold text-sm">Question Bank</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary-muted text-primary"
                  >
                    {questions.length}
                  </span>
                </div>
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-surface-2">
                      {['Title', 'Topics', 'Difficulty', 'Time', 'Practice'].map((h, i) => (
                        <th
                          key={h}
                          className={`p-2.5 px-4 font-bold text-muted text-[10px] uppercase tracking-widest ${i === 4 ? 'text-right' : 'text-left'}`}
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
                          className="border-t border-border cursor-pointer transition-colors duration-150 hover:bg-surface-2"
                        >
                          <td className="p-3 px-4 font-semibold text-text max-w-[280px]">
                            {q.title}
                          </td>
                          <td className="p-3 px-4">
                            <div className="flex gap-1 flex-wrap">
                              {topics.slice(0, 2).map((t) => (
                                <span
                                  key={t}
                                  className="px-[7px] py-[2px] rounded-md text-[10px] font-semibold bg-primary-muted text-primary"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 px-4">
                            <Badge variant={q.difficulty}>{q.difficulty}</Badge>
                          </td>
                          <td className="p-3 px-4 text-muted text-xs">
                            {q.estimated_time_minutes || 15}m
                          </td>
                          <td className="p-3 px-4 text-right">
                            <Link
                              to={`/practice/${(q.schema_name || 'ecommerce').toLowerCase()}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md no-underline bg-primary text-white font-bold text-xs"
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
            <div className="mb-6">
              <h2 className="text-lg font-extrabold m-0 mb-1.5 text-text">
                Real Interview Experiences
              </h2>
              <p className="text-muted text-[13px] m-0">
                Reported by SQL candidates at {companyName}.
              </p>
            </div>
            {kb?.experiences && kb.experiences.length > 0 ? (
              <div className="flex flex-col gap-3.5">
                {kb.experiences.map((exp, i) => (
                  <div
                    key={i}
                    className="p-5 px-6 rounded-lg bg-surface border border-border border-l-[3px] border-l-primary"
                  >
                    <p className="text-sm leading-[1.75] text-text m-0 mb-2.5">
                      {exp}
                    </p>
                    <div className="text-xs text-muted">
                      — {companyName} Interview Candidate
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-[60px] text-center text-muted">
                <div className="text-[15px] font-bold mb-2 text-text">
                  No experiences yet
                </div>
                <div className="text-[13px]">No experiences available for this company yet.</div>
              </div>
            )}
          </div>
        )}

        {/* ━━ ROADMAP ━━ */}
        {activeTab === 'roadmap' && (
          <div>
            <div className="mb-7">
              <h2 className="text-lg font-extrabold m-0 mb-1.5 text-text">
                Learning Path for {companyName}
              </h2>
              <p className="text-muted text-[13px] m-0">
                Master these topics in order to be ready for {companyName} SQL interviews.
              </p>
            </div>
            {kb?.recommendedTopics && kb.recommendedTopics.length > 0 ? (
              <div className="relative">
                <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-border" />
                <div className="flex flex-col gap-3.5">
                  {kb.recommendedTopics.map((topic, i) => (
                    <div
                      key={i}
                      className="flex gap-4 items-start pl-2"
                    >
                      <div className="w-10 h-10 rounded-full shrink-0 bg-primary flex items-center justify-center text-white font-extrabold text-sm z-[1]">
                        {i + 1}
                      </div>
                      <div className="flex-1 p-3.5 px-4.5 bg-surface border border-border rounded-lg flex items-center gap-4">
                        <div className="flex-1">
                          <div className="font-bold text-sm text-text mb-1">
                            {topic}
                          </div>
                          <div className="text-xs text-muted">
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
                          className="shrink-0 px-3.5 py-1.5 rounded-md no-underline bg-primary-muted text-primary border border-primary-light font-bold text-xs flex items-center gap-1"
                        >
                          Practice <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-[60px] text-center text-muted">
                <div className="text-[15px] font-bold mb-2 text-text">
                  Learning path not available
                </div>
                <div className="text-[13px]">
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
