import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DB_INFO } from '@/data/schemas';
import { analyzeNormalForm } from '@/utils/sqlAnalysis';

// ─── Icons (inline SVG to avoid extra deps) ──────────────────────────────────
const ChevronIcon = ({ open }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
  >
    <path
      d="M4 2L8 6L4 10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const learningResources = [
  { label: 'SQL Joins Explained', url: 'https://mode.com/sql-tutorial/sql-joins/', icon: '🔗' },
  {
    label: 'Window Functions Guide',
    url: 'https://mode.com/sql-tutorial/sql-window-functions/',
    icon: '📊',
  },
  { label: 'CTEs & Recursive Queries', url: 'https://www.sqlite.org/lang_with.html', icon: '🔄' },
  { label: 'GROUP BY & HAVING', url: 'https://mode.com/sql-tutorial/sql-group-by/', icon: '📋' },
  { label: 'Date Functions', url: 'https://www.sqlite.org/lang_datefunc.html', icon: '📅' },
  { label: 'String Functions', url: 'https://www.sqlite.org/lang_corefunc.html', icon: '🔤' },
  { label: 'NULL Handling', url: 'https://mode.com/sql-tutorial/sql-is-null/', icon: '⚠️' },
];

export const SchemaSidebar = React.memo(function SchemaSidebar({
  dbName,
  executeQuery,
  onPreviewTable,
  onClose,
}) {
  const [expandedTables, setExpandedTables] = useState(new Set());
  const [activeTab, setActiveTab] = useState('schema');
  const [liveTables, setLiveTables] = useState({}); // { tableName: [{ name, type, pk, notNull }] }
  const [normalForms, setNormalForms] = useState({});
  const [selectedTables, setSelectedTables] = useState([]);
  const [joinPath, setJoinPath] = useState(null); // null | 'loading' | array
  const [joinSQL, setJoinSQL] = useState('');

  const dbInfo = DB_INFO[dbName];

  const toggleTable = (tableName) => {
    setExpandedTables((prev) => {
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
                tableData[t.name] = colRes.rows.map((row) => ({
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
    return () => {
      mounted = false;
    };
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

      const aCols = (aRes.rows || []).map((r) => ({
        name: r[1],
        type: r[2] || 'TEXT',
        pk: r[5] === 1,
      }));
      const bCols = (bRes.rows || []).map((r) => ({
        name: r[1],
        type: r[2] || 'TEXT',
        pk: r[5] === 1,
      }));

      const aPK = aCols.find((c) => c.pk)?.name || aCols[0]?.name || 'id';
      const bPK = bCols.find((c) => c.pk)?.name || bCols[0]?.name || 'id';

      // Helper: derive candidate table names from a FK column name
      const getCandidates = (colName) => {
        const base = colName.replace(/_id$/i, '').replace(/Id$/, '').toLowerCase();
        return [
          base,
          base + 's',
          base + 'es',
          base.replace(/y$/, 'ies'),
          base.replace(/ies$/, 'y'),
        ];
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
          candidates.some((c) => c === bNameLower || c === bNameLower.replace(/s$/, ''))
        ) {
          const sql = `FROM ${tableA}\nJOIN ${tableB} ON ${tableA}.${col.name} = ${tableB}.${bPK}`;
          return {
            path: [{ table: tableA }, { table: tableB, fromCol: col.name, toCol: bPK }],
            sql,
          };
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
          candidates.some((c) => c === aNameLower || c === aNameLower.replace(/s$/, ''))
        ) {
          const sql = `FROM ${tableA}\nJOIN ${tableB} ON ${tableB}.${col.name} = ${tableA}.${aPK}`;
          return {
            path: [{ table: tableA }, { table: tableB, fromCol: col.name, toCol: aPK }],
            sql,
          };
        }
      }

      // Strategy 3: Try intermediate table (multi-hop join)
      const tablesRes = await executeQuery("SELECT name FROM sqlite_master WHERE type='table'");
      const allTables = (tablesRes.rows || [])
        .map((r) => r[0])
        .filter((t) => t !== tableA && t !== tableB);
      for (const mid of allTables) {
        const midRes = await executeQuery(`PRAGMA table_info("${mid}")`);
        const midCols = (midRes.rows || []).map((r) => ({ name: r[1], pk: r[5] === 1 }));

        const colToA = midCols.find(
          (c) =>
            !c.pk &&
            getCandidates(c.name).some(
              (x) => x === tableA.toLowerCase() || x === tableA.toLowerCase().replace(/s$/, '')
            )
        );
        const colToB = midCols.find(
          (c) =>
            !c.pk &&
            getCandidates(c.name).some(
              (x) => x === tableB.toLowerCase() || x === tableB.toLowerCase().replace(/s$/, '')
            )
        );
        if (colToA && colToB) {
          const sql = `FROM ${tableA}\nJOIN ${mid} ON ${tableA}.${aPK} = ${mid}.${colToA.name}\nJOIN ${tableB} ON ${mid}.${colToB.name} = ${tableB}.${bPK}`;
          return {
            path: [
              { table: tableA },
              { table: mid, fromCol: colToA.name, toCol: aPK },
              { table: tableB, fromCol: colToB.name, toCol: bPK },
            ],
            sql,
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
      newSelected = newSelected.filter((t) => t !== tableName);
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

  const nfBadgeClass = (nf) => {
    const classes = {
      '3NF': 'bg-emerald-500/15 text-emerald-500',
      '2NF': 'bg-amber-500/15 text-amber-500',
      '1NF': 'bg-red-500/15 text-red-500',
      Unnormalized: 'bg-purple-500/15 text-purple-500',
      Unknown: 'bg-slate-400/15 text-slate-400',
    };
    const colorClass = classes[nf] || classes.Unknown;
    return `text-[9px] font-bold px-2 py-[3px] rounded-full shrink-0 uppercase tracking-[0.04em] ${colorClass}`;
  };

  const tables = dbInfo?.tables || [];

  return (
    <div className="h-full flex flex-col bg-surface border-r border-border">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-border bg-surface flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-muted flex items-center justify-center text-base shrink-0">
            {dbInfo?.icon || '🗄️'}
          </div>
          <div>
            <div className="font-bold text-sm text-text">
              {dbInfo?.label || 'Database'}
            </div>
            <div className="text-[11px] text-muted">{tables.length} tables</div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="bg-transparent hover:bg-surface border-none cursor-pointer p-1 text-text-secondary flex items-center justify-center rounded-md transition-colors"
            title="Hide Sidebar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Segmented Control Tab Bar */}
      <div className="py-3 px-4 bg-surface">
        <div className="flex bg-surface-2 rounded-lg p-1">
          {[
            { id: 'schema', label: 'Schema' },
            { id: 'resources', label: 'Resources' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 border-none cursor-pointer text-[13px] rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'font-semibold text-text bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                  : 'font-medium text-muted bg-transparent shadow-none'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto py-3">
        {activeTab === 'schema' && (
          <>
            <div className="px-3 pb-3">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-er-diagram'))}
                className="btn btn-secondary w-full justify-center"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                View ER Diagram
              </button>
            </div>

            {/* Join Path Finder Banner */}
            {selectedTables.length === 2 && (
              <div className="mx-3 mb-3 p-3.5 bg-primary-muted rounded-xl border border-primary-light">
                <div className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                  🔗 Join Path: {selectedTables[0]} → {selectedTables[1]}
                </div>
                {joinPath === 'loading' && (
                  <div className="text-xs text-muted flex items-center gap-2">
                    <span className="inline-block w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Computing join path…
                  </div>
                )}
                {Array.isArray(joinPath) && joinPath.length > 0 && (
                  <>
                    <div className="flex flex-wrap gap-1 items-center mb-2">
                      {joinPath.map((step, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span className="text-[11px] font-semibold bg-surface px-1.5 py-0.5 rounded border border-border text-text">
                            {step.table}
                          </span>
                          {i < joinPath.length - 1 && (
                            <span className="text-primary text-[10px]">→</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <pre className="m-0 p-2.5 bg-bg rounded-md overflow-x-auto border border-border text-[11px] leading-relaxed text-text">
                      <code>{generatedJoinSQL}</code>
                    </pre>
                    <button
                      className="btn btn-primary mt-2 w-full p-1.5 text-[11px] justify-center"
                      onClick={() =>
                        navigator.clipboard.writeText(generatedJoinSQL).catch(() => {})
                      }
                    >
                      📋 Copy JOIN SQL
                    </button>
                  </>
                )}
                {Array.isArray(joinPath) && joinPath.length === 0 && (
                  <div className="text-xs text-error flex items-start gap-1.5">
                    <span>⚠️</span>
                    <span>
                      No direct join path detected between <strong>{selectedTables[0]}</strong> and{' '}
                      <strong>{selectedTables[1]}</strong>. These tables may not share a common key
                      column.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Section heading */}
            <div className="px-4 pb-2 text-[10px] font-bold text-muted uppercase tracking-[0.08em]">
              Tables{' '}
              {selectedTables.length > 0 && (
                <span className="text-primary">
                  ({selectedTables.length}/2 selected)
                </span>
              )}
            </div>

            {/* Table List */}
            {tables.map((table) => {
              const isExpanded = expandedTables.has(table.name);
              const isSelected = selectedTables.includes(table.name);
              const cols = liveTables[table.name] || table.columns || [];
              const nf = normalForms[table.name];

              return (
                <div key={table.name} className="border-b border-border">
                  {/* Table Row */}
                  <div
                    onClick={() => toggleTable(table.name)}
                    className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/10'
                        : isExpanded
                          ? 'bg-surface-2'
                          : 'bg-transparent hover:bg-surface-2'
                    }`}
                  >
                    <span className={`transition-colors ${isExpanded ? 'text-primary' : 'text-muted'}`}>
                      <ChevronIcon open={isExpanded} />
                    </span>

                    <span className={`flex-1 text-[13px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis ${
                      isExpanded || isSelected ? 'text-primary' : 'text-text'
                    }`}>
                      {table.name}
                    </span>

                    {nf && (
                      <span className={nfBadgeClass(nf)} title="Simplified analysis — assumes no partial dependencies">
                        {nf}*
                      </span>
                    )}

                    <button
                      onClick={(e) => handleTableSelect(e, table.name)}
                      title="Select for Join Path Analysis"
                      className={`w-[22px] h-[22px] rounded-md border text-[11px] cursor-pointer flex items-center justify-center shrink-0 transition-all ${
                        isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-transparent text-muted hover:border-primary hover:text-primary'
                      }`}
                    >
                      🔗
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreviewTable(table.name);
                      }}
                      title="Preview Table Data"
                      className="w-[22px] h-[22px] rounded-md border border-border bg-transparent text-muted text-[11px] cursor-pointer flex items-center justify-center shrink-0 transition-all hover:text-primary hover:border-primary"
                    >
                      👁
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="bg-bg border-t border-border">
                      {cols.map((col, i) => {
                        const isPK = col.pk || col.isPrimaryKey;
                        const colName = col.name || col;
                        const isFK =
                          !isPK &&
                          typeof colName === 'string' &&
                          colName.toLowerCase().endsWith('_id');
                        const colType = col.type || 'TEXT';
                        return (
                          <div
                            key={i}
                            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs ${
                              i < cols.length - 1 ? 'border-b border-border' : ''
                            } ${i % 2 === 0 ? 'bg-transparent' : 'bg-surface-2'}`}
                          >
                            {/* Key badges */}
                            {isPK ? (
                              <span className="text-[9px] font-bold bg-yellow-500/15 text-yellow-600 px-1 py-0.5 rounded shrink-0">
                                PK
                              </span>
                            ) : isFK ? (
                              <span className="text-[9px] font-bold bg-blue-500/15 text-blue-500 px-1 py-0.5 rounded shrink-0">
                                FK
                              </span>
                            ) : (
                              <span className="w-5 shrink-0" />
                            )}

                            <span className={`flex-1 text-text whitespace-nowrap overflow-hidden text-ellipsis ${
                              isPK || isFK ? 'font-semibold' : 'font-normal'
                            }`}>
                              {colName}
                              {col.notNull && (
                                <span className="text-error ml-0.5 text-[10px]" title="NOT NULL">
                                  *
                                </span>
                              )}
                            </span>
                            <span className="text-muted text-[10px] font-semibold uppercase shrink-0">
                              {colType}
                            </span>
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
              <div className="pt-4 px-4 pb-2">
                <div className="text-[10px] font-bold text-muted uppercase tracking-[0.08em] mb-2.5">
                  Key Concepts
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dbInfo.concepts.map((c) => (
                    <span
                      key={c}
                      className="bg-surface-2 border border-border text-text-secondary px-2.5 py-1 rounded-md text-[11px] font-semibold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'resources' && (
          <div className="py-2 px-3">
            <div className="text-[10px] font-bold text-muted uppercase tracking-[0.08em] mb-2.5 px-1">
              Learning Resources
            </div>
            {learningResources.map((r) => (
              <a
                key={r.label}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-text-secondary no-underline text-[13px] mb-1 transition-all border border-transparent hover:bg-surface-2 hover:border-border hover:text-text"
              >
                <span className="text-lg shrink-0">{r.icon}</span>
                <span className="flex-1 font-medium">{r.label}</span>
                <span className="text-xs text-muted">→</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
