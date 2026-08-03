import React, { useState, useMemo, useEffect } from 'react';
import { DB_INFO } from '@/data/schemas';
import { api } from '@/lib/api';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

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
  easy:   { className: 'text-success bg-success-muted border-success' },
  medium: { className: 'text-warning bg-warning-muted border-warning' },
  hard:   { className: 'text-error bg-error-muted border-error' },
};

const DIFF_ORDER = { easy: 0, medium: 1, hard: 2 };
const STATUS_ORDER = { complete: 0, attempted: 1, incomplete: 2 };

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ChevronsUpDown size={11} className="opacity-30 shrink-0" />;
  return sortDir === 'asc'
    ? <ChevronUp size={11} className="text-primary shrink-0" />
    : <ChevronDown size={11} className="text-primary shrink-0" />;
}
function SortableTh({ col, sortCol, sortDir, handleSort, children, className = '' }) {
  return (
    <th
      className={`p-2 text-left font-bold text-[10px] text-muted uppercase tracking-[0.07em] cursor-pointer select-none hover:text-text transition-colors ${className}`}
      onClick={() => handleSort(col)}
    >
      <span className="flex items-center gap-1">
        {children}
        <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
      </span>
    </th>
  );
}

export const QuestionBrowser = React.memo(function QuestionBrowser({
  questions, progress, currentQuestionId, onSelectQuestion, onClose,
}) {
  const [search, setSearch]                     = useState('');
  const [debouncedSearch, setDebouncedSearch]   = useState('');
  const [selectedDbs, setSelectedDbs]           = useState(new Set());
  const [selectedDiffs, setSelectedDiffs]       = useState(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState(new Set());
  const [selectedKeywords, setSelectedKeywords] = useState(new Set());
  const [selectedTopics, setSelectedTopics]     = useState(new Set());
  const [selectedCompanies, setSelectedCompanies] = useState(new Set());
  const [dynamicCompanies, setDynamicCompanies] = useState([]);
  const [qCompanyMap, setQCompanyMap]           = useState({});
  const [sortCol, setSortCol]                   = useState('id');
  const [sortDir, setSortDir]                   = useState('asc');

  const dynamicTopics = useMemo(() => {
    const topics = new Set();
    questions.forEach(q => q.keywords?.forEach(k => {
      if (k.startsWith('topic:')) topics.add(k.replace('topic:', ''));
    }));
    return Array.from(topics).sort();
  }, [questions]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const companyNames = new Set();
    const companyMap = {};

    questions.forEach((question) => {
      const companies = (question.keywords || [])
        .filter((keyword) => keyword.startsWith('company:'))
        .map((keyword) => keyword.replace('company:', ''));

      if (companies.length > 0) {
        companyMap[question.prompt] = new Set(companies);
        companies.forEach((company) => companyNames.add(company));
      }
    });

    setDynamicCompanies(Array.from(companyNames).sort());
    setQCompanyMap(companyMap);
  }, [questions]);

  const toggle = (set, item) => {
    const next = new Set(set);
    next.has(item) ? next.delete(item) : next.add(item);
    return next;
  };

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    const base = questions.filter(q => {
      if (selectedDbs.size > 0 && !selectedDbs.has(q.db)) return false;
      if (selectedDiffs.size > 0 && !selectedDiffs.has(q.difficulty)) return false;
      const status = progress[q.id] ?? 'incomplete';
      if (selectedStatuses.size > 0 && !selectedStatuses.has(status)) return false;
      if (selectedKeywords.size > 0) {
        const kws = q.keywords?.filter(k => !k.startsWith('company:') && !k.startsWith('topic:')) || [];
        if (!Array.from(selectedKeywords).some(sk =>
          kws.some(k => k.toLowerCase().includes(sk.toLowerCase()))
        )) return false;
      }
      if (selectedTopics.size > 0) {
        const tops = q.keywords?.filter(k => k.startsWith('topic:')).map(k => k.replace('topic:', '')) || [];
        if (!tops.some(t => selectedTopics.has(t))) return false;
      }
      if (selectedCompanies.size > 0) {
        const qComps = qCompanyMap[q.prompt] ? Array.from(qCompanyMap[q.prompt]) : [];
        if (!qComps.some(c => selectedCompanies.has(c))) return false;
      }
      if (debouncedSearch && !q.prompt.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      return true;
    });

    return [...base].sort((a, b) => {
      let av, bv;
      if (sortCol === 'id') {
        // Compound key: db alphabetical + id numerical
        av = a.db + '_' + String(a.id).padStart(4, '0');
        bv = b.db + '_' + String(b.id).padStart(4, '0');
      } else if (sortCol === 'db') {
        av = (DB_INFO[a.db]?.label || a.db).toLowerCase();
        bv = (DB_INFO[b.db]?.label || b.db).toLowerCase();
      } else if (sortCol === 'difficulty') {
        av = DIFF_ORDER[a.difficulty] ?? 0;
        bv = DIFF_ORDER[b.difficulty] ?? 0;
      } else if (sortCol === 'status') {
        av = STATUS_ORDER[progress[a.id] ?? 'incomplete'] ?? 2;
        bv = STATUS_ORDER[progress[b.id] ?? 'incomplete'] ?? 2;
      } else if (sortCol === 'prompt') {
        av = (a.prompt || '').toLowerCase();
        bv = (b.prompt || '').toLowerCase();
      } else {
        return 0;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [questions, progress, selectedDbs, selectedDiffs, selectedStatuses, selectedKeywords, selectedTopics, selectedCompanies, debouncedSearch, qCompanyMap, sortCol, sortDir]);

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
      className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-6"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[1080px] h-[88vh] bg-surface rounded-xl overflow-hidden flex flex-col border border-border shadow-[0_24px_48px_rgba(0,0,0,0.25)]">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 px-5 h-[52px] border-b border-border shrink-0 bg-surface">
          <div className="flex-1">
            <span className="text-sm font-bold text-text">Question Library</span>
            <span className="ml-3 text-xs text-muted">
              {stats.complete} solved · {stats.attempted} attempted
            </span>
          </div>

          {/* Search */}
          <div className="relative w-[280px]">
            <input
              type="search"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 border border-border rounded-md bg-surface-2 text-text font-sans text-[13px] outline-none box-border focus:border-primary transition-colors"
            />
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center bg-surface-2 border border-border cursor-pointer text-text-secondary text-base leading-none hover:bg-surface-3 hover:text-text transition-colors"
          >
            ×
          </button>
        </div>

        {/* ── Body: Sidebar + List ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-[220px] shrink-0 border-r border-border overflow-y-auto px-3.5 py-4 bg-bg">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
                Filters
              </span>
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="text-[11px] text-primary bg-transparent border-none cursor-pointer font-semibold font-sans hover:opacity-70 transition-opacity"
                >
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
                  activeClassName={DIFF_COLORS[d].className}
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
          <div className="flex-1 overflow-y-auto">
            {/* Count row */}
            <div className="px-5 py-2.5 border-b border-border text-xs text-muted font-medium bg-surface-2">
              {filtered.length} of {questions.length} questions
              {debouncedSearch && <span className="ml-2 text-primary">matching "{debouncedSearch}"</span>}
            </div>

            {filtered.length === 0 ? (
              <div className="p-16 text-center text-muted">
                <div className="text-sm font-semibold text-text mb-1.5">No questions match</div>
                <div className="text-[13px]">Try adjusting your search or filters.</div>
              </div>
            ) : (
              <table className="w-full border-collapse text-[13px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-surface-2 border-b border-border">
                    <SortableTh col="status" sortCol={sortCol} sortDir={sortDir} handleSort={handleSort} className="w-8 px-2.5" />
                    <SortableTh col="id" sortCol={sortCol} sortDir={sortDir} handleSort={handleSort} className="w-[52px]">#</SortableTh>
                    <SortableTh col="db" sortCol={sortCol} sortDir={sortDir} handleSort={handleSort} className="w-[130px]">Database</SortableTh>
                    <SortableTh col="difficulty" sortCol={sortCol} sortDir={sortDir} handleSort={handleSort} className="w-[76px]">Level</SortableTh>
                    <SortableTh col="prompt" sortCol={sortCol} sortDir={sortDir} handleSort={handleSort} className="">Question</SortableTh>
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
                        className={`border-b border-border cursor-pointer transition-colors duration-100 ${isCurrent ? 'bg-primary/5' : 'bg-surface hover:bg-surface-2'}`}
                      >
                        {/* Status dot */}
                        <td className="p-2.5 text-center w-8">
                          <span className={`inline-block w-2 h-2 rounded-full ${status === 'complete' ? 'bg-success' : status === 'attempted' ? 'bg-warning' : 'bg-border'}`} />
                        </td>

                        {/* Question # */}
                        <td className="p-2 text-muted tabular-nums text-xs">
                          {q.id}
                        </td>

                        {/* DB name */}
                        <td className="p-2">
                          <span className="text-[11px] font-semibold text-text-secondary">
                            {DB_INFO[q.db]?.label || q.db}
                          </span>
                        </td>

                        {/* Difficulty */}
                        <td className="p-2">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] tracking-[0.04em] ${diff.className}`}
                          >
                            {q.difficulty?.toUpperCase()}
                          </span>
                        </td>

                        {/* Prompt */}
                        <td className={`py-2.5 pr-3 pl-0 max-w-0 overflow-hidden whitespace-nowrap text-ellipsis ${isCurrent ? 'text-primary font-semibold' : 'text-text font-normal'}`}>
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
    <div className="mb-5">
      <div className="text-[10px] font-bold text-muted uppercase tracking-[0.08em] mb-2">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {children}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick, activeClassName }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-[5px] cursor-pointer text-[11px] font-semibold font-sans border transition-all duration-100 ${
        active && activeClassName
          ? activeClassName
          : active
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-surface text-text-secondary border-border hover:bg-surface-2 hover:text-text hover:border-text-secondary'
      }`}
    >
      {label}
    </button>
  );
}

