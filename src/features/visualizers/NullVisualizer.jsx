import React from 'react';
import { Search } from 'lucide-react';

export const TableCell = ({ value }) => {
  if (value === null || value === undefined || value === '__NULL__') {
    return <span style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.9em', opacity: 0.7 }}>null</span>;
  }
  return String(value);
};

export const NullSummaryPanel = ({ results }) => {
  if (!results || !results.columns || !results.rows || results.rows.length === 0) return null;

  const nullCounts = {};
  results.columns.forEach(col => { nullCounts[col] = 0; });
  
  let totalNulls = 0;
  const totalRows = results.rows.length;

  results.rows.forEach(row => {
    results.columns.forEach((col, i) => {
      if (row[i] === null || row[i] === undefined || row[i] === '__NULL__') {
        nullCounts[col]++;
        totalNulls++;
      }
    });
  });

  if (totalNulls === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Search size={24} />
        </div>
        <div style={{ fontWeight: 600, color: 'var(--text)' }}>Perfect Data Quality</div>
        <div style={{ fontSize: 13 }}>No NULL values detected in this result set.</div>
      </div>
    );
  }

  // Sort columns by null count descending
  const sortedCols = Object.entries(nullCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ background: 'linear-gradient(135deg, #f97316, #eab308)', padding: 10, borderRadius: 10 }}>
          <Search size={20} color="#fff" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Data Quality Heatmap</h3>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Visualizing missing data distributions across your query.</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {sortedCols.map(([col, count]) => {
          const percentage = (count / totalRows) * 100;
          // Color scale: yellow -> orange -> red based on severity
          let color = '#facc15'; // yellow
          let bg = 'rgba(250, 204, 21, 0.1)';
          if (percentage > 25) { color = '#f97316'; bg = 'rgba(249, 115, 22, 0.1)'; }
          if (percentage > 60) { color = '#ef4444'; bg = 'rgba(239, 68, 68, 0.1)'; }

          return (
            <div key={col} style={{ 
              flex: '1 1 300px', 
              background: 'var(--surface-2)', 
              border: '1px solid var(--border)', 
              padding: '16px', 
              borderRadius: '12px' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', wordBreak: 'break-all' }}>{col}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color }}>{percentage.toFixed(1)}%</span>
              </div>
              
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                {count} / {totalRows} rows are NULL
              </div>

              {/* Matrix Heatmap Blocks */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {Array.from({ length: Math.min(100, totalRows) }).map((_, i) => {
                  const isNullBlock = i < Math.ceil((count / totalRows) * 100);
                  return (
                    <div key={i} style={{ 
                      width: 8, height: 16, borderRadius: 2, 
                      background: isNullBlock ? color : 'var(--surface-3)',
                      opacity: isNullBlock ? 1 : 0.3
                    }} />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
