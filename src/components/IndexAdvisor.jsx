import React, { useState, useEffect } from 'react';
import { getIndexInfo } from '../utils/sqlAnalysis';

const extractTable = (detail) => {
  const match = detail.match(/TABLE\s+(\w+)/i);
  return match ? match[1] : null;
};

const extractIndex = (detail) => {
  const match = detail.match(/USING\s+(?:COVERING\s+)?INDEX\s+(\w+)/i);
  return match ? match[1] : null;
};

export const IndexAdvisor = ({ db, sql }) => {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (!db || !sql) return;

    try {
      const planRes = db.exec(`EXPLAIN QUERY PLAN ${sql}`);
      const plan = planRes.length > 0 && planRes[0].values ? planRes[0].values : [];
      
      const tablesUsed = new Set();
      const usedIndexes = new Set();
      const fullScans = new Set();

      plan.forEach(step => {
        // EXPLAIN QUERY PLAN format: [id, parent, notused, detail]
        const detail = step[3] || '';
        const table = extractTable(detail);
        if (table) tablesUsed.add(table);

        const index = extractIndex(detail);
        if (index) {
          usedIndexes.add(index);
        }

        if (detail.includes('SCAN TABLE')) {
          fullScans.add(table);
        }
      });

      // Get index info for all used tables
      let availableIndexes = [];
      tablesUsed.forEach(table => {
        availableIndexes = availableIndexes.concat(getIndexInfo(db, table));
      });

      setAnalysis({
        availableIndexes,
        usedIndexes: Array.from(usedIndexes),
        fullScans: Array.from(fullScans),
      });

    } catch (err) {
      console.error("Index Advisor analysis failed", err);
      setAnalysis(null);
    }
  }, [db, sql]);

  if (!analysis) return null;

  return (
    <div className="index-advisor-panel" style={{ padding: '16px', borderTop: '1px solid var(--border)', fontSize: '13px' }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text)' }}>📇 Index Advisor</h4>
      
      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
        <div className="schema-indexes">
          <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Available Indexes for Queried Tables</div>
          {analysis.availableIndexes.length === 0 && <div style={{ color: 'var(--muted)' }}>No indexes available on these tables.</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {analysis.availableIndexes.map(idx => {
              const isUsed = analysis.usedIndexes.includes(idx.indexName);
              return (
                <div key={idx.indexName} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', 
                  background: isUsed ? 'var(--surface)' : 'transparent',
                  border: `1px solid ${isUsed ? 'var(--border)' : 'var(--border)'}`,
                  borderRadius: '6px',
                  opacity: isUsed ? 1 : 0.6
                }}>
                  <span title={idx.isUnique ? 'Unique Index' : 'Index'} style={{ fontSize: '14px' }}>{idx.isUnique ? '🔑' : '📇'}</span>
                  <span style={{ fontWeight: 600, flex: 1 }}>{idx.tableName}.{idx.indexName}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '11px' }}>({idx.columns.join(', ')})</span>
                  {isUsed && <span style={{ color: 'var(--success)', fontSize: '11px', fontWeight: 700, paddingLeft: '8px' }}>✓ Used</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Performance Diagnostics</div>
          {analysis.fullScans.length > 0 ? (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', padding: '12px', borderRadius: '6px', color: 'var(--text)' }}>
              <div style={{ color: 'var(--error)', fontWeight: 700, marginBottom: '6px' }}>⚠ Full Table Scan Detected</div>
              <div style={{ marginBottom: '8px' }}>Tables: <strong style={{ color: 'var(--error)' }}>{analysis.fullScans.join(', ')}</strong></div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.5 }}>
                SQLite read every single row in the table to process your query. Your WHERE or JOIN condition is not utilizing any index. Consider querying indexed columns for optimal performance.
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--success)', padding: '12px', borderRadius: '6px', color: 'var(--text)' }}>
              <div style={{ color: 'var(--success)', fontWeight: 700, marginBottom: '4px' }}>✓ Efficient Query</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                No full table scans were detected. The query planner efficiently utilized available indexes or operated on tiny subqueries.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
