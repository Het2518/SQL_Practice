import React, { useState, useMemo, useEffect } from 'react';
import { DB_INFO } from '@/data/schemas';
import { supabase } from '@/lib/supabase';

const ALL_KEYWORDS = [
  'Select', 'Where', 'Order By', 'Group By', 'Having',
  'Join', 'Left Join', 'Subquery', 'CTE', 'Recursive CTE',
  'Window Function', 'Rank', 'Row Number', 'Lag', 'Lead',
  'Case', 'Union', 'Insert', 'Update', 'Delete',
  'Date Function', 'String Function', 'Null Handling',
];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const DB_NAMES = Object.keys(DB_INFO);

const DIFF_COLORS = {
  easy:   { color: 'var(--success)',  bg: 'var(--success-muted)' },
  medium: { color: 'var(--warning)',  bg: 'var(--warning-muted)' },
  hard:   { color: 'var(--error)',    bg: 'var(--error-muted)' },
};

export const QuestionBrowser = React.memo(function QuestionBrowser({
  questions, progress, currentQuestionId, onSelectQuestion, onClose,
}) {
  const [search, setSearch]                     = useState('');
  const [selectedDbs, setSelectedDbs]           = useState(new Set());
  const [selectedDiffs, setSelectedDiffs]       = useState(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState(new Set());
  const [selectedKeywords, setSelectedKeywords] = useState(new Set());
  const [selectedTopics, setSelectedTopics]     = useState(new Set());
  const [selectedCompanies, setSelectedCompanies] = useState(new Set());
  const [dynamicCompanies, setDynamicCompanies] = useState([]);
  const [qCompanyMap, setQCompanyMap]           = useState({});

  const dynamicTopics = useMemo(() => {
    const topics = new Set();
    questions.forEach(q => q.keywords?.forEach(k => {
      if (k.startsWith('topic:')) topics.add(k.replace('topic:', ''));
    }));
    return Array.from(topics).sort();
  }, [questions]);

  useEffect(() => {
    supabase.from('question_company_mapping')
      .select(`questions(prompt), companies(name)`)
      .then(({ data }) => {
        if (!data) return;
        const comps = new Set();
        const map = {};
        data.forEach(row => {
          const cName = row.companies?.name;
          const qPrompt = row.questions?.prompt;
          if (cName && qPrompt) {
            comps.add(cName);
            if (!map[qPrompt]) map[qPrompt] = new Set();
            map[qPrompt].add(cName);
          }
        });
        setDynamicCompanies(Array.from(comps).sort());
        setQCompanyMap(map);
      });
  }, []);

  const toggle = (set, item) => {
    const next = new Set(set);
    next.has(item) ? next.delete(item) : next.add(item);
    return next;
  };

  const filtered = useMemo(() => questions.filter(q => {
    if (selectedDbs.size > 0 && !selectedDbs.has(q.db)) return false;
    if (selectedDiffs.size > 0 && !selectedDiffs.has(q.difficulty)) return false;
    const status = progress[q.id] ?? 'incomplete';
    if (selectedStatuses.size > 0 && !selectedStatuses.has(status)) return false;
    if (selectedKeywords.size > 0) {
      const kws = q.keywords?.filter(k => !k.startsWith('company:') && !k.startsWith('topic:')) || [];
      if (!kws.some(k => selectedKeywords.has(k))) return false;
    }
    if (selectedTopics.size > 0) {
      const tops = q.keywords?.filter(k => k.startsWith('topic:')).map(k => k.replace('topic:', '')) || [];
      if (!tops.some(t => selectedTopics.has(t))) return false;
    }
    if (selectedCompanies.size > 0) {
      const qComps = qCompanyMap[q.prompt] ? Array.from(qCompanyMap[q.prompt]) : [];
      if (!qComps.some(c => selectedCompanies.has(c))) return false;
    }
    if (search && !q.prompt.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [questions, progress, selectedDbs, selectedDiffs, selectedStatuses, selectedKeywords, selectedTopics, selectedCompanies, search, qCompanyMap]);

  const stats = useMemo(() => {
    const complete  = questions.filter(q => progress[q.id] === 'complete').length;
    const attempted = questions.filter(q => progress[q.id] === 'attempted').length;
    return { complete, attempted };
  }, [questions, progress]);

  const hasFilters = selectedDbs.size > 0 || selectedDiffs.size > 0 || selectedStatuses.size > 0
    || selectedKeywords.size > 0 || selectedTopics.size > 0 || selectedCompanies.size > 0;

  const clearAll = () => {
    setSelectedDbs(new Set()); setSelectedDiffs(new Set()); setSelectedStatuses(new Set());
    setSelectedKeywords(new Set()); setSelectedTopics(new Set()); setSelectedCompanies(new Set());
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: '100%', maxWidth: 1080, height: '88vh',
        background: 'var(--surface)', borderRadius: 12, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        border: '1px solid var(--border)', boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px',
          height: 52, borderBottom: '1px solid var(--border)', flexShrink: 0,
          background: 'var(--surface)',
        }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Question Library</span>
            <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--muted)' }}>
              {stats.complete} solved · {stats.attempted} attempted
            </span>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', width: 280 }}>
            <input
              type="search"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '7px 12px', border: '1px solid var(--border)',
                borderRadius: 7, background: 'var(--surface-2)', color: 'var(--text)',
                fontFamily: 'var(--font-sans)', fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)',
              cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* ── Body: Sidebar + List ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Sidebar */}
          <div style={{
            width: 220, flexShrink: 0, borderRight: '1px solid var(--border)',
            overflowY: 'auto', padding: '16px 14px', background: 'var(--bg)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Filters
              </span>
              {hasFilters && (
                <button onClick={clearAll} style={{ fontSize: 11, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                  Clear all
                </button>
              )}
            </div>

            <FilterGroup title="Database">
              {DB_NAMES.map(db => (
                <FilterChip
                  key={db}
                  label={DB_INFO[db].label}
                  active={selectedDbs.has(db)}
                  onClick={() => setSelectedDbs(toggle(selectedDbs, db))}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Difficulty">
              {DIFFICULTIES.map(d => (
                <FilterChip
                  key={d}
                  label={d.toUpperCase()}
                  active={selectedDiffs.has(d)}
                  onClick={() => setSelectedDiffs(toggle(selectedDiffs, d))}
                  activeColor={DIFF_COLORS[d].color}
                  activeBg={DIFF_COLORS[d].bg}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Status">
              {['complete', 'attempted', 'incomplete'].map(s => (
                <FilterChip
                  key={s}
                  label={s.charAt(0).toUpperCase() + s.slice(1)}
                  active={selectedStatuses.has(s)}
                  onClick={() => setSelectedStatuses(toggle(selectedStatuses, s))}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="SQL Concepts">
              {ALL_KEYWORDS.map(kw => (
                <FilterChip
                  key={kw}
                  label={kw}
                  active={selectedKeywords.has(kw)}
                  onClick={() => setSelectedKeywords(toggle(selectedKeywords, kw))}
                />
              ))}
            </FilterGroup>

            {dynamicTopics.length > 0 && (
              <FilterGroup title="Topics">
                {dynamicTopics.map(t => (
                  <FilterChip key={t} label={t} active={selectedTopics.has(t)} onClick={() => setSelectedTopics(toggle(selectedTopics, t))} />
                ))}
              </FilterGroup>
            )}

            {dynamicCompanies.length > 0 && (
              <FilterGroup title="Company">
                {dynamicCompanies.map(c => (
                  <FilterChip key={c} label={c} active={selectedCompanies.has(c)} onClick={() => setSelectedCompanies(toggle(selectedCompanies, c))} />
                ))}
              </FilterGroup>
            )}
          </div>

          {/* Question list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* Count row */}
            <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', fontWeight: 500, background: 'var(--surface-2)' }}>
              {filtered.length} of {questions.length} questions
              {search && <span style={{ marginLeft: 8, color: 'var(--primary)' }}>matching "{search}"</span>}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>No questions match</div>
                <div style={{ fontSize: 13 }}>Try adjusting your search or filters.</div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                  <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ width: 32, padding: '8px 10px', textAlign: 'center' }} />
                    <th style={{ width: 52, padding: '8px 8px', textAlign: 'left', fontWeight: 700, fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>#</th>
                    <th style={{ width: 130, padding: '8px 8px', textAlign: 'left', fontWeight: 700, fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Database</th>
                    <th style={{ width: 76, padding: '8px 8px', textAlign: 'left', fontWeight: 700, fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Level</th>
                    <th style={{ padding: '8px 8px 8px 0', textAlign: 'left', fontWeight: 700, fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Question</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(q => {
                    const status   = progress[q.id] ?? 'incomplete';
                    const isCurrent = q.id === currentQuestionId;
                    const diff = DIFF_COLORS[q.difficulty] || DIFF_COLORS.easy;

                    return (
                      <tr
                        key={q.id}
                        onClick={() => { onSelectQuestion(q); onClose(); }}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer',
                          background: isCurrent ? 'var(--primary-muted)' : 'var(--surface)',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = 'var(--surface-2)'; }}
                        onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'var(--surface)'; }}
                      >
                        {/* Status dot */}
                        <td style={{ padding: '10px 10px', textAlign: 'center', width: 32 }}>
                          <span style={{
                            display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                            background: status === 'complete' ? 'var(--success)' : status === 'attempted' ? 'var(--warning)' : 'var(--border)',
                          }} />
                        </td>

                        {/* Question # */}
                        <td style={{ padding: '10px 8px', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>
                          {q.id}
                        </td>

                        {/* DB name */}
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {DB_INFO[q.db]?.label || q.db}
                          </span>
                        </td>

                        {/* Difficulty */}
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                            color: diff.color, background: diff.bg, letterSpacing: '0.04em',
                          }}>
                            {q.difficulty?.toUpperCase()}
                          </span>
                        </td>

                        {/* Prompt */}
                        <td style={{
                          padding: '10px 8px 10px 0',
                          color: isCurrent ? 'var(--primary)' : 'var(--text)',
                          fontWeight: isCurrent ? 600 : 400,
                          maxWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                        }}>
                          {q.prompt}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

function FilterGroup({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {children}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick, activeColor, activeBg }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 11, fontWeight: 600,
        fontFamily: 'var(--font-sans)', border: '1px solid', transition: 'all 0.1s',
        background: active ? (activeBg || 'var(--primary)') : 'var(--surface)',
        color:      active ? (activeColor || '#fff')       : 'var(--text-secondary)',
        borderColor: active ? (activeColor || 'var(--primary)') : 'var(--border)',
      }}
    >
      {label}
    </button>
  );
}