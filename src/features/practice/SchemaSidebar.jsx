import React, { useState, useEffect } from 'react';
import { DB_INFO } from '@/types';
import { analyzeNormalForm } from '@/utils/sqlAnalysis';

// ─── Icons (inline SVG to avoid extra deps) ──────────────────────────────────
const ChevronIcon = ({ open }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'none' }}>
    <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const learningResources = [
  { label: 'SQL Joins Explained', url: 'https://mode.com/sql-tutorial/sql-joins/', icon: '🔗' },
  { label: 'Window Functions Guide', url: 'https://mode.com/sql-tutorial/sql-window-functions/', icon: '📊' },
  { label: 'CTEs & Recursive Queries', url: 'https://www.sqlite.org/lang_with.html', icon: '🔄' },
  { label: 'GROUP BY & HAVING', url: 'https://mode.com/sql-tutorial/sql-group-by/', icon: '📋' },
  { label: 'Date Functions', url: 'https://www.sqlite.org/lang_datefunc.html', icon: '📅' },
  { label: 'String Functions', url: 'https://www.sqlite.org/lang_corefunc.html', icon: '🔤' },
  { label: 'NULL Handling', url: 'https://mode.com/sql-tutorial/sql-is-null/', icon: '⚠️' },
];

export const SchemaSidebar = React.memo(function SchemaSidebar({ dbName, executeQuery, onPreviewTable }) {
  const [expandedTables, setExpandedTables] = useState(new Set());
  const [activeTab, setActiveTab] = useState('schema');
  const [liveTables, setLiveTables] = useState({}); // { tableName: [{ name, type, pk, notNull }] }
  const [normalForms, setNormalForms] = useState({});
  const [selectedTables, setSelectedTables] = useState([]);
  const [joinPath, setJoinPath] = useState(null);    // null | 'loading' | array
  const [joinSQL, setJoinSQL] = useState('');

  const dbInfo = DB_INFO[dbName];

  const toggleTable = (tableName) => {
    setExpandedTables(prev => {
      const next = new Set(prev);
      if (next.has(tableName)) next.delete(tableName);
      else next.add(tableName);
      return next;
    });
  };

  useEffect(() => {
    let mounted = true;
    setNormalForms({});
    setLiveTables({});
    setSelectedTables([]);
    setJoinPath(null);
    setJoinSQL('');
    setExpandedTables(new Set());

    if (!executeQuery) return;

    const init = async () => {
      // Get live column data via PRAGMA for each table
      if (dbInfo?.tables) {
        const tableData = {};
        const nfData = {};
        await Promise.all(
          dbInfo.tables.map(async (t) => {
            try {
              const colRes = await executeQuery(`PRAGMA table_info("${t.name}")`);
              if (colRes.rows && colRes.rows.length > 0) {
                tableData[t.name] = colRes.rows.map(row => ({
                  name: row[1],
                  type: row[2] || 'TEXT',
                  notNull: row[3] === 1,
                  pk: row[5] === 1,
                }));
              }
              const nfRes = await analyzeNormalForm(executeQuery, t.name);
              nfData[t.name] = nfRes.nf;
            } catch {}
          })
        );
        if (!mounted) return;
        setLiveTables(tableData);
        setNormalForms(nfData);
      }
    };

    init();
    return () => { mounted = false; };
  }, [executeQuery, dbInfo]);

  // ── Live join path computation (runs fresh PRAGMA queries at selection time) ──
  const computeLiveJoinPath = async (tableA, tableB) => {
    if (!executeQuery) return null;
    try {
      // Fetch column info for both tables directly from the live DB
      const [aRes, bRes] = await Promise.all([
        executeQuery(`PRAGMA table_info("${tableA}")`),
        executeQuery(`PRAGMA table_info("${tableB}")`),
      ]);

      const aCols = (aRes.rows || []).map(r => ({ name: r[1], type: r[2] || 'TEXT', pk: r[5] === 1 }));
      const bCols = (bRes.rows || []).map(r => ({ name: r[1], type: r[2] || 'TEXT', pk: r[5] === 1 }));

      const aPK = aCols.find(c => c.pk)?.name || aCols[0]?.name || 'id';
      const bPK = bCols.find(c => c.pk)?.name || bCols[0]?.name || 'id';

      // Helper: derive candidate table names from a FK column name
      const getCandidates = (colName) => {
        const base = colName.replace(/_id$/i, '').replace(/Id$/, '').toLowerCase();
        return [base, base + 's', base + 'es', base.replace(/y$/, 'ies'), base.replace(/ies$/, 'y')];
      };

      // Strategy 1: tableA has a column pointing to tableB
      for (const col of aCols) {
        if (col.pk) continue;
        const name = col.name.toLowerCase();
        const candidates = getCandidates(name);
        const bNameLower = tableB.toLowerCase();
        if (
          name === `${bNameLower}_id` ||
          name === `${bNameLower.replace(/s$/, '')}_id` ||
          candidates.some(c => c === bNameLower || c === bNameLower.replace(/s$/, ''))
        ) {
          const sql = `FROM ${tableA}\nJOIN ${tableB} ON ${tableA}.${col.name} = ${tableB}.${bPK}`;
          return { path: [{ table: tableA }, { table: tableB, fromCol: col.name, toCol: bPK }], sql };
        }
      }

      // Strategy 2: tableB has a column pointing to tableA
      for (const col of bCols) {
        if (col.pk) continue;
        const name = col.name.toLowerCase();
        const candidates = getCandidates(name);
        const aNameLower = tableA.toLowerCase();
        if (
          name === `${aNameLower}_id` ||
          name === `${aNameLower.replace(/s$/, '')}_id` ||
          candidates.some(c => c === aNameLower || c === aNameLower.replace(/s$/, ''))
        ) {
          const sql = `FROM ${tableA}\nJOIN ${tableB} ON ${tableB}.${col.name} = ${tableA}.${aPK}`;
          return { path: [{ table: tableA }, { table: tableB, fromCol: col.name, toCol: aPK }], sql };
        }
      }

      // Strategy 3: Try intermediate table (multi-hop join)
      const tablesRes = await executeQuery("SELECT name FROM sqlite_master WHERE type='table'");
      const allTables = (tablesRes.rows || []).map(r => r[0]).filter(t => t !== tableA && t !== tableB);
      for (const mid of allTables) {
        const midRes = await executeQuery(`PRAGMA table_info("${mid}")`);  
        const midCols = (midRes.rows || []).map(r => ({ name: r[1], pk: r[5] === 1 }));

        const colToA = midCols.find(c => !c.pk && getCandidates(c.name).some(x => x === tableA.toLowerCase() || x === tableA.toLowerCase().replace(/s$/, '')));
        const colToB = midCols.find(c => !c.pk && getCandidates(c.name).some(x => x === tableB.toLowerCase() || x === tableB.toLowerCase().replace(/s$/, '')));
        if (colToA && colToB) {
          const sql = `FROM ${tableA}\nJOIN ${mid} ON ${tableA}.${aPK} = ${mid}.${colToA.name}\nJOIN ${tableB} ON ${mid}.${colToB.name} = ${tableB}.${bPK}`;
          return {
            path: [{ table: tableA }, { table: mid, fromCol: colToA.name, toCol: aPK }, { table: tableB, fromCol: colToB.name, toCol: bPK }],
            sql
          };
        }
      }

      return null; // no path found
    } catch (err) {
      console.error('computeLiveJoinPath error:', err);
      return null;
    }
  };

  const handleTableSelect = async (e, tableName) => {
    e.stopPropagation();
    let newSelected = [...selectedTables];
    if (newSelected.includes(tableName)) {
      newSelected = newSelected.filter(t => t !== tableName);
    } else {
      newSelected.push(tableName);
      if (newSelected.length > 2) newSelected.shift();
    }
    setSelectedTables(newSelected);
    setJoinPath(null);
    setJoinSQL('');

    if (newSelected.length === 2 && executeQuery) {
      setJoinPath('loading');
      const result = await computeLiveJoinPath(newSelected[0], newSelected[1]);
      if (result) {
        setJoinPath(result.path);
        setJoinSQL(result.sql);
      } else {
        setJoinPath([]); // empty array = no path found
        setJoinSQL('');
      }
    }
  };

  // Legacy: still derive a generatedJoinSQL fallback from the path (if needed)
  const generatedJoinSQL = joinSQL;

  const nfBadgeStyle = (nf) => {
    const colors = { '3NF': '#059669', '2NF': '#d97706', '1NF': '#dc2626', 'Unnormalized': '#7c3aed', 'Unknown': '#6b7280' };
    const color = colors[nf] || '#6b7280';
    return { fontSize: 9, fontWeight: 700, background: `${color}20`, color, padding: '2px 5px', borderRadius: 4, border: `1px solid ${color}40`, flexShrink: 0 };
  };

  const tables = dbInfo?.tables || [];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
      
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
            {dbInfo?.icon || '🗄️'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{dbInfo?.label || 'Database'}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{tables.length} tables</div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        {[{ id: 'schema', label: 'Schema' }, { id: 'resources', label: 'Resources' }].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '10px 0', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13,
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'all 0.15s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        
        {activeTab === 'schema' && (
          <>
            {/* Join Path Finder Banner */}
            {selectedTables.length === 2 && (
              <div style={{ margin: '0 12px 12px', padding: 14, background: 'var(--primary-muted)', borderRadius: 10, border: '1px solid var(--primary-light)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  🔗 Join Path: {selectedTables[0]} → {selectedTables[1]}
                </div>
                {joinPath === 'loading' && (
                  <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Computing join path…
                  </div>
                )}
                {Array.isArray(joinPath) && joinPath.length > 0 && (
                  <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', marginBottom: 8 }}>
                      {joinPath.map((step, i) => (
                        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--surface)', padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text)' }}>{step.table}</span>
                          {i < joinPath.length - 1 && <span style={{ color: 'var(--primary)', fontSize: 10 }}>→</span>}
                        </span>
                      ))}
                    </div>
                    <pre style={{ margin: 0, padding: 10, background: 'var(--bg)', borderRadius: 6, overflowX: 'auto', border: '1px solid var(--border)', fontSize: 11, lineHeight: 1.6, color: 'var(--text)' }}>
                      <code>{generatedJoinSQL}</code>
                    </pre>
                    <button
                      className="btn btn-primary"
                      style={{ marginTop: 8, width: '100%', padding: '6px', fontSize: 11, justifyContent: 'center' }}
                      onClick={() => navigator.clipboard.writeText(generatedJoinSQL).catch(() => {})}
                    >
                      📋 Copy JOIN SQL
                    </button>
                  </>
                )}
                {Array.isArray(joinPath) && joinPath.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--error)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span>⚠️</span>
                    <span>No direct join path detected between <strong>{selectedTables[0]}</strong> and <strong>{selectedTables[1]}</strong>. These tables may not share a common key column.</span>
                  </div>
                )}
              </div>
            )}

            {/* Section heading */}
            <div style={{ padding: '0 16px 8px', fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Tables {selectedTables.length > 0 && <span style={{ color: 'var(--primary)' }}>({selectedTables.length}/2 selected)</span>}
            </div>

            {/* Table List */}
            {tables.map(table => {
              const isExpanded = expandedTables.has(table.name);
              const isSelected = selectedTables.includes(table.name);
              const cols = liveTables[table.name] || table.columns || [];
              const nf = normalForms[table.name];

              return (
                <div key={table.name} style={{ borderBottom: '1px solid var(--border)' }}>
                  {/* Table Row */}
                  <div
                    onClick={() => toggleTable(table.name)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', cursor: 'pointer',
                      background: isSelected ? 'rgba(var(--primary-rgb, 107,114,128),0.08)' : isExpanded ? 'var(--surface-2)' : 'transparent',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => { if (!isExpanded && !isSelected) e.currentTarget.style.background = 'var(--surface-2)'; }}
                    onMouseLeave={e => { if (!isExpanded && !isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Expand arrow */}
                    <span style={{ color: isExpanded ? 'var(--primary)' : 'var(--muted)', transition: 'color 0.15s' }}>
                      <ChevronIcon open={isExpanded} />
                    </span>

                    {/* Table Name */}
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: isExpanded || isSelected ? 'var(--primary)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {table.name}
                    </span>

                    {/* NF Badge */}
                    {nf && <span style={nfBadgeStyle(nf)}>{nf}</span>}

                    {/* Join Select Button */}
                    <button
                      onClick={e => handleTableSelect(e, table.name)}
                      title="Select for Join Path Analysis"
                      style={{
                        width: 22, height: 22, borderRadius: 6, border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--primary)' : 'transparent',
                        color: isSelected ? '#fff' : 'var(--muted)', fontSize: 11, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        transition: 'all 0.15s'
                      }}
                    >🔗</button>

                    {/* Preview Button */}
                    <button
                      onClick={e => { e.stopPropagation(); onPreviewTable(table.name); }}
                      title="Preview Table Data"
                      style={{
                        width: 22, height: 22, borderRadius: 6, border: '1px solid var(--border)',
                        background: 'transparent', color: 'var(--muted)', fontSize: 11, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >👁</button>
                  </div>

                  {/* Expanded Columns */}
                  {isExpanded && (
                    <div style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
                      {cols.map((col, i) => {
                        const isPK = col.pk || col.isPrimaryKey;
                        const colName = col.name || col;
                        const isFK = !isPK && typeof colName === 'string' && colName.toLowerCase().endsWith('_id');
                        const colType = col.type || 'TEXT';
                        return (
                          <div
                            key={i}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px',
                              borderBottom: i < cols.length - 1 ? '1px solid var(--border)' : 'none',
                              fontSize: 12, background: i % 2 === 0 ? 'transparent' : 'var(--surface-2)'
                            }}
                          >
                            {/* Key badges */}
                            {isPK ? (
                              <span style={{ fontSize: 9, fontWeight: 700, background: 'rgba(234,179,8,0.15)', color: '#ca8a04', padding: '2px 4px', borderRadius: 3, flexShrink: 0 }}>PK</span>
                            ) : isFK ? (
                              <span style={{ fontSize: 9, fontWeight: 700, background: 'rgba(59,130,246,0.15)', color: '#3b82f6', padding: '2px 4px', borderRadius: 3, flexShrink: 0 }}>FK</span>
                            ) : (
                              <span style={{ width: 20, flexShrink: 0 }} />
                            )}
                            
                            <span style={{ flex: 1, color: 'var(--text)', fontWeight: isPK || isFK ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {colName}
                              {col.notNull && <span style={{ color: 'var(--error)', marginLeft: 2, fontSize: 10 }} title="NOT NULL">*</span>}
                            </span>
                            <span style={{ color: 'var(--muted)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', flexShrink: 0 }}>{colType}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Key Concepts */}
            {dbInfo?.concepts?.length > 0 && (
              <div style={{ padding: '16px 16px 8px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Key Concepts</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {dbInfo.concepts.map(c => (
                    <span key={c} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'resources' && (
          <div style={{ padding: '8px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, padding: '0 4px' }}>Learning Resources</div>
            {learningResources.map(r => (
              <a
                key={r.label}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
                  color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, marginBottom: 4,
                  transition: 'all 0.15s', border: '1px solid transparent'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
                <span style={{ flex: 1, fontWeight: 500 }}>{r.label}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>→</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});