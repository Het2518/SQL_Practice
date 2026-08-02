import React from 'react';
import { Search } from 'lucide-react';

export const TableCell = ({ value }) => {
  if (value === null || value === undefined || value === '__NULL__') {
    return <span className="text-muted italic text-[0.9em] opacity-70">null</span>;
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
      <div className="p-8 text-center text-muted flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-success-muted text-success flex items-center justify-center">
          <Search size={24} />
        </div>
        <div className="font-semibold text-text">Perfect Data Quality</div>
        <div className="text-[13px]">No NULL values detected in this result set.</div>
      </div>
    );
  }

  // Sort columns by null count descending
  const sortedCols = Object.entries(nullCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-warning p-2.5 rounded-xl">
          <Search size={20} color="#fff" />
        </div>
        <div>
          <h3 className="m-0 text-base font-bold">Data Quality Heatmap</h3>
          <div className="text-xs text-muted mt-0.5">Visualizing missing data distributions across your query.</div>
        </div>
      </div>

      <div className="flex gap-6 flex-wrap">
        {sortedCols.map(([col, count]) => {
          const percentage = (count / totalRows) * 100;
          // Color scale: yellow -> orange -> red based on severity
          let color = 'var(--warning)';
          let bg = 'var(--warning-muted)';
          if (percentage > 25) { color = 'var(--warning)'; bg = 'var(--warning-muted)'; }
          if (percentage > 60) { color = 'var(--error)'; bg = 'var(--error-muted)'; }

          return (
            <div key={col} className="flex-[1_1_300px] bg-surface-2 border border-border p-4 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-sm text-text break-all">{col}</span>
                <span className="text-lg font-bold" style={{ color }}>{percentage.toFixed(1)}%</span>
              </div>
              
              <div className="text-xs text-text-secondary mb-3">
                {count} / {totalRows} rows are NULL
              </div>

              {/* Matrix Heatmap Blocks */}
              <div className="flex flex-wrap gap-0.5">
                {Array.from({ length: Math.min(100, totalRows) }).map((_, i) => {
                  const isNullBlock = i < Math.ceil((count / totalRows) * 100);
                  return (
                    <div key={i} className="w-2 h-4 rounded-sm" style={{ 
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
