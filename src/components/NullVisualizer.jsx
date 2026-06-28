import React from 'react';

const renderCell = (value) => {
  if (value === null || value === undefined || value === '__NULL__') {
    return (
      <td className="null-cell">
        <span className="null-badge">NULL</span>
      </td>
    );
  }
  return <td>{String(value)}</td>;
};

export const NullSummaryPanel = ({ results }) => {
  if (!results || !results.columns || !results.rows || results.rows.length === 0) return null;

  const nullCounts = {};
  results.columns.forEach(col => { nullCounts[col] = 0; });
  
  let totalNulls = 0;
  results.rows.forEach(row => {
    results.columns.forEach((col, i) => {
      if (row[i] === null || row[i] === undefined || row[i] === '__NULL__') {
        nullCounts[col]++;
        totalNulls++;
      }
    });
  });

  if (totalNulls === 0) return null;

  return (
    <div className="null-summary-panel" style={{ padding: '12px', background: 'var(--surface-2)', borderTop: '1px solid var(--border)', fontSize: '13px' }}>
      <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text)' }}>🔍 NULL Analysis</h5>
      <div style={{ display: 'grid', gap: '8px' }}>
        {Object.entries(nullCounts).map(([col, count]) => count > 0 && (
          <div key={col} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 600, width: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col}</span>
            <span style={{ color: 'var(--muted)', width: '80px' }}>{count} NULLs ({(count / results.rows.length * 100).toFixed(1)}%)</span>
            <div style={{ flex: 1, background: 'var(--surface)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${(count / results.rows.length * 100)}%`, background: '#e67e22', height: '100%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TableCell = ({ value }) => {
  return renderCell(value);
};
