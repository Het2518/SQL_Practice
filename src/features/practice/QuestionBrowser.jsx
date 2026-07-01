import React, { useState, useMemo, useEffect } from 'react';
import { DB_INFO } from '@/data/schemas';
import { supabase } from '@/lib/supabase';
import { Search, X, Filter, CheckCircle2, CircleDashed, LayoutGrid } from 'lucide-react';

const ALL_KEYWORDS = ['Select', 'Where', 'Order By', 'Group By', 'Having', 'Join', 'Left Join', 'Subquery', 'CTE', 'Recursive CTE', 'Window Function', 'Rank', 'Row Number', 'Lag', 'Lead', 'Case', 'Union', 'Insert', 'Update', 'Delete', 'Date Function', 'String Function', 'Null Handling'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const DB_NAMES = Object.keys(DB_INFO);

export const QuestionBrowser = React.memo(function QuestionBrowser({
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

  const [dynamicCompanies, setDynamicCompanies] = useState([]);
  const [qCompanyMap, setQCompanyMap] = useState({});

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const { data, error } = await supabase
          .from('question_company_mapping')
          .select(`
            questions ( prompt ),
            companies ( name )
          `);
        if (data && !error) {
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
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchCompanies();
  }, []);

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
         const qComps = qCompanyMap[q.prompt] ? Array.from(qCompanyMap[q.prompt]) : [];
         if (!qComps.some(c => selectedCompanies.has(c))) return false;
      }

      if (search && !q.prompt.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [questions, progress, selectedDbs, selectedDiffs, selectedStatuses, selectedKeywords, selectedTopics, selectedCompanies, search, qCompanyMap]);

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

  const hasFilters = selectedDbs.size > 0 || selectedDiffs.size > 0 || selectedStatuses.size > 0 || selectedKeywords.size > 0 || selectedTopics.size > 0 || selectedCompanies.size > 0;

  return (
    <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.6)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{
        maxWidth: 1100,
        width: '95vw',
        height: '85vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexShrink: 0
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
            padding: 10,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
          }}>
            <LayoutGrid size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 18, margin: 0, letterSpacing: '-0.02em' }}>Question Library</h2>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={12} color="var(--success)" /> {stats.complete} complete
              <span style={{ color: 'var(--border)' }}>|</span>
              <CircleDashed size={12} color="var(--warning)" /> {stats.attempted} attempted
            </div>
          </div>
          
          <div style={{ flex: 1 }} />
          
          <div style={{ position: 'relative', width: 300 }}>
            <Search size={16} color="var(--muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              id="question-search" 
              type="search" 
              placeholder="Search concepts or prompts..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{
                width: '100%',
                padding: '10px 16px 10px 36px',
                borderRadius: 99,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                fontSize: 14,
                outline: 'none',
                transition: 'all 0.2s ease',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                color: 'var(--text)'
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px var(--primary-muted)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)';
              }}
            />
          </div>
          
          <button onClick={onClose} className="btn-icon" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: 'var(--bg)' }}>
          {/* Sidebar Filters */}
          <div style={{
            width: 260,
            borderRight: '1px solid var(--border)',
            overflowY: 'auto',
            padding: '20px 16px',
            flexShrink: 0,
            background: 'var(--surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={14} /> Filters
              </div>
              {hasFilters && (
                <button 
                  onClick={() => {
                    setSelectedDbs(new Set()); setSelectedDiffs(new Set()); setSelectedStatuses(new Set());
                    setSelectedKeywords(new Set()); setSelectedTopics(new Set()); setSelectedCompanies(new Set());
                  }} 
                  style={{ fontSize: 11, color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Clear All
                </button>
              )}
            </div>

            <FilterSection title="Database">
              {DB_NAMES.map(db => (
                <FilterPill key={db} label={`${DB_INFO[db].icon} ${DB_INFO[db].label}`} checked={selectedDbs.has(db)} onChange={() => setSelectedDbs(toggleSet(selectedDbs, db))} />
              ))}
            </FilterSection>

            <FilterSection title="Difficulty">
              {DIFFICULTIES.map(d => (
                <FilterPill key={d} label={d.toUpperCase()} checked={selectedDiffs.has(d)} onChange={() => setSelectedDiffs(toggleSet(selectedDiffs, d))} colorClass={`pill-${d}`} />
              ))}
            </FilterSection>

            <FilterSection title="Status">
              {['complete', 'attempted', 'incomplete'].map(s => (
                <FilterPill key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} checked={selectedStatuses.has(s)} onChange={() => setSelectedStatuses(toggleSet(selectedStatuses, s))} />
              ))}
            </FilterSection>

            <FilterSection title="Syntax Keywords">
              {ALL_KEYWORDS.map(kw => (
                <FilterPill key={kw} label={kw} checked={selectedKeywords.has(kw)} onChange={() => setSelectedKeywords(toggleSet(selectedKeywords, kw))} />
              ))}
            </FilterSection>

            {dynamicTopics.length > 0 && (
              <FilterSection title="Topic">
                {dynamicTopics.map(t => (
                  <FilterPill key={t} label={t} checked={selectedTopics.has(t)} onChange={() => setSelectedTopics(toggleSet(selectedTopics, t))} />
                ))}
              </FilterSection>
            )}

            {dynamicCompanies.length > 0 && (
              <FilterSection title="Company">
                {dynamicCompanies.map(c => (
                  <FilterPill key={c} label={c} checked={selectedCompanies.has(c)} onChange={() => setSelectedCompanies(toggleSet(selectedCompanies, c))} />
                ))}
              </FilterSection>
            )}
          </div>

          {/* Question List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', position: 'relative' }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, fontWeight: 500 }}>
              Showing {filtered.length} of {questions.length} questions
            </div>
            
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Filter size={48} color="var(--border)" style={{ marginBottom: 16 }} />
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>No questions found</div>
                <div style={{ color: 'var(--muted)', marginTop: 8 }}>Try adjusting your search or filters.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map(q => {
                  const status = progress[q.id] ?? 'incomplete';
                  const isCurrent = q.id === currentQuestionId;
                  
                  return (
                    <div 
                      key={q.id} 
                      id={`q-item-${q.id}`} 
                      onClick={() => { onSelectQuestion(q); onClose(); }} 
                      className="question-browser-card"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px',
                        borderRadius: 12, cursor: 'pointer',
                        background: isCurrent ? 'var(--primary-muted)' : 'var(--surface)',
                        border: `1px solid ${isCurrent ? 'var(--primary)' : 'var(--border)'}`,
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: isCurrent ? '0 4px 12px rgba(59,130,246,0.1)' : '0 2px 4px rgba(0,0,0,0.02)'
                      }} 
                      onMouseEnter={e => {
                        if (!isCurrent) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.06)';
                          e.currentTarget.style.borderColor = 'var(--border-hover)';
                        }
                      }} 
                      onMouseLeave={e => {
                        if (!isCurrent) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                        }
                      }}
                    >
                      <div style={{ width: 12, display: 'flex', justifyContent: 'center' }}>
                        {status === 'complete' ? <CheckCircle2 size={14} color="var(--success)" /> : 
                         status === 'attempted' ? <CircleDashed size={14} color="var(--warning)" /> : 
                         <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border)' }} />}
                      </div>
                      
                      <div style={{ width: 40, fontSize: 12, color: 'var(--muted)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        #{q.id}
                      </div>
                      
                      <div style={{ width: 130, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {DB_INFO[q.db].icon} {DB_INFO[q.db].label}
                      </div>
                      
                      <div style={{ width: 70 }}>
                        <span className={`pill pill-${q.difficulty}`} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px' }}>
                          {q.difficulty.toUpperCase()}
                        </span>
                      </div>
                      
                      <div style={{ flex: 1, fontSize: 14, color: isCurrent ? 'var(--primary)' : 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {q.prompt}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

function FilterSection({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

function FilterPill({ label, checked, onChange, colorClass }) {
  return (
    <label 
      className={colorClass && !checked ? colorClass : ''}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '6px 12px', borderRadius: 99, cursor: 'pointer',
        fontSize: 12, fontWeight: 600,
        background: checked ? 'var(--primary)' : 'var(--surface-2)',
        color: checked ? '#fff' : 'var(--text-secondary)',
        border: `1px solid ${checked ? 'var(--primary)' : 'var(--border)'}`,
        transition: 'all 0.15s ease',
        userSelect: 'none'
      }}
      onMouseEnter={e => {
        if (!checked) e.currentTarget.style.borderColor = 'var(--text)';
      }}
      onMouseLeave={e => {
        if (!checked) e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
      {label}
    </label>
  );
}