import { useState } from 'react';
import { DB_INFO } from '../types';
export function SchemaSidebar({
  dbName,
  onPreviewTable
}) {
  const [expandedTables, setExpandedTables] = useState(new Set());
  const [expandedSection, setExpandedSection] = useState('schema');
  const dbInfo = typeof dbName === 'string' ? DB_INFO[dbName] : {
    name: dbName.name,
    tables: dbName.schema
  };
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
              background: isExpanded ? 'var(--surface-2)' : 'transparent',
              color: isExpanded ? 'var(--primary)' : 'var(--text)'
            }}>
                    <span style={{
                fontSize: 13,
                fontWeight: 600,
                flex: 1
              }}>{table.name}</span>
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
                      {table.columns.map(col => <div key={col.name} style={{
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
                            {col.isPrimaryKey ? <span title="Primary Key" style={{
                    fontSize: 13,
                    lineHeight: 1
                  }}>🔑</span> : col.isForeignKey ? <span title="Foreign Key" style={{
                    fontSize: 13,
                    lineHeight: 1
                  }}>🗝️</span> : <span style={{
                    width: 13
                  }} />}
                            <span style={{
                    color: 'var(--text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
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
                        </div>)}
                    </div>}
                </div>;
        })}

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