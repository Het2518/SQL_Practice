import React, { useState } from 'react';
import { TableCell } from '@/features/visualizers/NullVisualizer';

export const DiffTable = ({ diff, expectedColumns }) => {
  const [showFullActual, setShowFullActual] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const expectedItems = React.useMemo(() => [
    ...diff.matchedRows.map(row => ({ type: 'match', row })),
    ...diff.mismatchedRows.map(m => ({ type: 'mismatch', row: m.expected, original: m })),
    ...diff.missingRows.map(row => ({ type: 'missing', row }))
  ], [diff]);
  
  const actualItems = React.useMemo(() => showFullActual ? 
    [
       ...diff.matchedRows.map(row => ({ type: 'match', row })),
       ...diff.mismatchedRows.map(m => ({ type: 'full', row: m.actual })),
       ...diff.extraRows.map(row => ({ type: 'extra', row }))
    ] : [
      ...diff.matchedRows.map(row => ({ type: 'match', row })),
      ...diff.mismatchedRows.map(m => ({ type: 'mismatch', row: m.actual, original: m })),
      ...diff.extraRows.map(row => ({ type: 'extra', row }))
    ], [diff, showFullActual]);

  const totalRows = Math.max(expectedItems.length, actualItems.length);
  const totalPages = pageSize === 'All' ? 1 : Math.ceil(totalRows / pageSize);
  const safePage = Math.max(1, Math.min(page, totalPages || 1));
  const startIndex = pageSize === 'All' ? 0 : (safePage - 1) * pageSize;
  const endIndex = pageSize === 'All' ? totalRows : startIndex + pageSize;

  const currentExpected = expectedItems.slice(startIndex, endIndex);
  const currentActual = actualItems.slice(startIndex, endIndex);

  return (
    <div className="diff-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Summary Banner */}
      <div style={{ padding: '12px 16px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px', fontSize: '13px', fontWeight: 600 }}>
        {diff.missingRows.length > 0 && <span style={{ color: 'var(--error)' }}>❌ {diff.missingRows.length} rows missing</span>}
        {diff.extraRows.length > 0 && <span style={{ color: 'var(--error)' }}>✗ {diff.extraRows.length} extra rows</span>}
        {diff.mismatchedRows.length > 0 && <span style={{ color: '#e67e22' }}>⚠️ {diff.mismatchedRows.length} rows with wrong values</span>}
        <span style={{ color: 'var(--success)' }}>✓ {diff.matchedRows.length} rows correct</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => { setShowFullActual(!showFullActual); setPage(1); }} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
          {showFullActual ? 'Show Diff' : 'View Full Output'}
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Expected Side */}
        <div style={{ flex: 1, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: '8px 16px', background: 'var(--surface)', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid var(--border)', color: 'var(--success)' }}>
            ✓ Expected Output
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <table className="results-table diff-table">
              <thead>
                <tr>{expectedColumns.map((col, i) => <th key={i} style={{ position: 'sticky', top: 0 }}>{col}</th>)}</tr>
              </thead>
              <tbody>
                {currentExpected.map((item, i) => {
                  if (item.type === 'match') return <tr key={i} className="diff-match">{item.row.map((c, j) => <td key={j}><TableCell value={c} /></td>)}</tr>;
                  if (item.type === 'mismatch') return <tr key={i} className="diff-mismatch-row">{item.row.map((c, j) => <td key={j}><TableCell value={c} /></td>)}</tr>;
                  if (item.type === 'missing') return <tr key={i} className="diff-missing" style={{background: 'rgba(239,68,68,0.1)'}}>{item.row.map((c, j) => <td key={j}><TableCell value={c} /></td>)}</tr>;
                  return null;
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actual Side */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: '8px 16px', background: 'var(--surface)', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid var(--border)' }}>
            Your Output
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <table className="results-table diff-table">
              <thead>
                <tr>{expectedColumns.map((col, i) => <th key={i} style={{ position: 'sticky', top: 0 }}>{col}</th>)}</tr>
              </thead>
              <tbody>
                {currentActual.map((item, i) => {
                  if (item.type === 'match') return <tr key={i} className="diff-match">{item.row.map((c, j) => <td key={j}><TableCell value={c} /></td>)}</tr>;
                  if (item.type === 'full') return <tr key={i}>{item.row.map((c, j) => <td key={j}><TableCell value={c} /></td>)}</tr>;
                  if (item.type === 'extra') return <tr key={i} className="diff-extra" style={{background: 'rgba(239,68,68,0.1)', textDecoration: 'line-through', opacity: 0.7}}>{item.row.map((c, j) => <td key={j}><TableCell value={c} /></td>)}</tr>;
                  if (item.type === 'mismatch') return <tr key={i}>{item.row.map((c, j) => {
                    const isWrongValue = String(c).trim() !== String(item.original.expected[j]).trim();
                    return <td key={j} style={isWrongValue ? { background: 'rgba(230,126,34,0.15)', color: '#e67e22', fontWeight: 600 } : {}}><TableCell value={c} /></td>;
                  })}</tr>;
                  return null;
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalRows > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)',
          flexShrink: 0, fontSize: 13
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Showing {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows}
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value === 'All' ? 'All' : Number(e.target.value);
                setPageSize(val);
                setPage(1);
              }}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--text)', padding: '4px 8px', borderRadius: 4, cursor: 'pointer'
              }}
            >
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
              <option value={500}>500 / page</option>
              <option value="All">All rows</option>
            </select>
          </div>

          {pageSize !== 'All' && totalPages > 1 && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={{
                  background: safePage === 1 ? 'var(--surface)' : 'var(--primary)',
                  color: safePage === 1 ? 'var(--muted)' : 'white',
                  border: 'none', padding: '4px 12px', borderRadius: 4,
                  cursor: safePage === 1 ? 'not-allowed' : 'pointer'
                }}
              >Prev</button>
              <span style={{ padding: '4px 12px', color: 'var(--text)' }}>
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                style={{
                  background: safePage === totalPages ? 'var(--surface)' : 'var(--primary)',
                  color: safePage === totalPages ? 'var(--muted)' : 'white',
                  border: 'none', padding: '4px 12px', borderRadius: 4,
                  cursor: safePage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
