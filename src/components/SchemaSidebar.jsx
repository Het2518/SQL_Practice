import { useState, useEffect, useMemo } from 'react';
import { DB_INFO } from '../types';
import { buildRelationshipMap, findJoinPath, generateJoinSQL, analyzeNormalForm } from '../utils/sqlAnalysis';

export function SchemaSidebar({
  dbName,
  executeQuery,
  onPreviewTable
}) {
  const [expandedTables, setExpandedTables] = useState(new Set());
  const [expandedSection, setExpandedSection] = useState('schema');
  
  // Relationship Navigator State
  const [relationships, setRelationships] = useState([]);
  const [normalForms, setNormalForms] = useState({});
  const [selectedTables, setSelectedTables] = useState([]);
  const [joinPath, setJoinPath] = useState(null);
  const dbInfo = DB_INFO[dbName];
  const toggleTable = tableName => {
    setExpandedTables(prev => {
      const next = new Set(prev);
      if (next.has(tableName)) next.delete(tableName);else next.add(tableName);
      return next;
    });
  };
  const learningResources = [{
    label: 'SQL Joins Explained',
    url: 'https://mode.com/sql-tutorial/sql-joins/',
    icon: '🔗'
  }, {
    label: 'Window Functions Guide',
    url: 'https://mode.com/sql-tutorial/sql-window-functions/',
    icon: '📊'
  }, {
    label: 'CTEs & Recursive Queries',
    url: 'https://www.sqlite.org/lang_with.html',
    icon: '🔄'
  }, {
    label: 'GROUP BY & HAVING',
    url: 'https://mode.com/sql-tutorial/sql-group-by/',
    icon: '📋'
  }, {
    label: 'Date Functions',
    url: 'https://www.sqlite.org/lang_datefunc.html',
    icon: '📅'
  }, {
    label: 'String Functions',
    url: 'https://www.sqlite.org/lang_corefunc.html',
    icon: '🔤'
  }, {
    label: 'NULL Handling',
    url: 'https://mode.com/sql-tutorial/sql-is-null/',
    icon: '⚠️'
  }];

  useEffect(() => {
    let mounted = true;
    if (executeQuery) {
      buildRelationshipMap(executeQuery).then(rels => {
        if (mounted) setRelationships(rels);
      });
      if (dbInfo?.tables) {
        Promise.all(
          dbInfo.tables.map(t => 
            analyzeNormalForm(executeQuery, t.name).then(res => ({ name: t.name, nf: res.nf }))
          )
        ).then(results => {
          if (!mounted) return;
          const map = {};
          results.forEach(r => { map[r.name] = r.nf; });
          setNormalForms(map);
        });
      }
    } else {
      setRelationships([]);
      setNormalForms({});
    }
    setSelectedTables([]);
    setJoinPath(null);
    return () => { mounted = false; };
  }, [executeQuery, dbInfo]);

  const handleTableSelect = (e, tableName) => {
    e.stopPropagation();
    let newSelected = [...selectedTables];
    if (newSelected.includes(tableName)) {
      newSelected = newSelected.filter(t => t !== tableName);
    } else {
      newSelected.push(tableName);
      if (newSelected.length > 2) newSelected.shift();
    }
    setSelectedTables(newSelected);

    if (newSelected.length === 2) {
      const path = findJoinPath(newSelected[0], newSelected[1], relationships);
      setJoinPath(path);
    } else {
      setJoinPath(null);
    }
  };

  const generatedJoinSQL = useMemo(() => generateJoinSQL(joinPath), [joinPath]);

  return <div style={{
    height: '100%',
    overflowY: 'auto',
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column'
  }}>
      {/* DB Header */}
      <div style={{
      padding: '16px 14px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)'
    }}>
        <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 4
      }}>
          <span style={{
          fontWeight: 600,
          fontSize: 15,
          color: 'var(--text)'
        }}>
            SQL Database
          </span>
        </div>
      </div>

      {/* Section Tabs */}
      <div style={{
      display: 'flex',
      flexDirection: 'column'
    }}>
        {['schema', 'resources'].map(s => <button key={s} onClick={() => setExpandedSection(s)} style={{
        flex: 1,
        padding: '12px 0',
        background: expandedSection === s ? 'var(--surface-2)' : 'transparent',
        border: 'none',
        borderBottom: '1px solid var(--border)',
        color: expandedSection === s ? 'var(--primary)' : 'var(--muted)',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s'
      }}>
            {s === 'schema' ? 'View Schema' : 'Learning Resources'}
          </button>)}
      </div>

      <div style={{
      padding: '10px 10px',
      flex: 1,
      overflowY: 'auto'
    }}>
        {expandedSection === 'schema' ? <>
            <div style={{
          fontSize: 11,
          color: 'var(--muted)',
          marginBottom: 8,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
              Tables
            </div>
            {dbInfo.tables.map(table => {
          const isExpanded = expandedTables.has(table.name);
          return <div key={table.name} className="schema-table-item" style={{
            borderBottom: '1px solid var(--border)'
          }}>
                  <div className="schema-table-header" onClick={() => toggleTable(table.name)} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 14px',
              cursor: 'pointer',
              background: isExpanded ? 'var(--surface-2)' : selectedTables.includes(table.name) ? 'var(--primary-light)' : 'transparent',
              color: isExpanded || selectedTables.includes(table.name) ? 'var(--primary)' : 'var(--text)'
            }}>
                    <span style={{
                fontSize: 13,
                fontWeight: 600,
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                      {table.name}
                      <span title="Normal Form" style={{
                        fontSize: '9px',
                        background: 'var(--surface)',
                        color: 'var(--text-secondary)',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        border: '1px solid var(--border)'
                      }}>
                        {normalForms[table.name] || ''}
                      </span>
                    </span>
                    <button onClick={e => handleTableSelect(e, table.name)} title="Select for Join Path" style={{
                      background: selectedTables.includes(table.name) ? 'var(--primary)' : 'transparent',
                      color: selectedTables.includes(table.name) ? 'white' : 'var(--muted)',
                      border: '1px solid ' + (selectedTables.includes(table.name) ? 'var(--primary)' : 'var(--border)'),
                      borderRadius: '4px',
                      fontSize: '10px',
                      padding: '2px 4px',
                      marginRight: '6px',
                      cursor: 'pointer',
                    }}>
                      🔗
                    </button>
                    <button onClick={e => {
                e.stopPropagation();
                onPreviewTable(table.name);
              }} style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                color: 'var(--muted)',
                padding: '2px 6px',
                marginRight: 6,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s'
              }} onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--primary)';
                e.currentTarget.style.background = 'var(--surface)';
              }} onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--muted)';
                e.currentTarget.style.background = 'transparent';
              }} title="Preview Data">
                      👁
                    </button>
                    <span style={{
                color: 'var(--primary-hover)',
                fontSize: 10,
                transition: 'transform 0.15s',
                transform: isExpanded ? 'rotate(90deg)' : 'none'
              }}>▶</span>
                  </div>
                  {isExpanded && <div style={{
              padding: '0 14px 10px 14px',
              background: 'var(--surface-2)'
            }}>
                      {table.columns.map(col => {
                const isFK = relationships.some(r => r.fromTable === table.name && r.fromColumn === col.name);
                const isPK = col.isPrimaryKey || (col.name === 'id' && !isFK) || (col.name.endsWith('_id') && !isFK);
                return <div key={col.name} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 0',
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
                borderBottom: '1px solid var(--border)'
              }}>
                          <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  overflow: 'hidden'
                }}>
                            {isPK ? <span title="Primary Key" style={{
                    fontSize: 10,
                    fontWeight: 700,
                    background: 'rgba(239, 175, 0, 0.15)',
                    color: '#d4a000',
                    padding: '2px 4px',
                    borderRadius: '4px',
                  }}>PK</span> : isFK ? <span title="Foreign Key" style={{
                    fontSize: 10,
                    fontWeight: 700,
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#3b82f6',
                    padding: '2px 4px',
                    borderRadius: '4px',
                  }}>FK</span> : <span style={{
                    width: 18 // Match badge width roughly to align
                  }} />}
                            <span style={{
                    color: 'var(--text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: isPK || isFK ? 600 : 400
                  }}>
                              {col.name}
                              {col.isNullable && <span style={{
                      color: 'var(--muted)',
                      fontSize: 10,
                      marginLeft: 4
                    }}>?</span>}
                            </span>
                          </div>
                          <span style={{
                  color: 'var(--text-secondary)',
                  fontSize: 11,
                  fontWeight: 600,
                  flexShrink: 0,
                  paddingLeft: 8
                }}>
                            {col.type}
                          </span>
                        </div>
                })}
                    </div>}
                </div>;
        })}

            {/* Join Path Finder Result */}
            {selectedTables.length === 2 && (
              <div style={{ padding: '12px 14px', background: 'var(--primary-light)', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--primary)' }}>🔗 Join Path Suggestion</div>
                {joinPath ? (
                  <>
                    <div style={{ marginBottom: '8px', color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                      {joinPath.map((step, i) => (
                        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontWeight: 600, background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>{step.table}</span>
                          {i < joinPath.length - 1 && <span style={{ color: 'var(--muted)' }}>→</span>}
                        </span>
                      ))}
                    </div>
                    <pre style={{ margin: 0, padding: '8px', background: 'var(--bg)', borderRadius: '6px', overflowX: 'auto', border: '1px solid var(--border)' }}>
                      <code>{generatedJoinSQL}</code>
                    </pre>
                    <button 
                      className="btn btn-primary" 
                      style={{ marginTop: '8px', width: '100%', padding: '4px', fontSize: '11px' }}
                      onClick={() => navigator.clipboard.writeText(generatedJoinSQL).then(() => alert('Copied to clipboard!'))}
                    >
                      Copy SQL
                    </button>
                  </>
                ) : (
                  <div style={{ color: 'var(--error)' }}>No direct relationship found between these tables.</div>
                )}
              </div>
            )}

            {/* Key Concepts */}
            <div style={{
          padding: '16px 14px'
        }}>
              <div style={{
            fontSize: 11,
            color: 'var(--muted)',
            marginBottom: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
                Key Concepts
              </div>
              <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6
          }}>
                {dbInfo.concepts.map(c => <span key={c} style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600
            }}>
                    {c}
                  </span>)}
              </div>
            </div>
          </> : <div>
            <div style={{
          fontSize: 11,
          color: 'var(--muted)',
          marginBottom: 8,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
              Learning Resources
            </div>
            {learningResources.map(r => <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          borderRadius: 'var(--radius)',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          fontSize: 12,
          marginBottom: 2,
          transition: 'all 0.15s',
          border: '1px solid transparent'
        }} onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--surface-2)';
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text)';
        }} onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}>
                <span>{r.icon}</span>
                <span>{r.label}</span>
                <span style={{
            marginLeft: 'auto',
            fontSize: 10,
            opacity: 0.5
          }}>→</span>
              </a>)}
          </div>}
      </div>
    </div>;
}