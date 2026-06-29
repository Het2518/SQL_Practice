import React, { useState, useMemo } from 'react';
import { DB_INFO } from '../types';
const ALL_KEYWORDS = ['Select', 'Where', 'Order By', 'Group By', 'Having', 'Join', 'Left Join', 'Subquery', 'CTE', 'Recursive CTE', 'Window Function', 'Rank', 'Row Number', 'Lag', 'Lead', 'Case', 'Union', 'Insert', 'Update', 'Delete', 'Date Function', 'String Function', 'Null Handling'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const DB_NAMES = Object.keys(DB_INFO);
export function QuestionBrowser({
  questions,
  progress,
  currentQuestionId,
  onSelectQuestion,
  onClose
}) {
  const [search, setSearch] = useState('');
  const [selectedDbs, setSelectedDbs] = useState(new Set());
  const [selectedDiffs, setSelectedDiffs] = useState(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState(new Set());
  const [selectedKeywords, setSelectedKeywords] = useState(new Set());
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [selectedCompanies, setSelectedCompanies] = useState(new Set());

  const dynamicTopics = useMemo(() => {
    const topics = new Set();
    questions.forEach(q => {
      q.keywords?.forEach(k => {
        if (k.startsWith('topic:')) topics.add(k.replace('topic:', ''));
      });
    });
    return Array.from(topics).sort();
  }, [questions]);

  const dynamicCompanies = useMemo(() => {
    const comps = new Set();
    questions.forEach(q => {
      q.keywords?.forEach(k => {
        if (k.startsWith('company:')) comps.add(k.replace('company:', ''));
      });
    });
    return Array.from(comps).sort();
  }, [questions]);

  const toggleSet = (set, item) => {
    const next = new Set(set);
    if (next.has(item)) next.delete(item); else next.add(item);
    return next;
  };
  const filtered = useMemo(() => {
    return questions.filter(q => {
      if (selectedDbs.size > 0 && !selectedDbs.has(q.db)) return false;
      if (selectedDiffs.size > 0 && !selectedDiffs.has(q.difficulty)) return false;
      const status = progress[q.id] ?? 'incomplete';
      if (selectedStatuses.size > 0 && !selectedStatuses.has(status)) return false;
      
      if (selectedKeywords.size > 0) {
         const syntaxKws = q.keywords?.filter(k => !k.startsWith('company:') && !k.startsWith('topic:')) || [];
         if (!syntaxKws.some(k => selectedKeywords.has(k))) return false;
      }
      
      if (selectedTopics.size > 0) {
         const qTopics = q.keywords?.filter(k => k.startsWith('topic:')).map(k => k.replace('topic:', '')) || [];
         if (!qTopics.some(t => selectedTopics.has(t))) return false;
      }
      
      if (selectedCompanies.size > 0) {
         const qComps = q.keywords?.filter(k => k.startsWith('company:')).map(k => k.replace('company:', '')) || [];
         if (!qComps.some(c => selectedCompanies.has(c))) return false;
      }

      if (search && !q.prompt.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [questions, progress, selectedDbs, selectedDiffs, selectedStatuses, selectedKeywords, selectedTopics, selectedCompanies, search]);
  const stats = useMemo(() => {
    const total = questions.length;
    const complete = questions.filter(q => progress[q.id] === 'complete').length;
    const attempted = questions.filter(q => progress[q.id] === 'attempted').length;
    return {
      total,
      complete,
      attempted,
      incomplete: total - complete - attempted
    };
  }, [questions, progress]);
  return <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{
      maxWidth: 1000
    }}>
        {/* Header */}
        <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-2)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0
      }}>
          <span style={{
          fontSize: 20
        }}>📋</span>
          <div>
            <div style={{
            fontWeight: 700,
            fontSize: 16
          }}>Question Browser</div>
            <div style={{
            fontSize: 12,
            color: 'var(--muted)'
          }}>
              {stats.complete}/{stats.total} complete · {stats.attempted} attempted
            </div>
          </div>
          <div style={{
          flex: 1
        }} />
          <input id="question-search" type="search" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} style={{
          width: 220
        }} />
          <button onClick={onClose} className="btn btn-ghost btn-icon">✕</button>
        </div>

        <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
      }}>
          {/* Filter Panel */}
          <div style={{
          width: 220,
          borderRight: '1px solid var(--border)',
          overflowY: 'auto',
          padding: '12px 14px',
          flexShrink: 0,
          background: 'var(--surface)'
        }}>
            {/* Database Filter */}
            <FilterSection title="Database">
              {DB_NAMES.map(db => <FilterCheckbox key={db} label={`${DB_INFO[db].icon} ${DB_INFO[db].label}`} checked={selectedDbs.has(db)} onChange={() => setSelectedDbs(toggleSet(selectedDbs, db))} />)}
            </FilterSection>

            <hr className="divider" />

            {/* Difficulty Filter */}
            <FilterSection title="Difficulty">
              {DIFFICULTIES.map(d => <FilterCheckbox key={d} label={<span className={`pill pill-${d}`}>{d.toUpperCase()}</span>} checked={selectedDiffs.has(d)} onChange={() => setSelectedDiffs(toggleSet(selectedDiffs, d))} />)}
            </FilterSection>

            <hr className="divider" />

            {/* Status Filter */}
            <FilterSection title="Status">
              {['complete', 'attempted', 'incomplete'].map(s => <FilterCheckbox key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} checked={selectedStatuses.has(s)} onChange={() => setSelectedStatuses(toggleSet(selectedStatuses, s))} />)}
            </FilterSection>

            <hr className="divider" />

            {/* Keyword Filter */}
            <FilterSection title="Syntax Keywords">
              {ALL_KEYWORDS.map(kw => <FilterCheckbox key={kw} label={kw} checked={selectedKeywords.has(kw)} onChange={() => setSelectedKeywords(toggleSet(selectedKeywords, kw))} />)}
            </FilterSection>

            {dynamicTopics.length > 0 && (
              <>
                <hr className="divider" />
                <FilterSection title="Topic">
                  {dynamicTopics.map(t => <FilterCheckbox key={t} label={t} checked={selectedTopics.has(t)} onChange={() => setSelectedTopics(toggleSet(selectedTopics, t))} />)}
                </FilterSection>
              </>
            )}

            {dynamicCompanies.length > 0 && (
              <>
                <hr className="divider" />
                <FilterSection title="Company">
                  {dynamicCompanies.map(c => <FilterCheckbox key={c} label={c} checked={selectedCompanies.has(c)} onChange={() => setSelectedCompanies(toggleSet(selectedCompanies, c))} />)}
                </FilterSection>
              </>
            )}

            {(selectedDbs.size > 0 || selectedDiffs.size > 0 || selectedStatuses.size > 0 || selectedKeywords.size > 0 || selectedTopics.size > 0 || selectedCompanies.size > 0 || search) && <button onClick={() => {
            setSelectedDbs(new Set());
            setSelectedDiffs(new Set());
            setSelectedStatuses(new Set());
            setSelectedKeywords(new Set());
            setSelectedTopics(new Set());
            setSelectedCompanies(new Set());
            setSearch('');
          }} className="btn btn-ghost" style={{
            width: '100%',
            marginTop: 8,
            fontSize: 11
          }}>
                ✕ Clear Filters
              </button>}
          </div>

          {/* Question List */}
          <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 12
        }}>
            <div style={{
            fontSize: 12,
            color: 'var(--muted)',
            marginBottom: 10
          }}>
              Showing {filtered.length} of {questions.length} questions
            </div>
            {filtered.length === 0 ? <div style={{
            textAlign: 'center',
            padding: 40,
            color: 'var(--muted)'
          }}>
                No questions match your filters.
              </div> : filtered.map(q => {
            const status = progress[q.id] ?? 'incomplete';
            const isCurrent = q.id === currentQuestionId;
            return <div key={q.id} id={`q-item-${q.id}`} onClick={() => {
              onSelectQuestion(q);
              onClose();
            }} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '6px 12px',
              borderRadius: 'var(--radius)',
              marginBottom: 2,
              cursor: 'pointer',
              background: isCurrent ? 'var(--primary-muted)' : 'transparent',
              border: `1px solid ${isCurrent ? 'var(--border-hover)' : 'transparent'}`,
              transition: 'all 0.15s'
            }} onMouseEnter={e => {
              if (!isCurrent) e.currentTarget.style.background = 'var(--surface-2)';
            }} onMouseLeave={e => {
              if (!isCurrent) e.currentTarget.style.background = 'transparent';
            }}>
                    {/* Status dot */}
                    <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                flexShrink: 0,
                background: status === 'complete' ? 'var(--success)' : status === 'attempted' ? 'var(--warning)' : 'var(--border)'
              }} />
                    <span style={{
                width: 28,
                fontSize: 11,
                color: 'var(--muted)',
                fontFamily: 'var(--font-mono)'
              }}>#{q.id}</span>
                    <span style={{
                width: 110,
                fontSize: 11,
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                      {DB_INFO[q.db].icon} {DB_INFO[q.db].label}
                    </span>
                    <div style={{
                width: 60
              }}>
                      <span className={`pill pill-${q.difficulty}`} style={{
                  fontSize: 9,
                  padding: '2px 6px'
                }}>
                        {q.difficulty.toUpperCase()}
                      </span>
                    </div>
                    <div style={{
                flex: 1,
                fontSize: 12,
                color: 'var(--text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                      {q.prompt}
                    </div>
                  </div>;
          })}
          </div>
        </div>
      </div>
    </div>;
}
function FilterSection({
  title,
  children
}) {
  return <div style={{
    marginBottom: 8
  }}>
      <div style={{
      fontSize: 10,
      fontWeight: 700,
      color: 'var(--muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: 6
    }}>
        {title}
      </div>
      <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }}>
        {children}
      </div>
    </div>;
}
function FilterCheckbox({
  label,
  checked,
  onChange
}) {
  return <label style={{
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    cursor: 'pointer',
    padding: '2px 0'
  }}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span style={{
      fontSize: 12,
      color: 'var(--text-secondary)'
    }}>{label}</span>
    </label>;
}