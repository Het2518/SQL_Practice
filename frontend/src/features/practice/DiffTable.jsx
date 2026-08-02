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
    <div className="diff-container flex flex-col h-full">
      {/* Summary Banner */}
      <div className="px-4 py-3 bg-surface-2 border-b border-border flex gap-4 text-[13px] font-semibold">
        {diff.missingRows.length > 0 && <span className="text-error">❌ {diff.missingRows.length} rows missing</span>}
        {diff.extraRows.length > 0 && <span className="text-error">✗ {diff.extraRows.length} extra rows</span>}
        {diff.mismatchedRows.length > 0 && <span className="text-orange-500">⚠️ {diff.mismatchedRows.length} rows with wrong values</span>}
        <span className="text-success">✓ {diff.matchedRows.length} rows correct</span>
        <div className="flex-1" />
        <button onClick={() => { setShowFullActual(!showFullActual); setPage(1); }} className="btn btn-ghost btn-sm px-2 py-1">
          {showFullActual ? 'Show Diff' : 'View Full Output'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Expected Side */}
        <div className="flex-1 border-r border-border flex flex-col min-w-0">
          <div className="px-4 py-2 bg-surface font-semibold text-[13px] border-b border-border text-success">
            ✓ Expected Output
          </div>
          <div className="flex-1 overflow-auto">
            <table className="results-table diff-table">
              <thead>
                <tr>{expectedColumns.map((col, i) => <th key={i} className="sticky top-0">{col}</th>)}</tr>
              </thead>
              <tbody>
                {currentExpected.map((item, i) => {
                  if (item.type === 'match') return <tr key={i} className="diff-match">{item.row.map((c, j) => <td key={j}><TableCell value={c} /></td>)}</tr>;
                  if (item.type === 'mismatch') return <tr key={i} className="diff-mismatch-row">{item.row.map((c, j) => <td key={j}><TableCell value={c} /></td>)}</tr>;
                  if (item.type === 'missing') return <tr key={i} className="diff-missing bg-red-500/10">{item.row.map((c, j) => <td key={j}><TableCell value={c} /></td>)}</tr>;
                  return null;
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actual Side */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-4 py-2 bg-surface font-semibold text-[13px] border-b border-border">
            Your Output
          </div>
          <div className="flex-1 overflow-auto">
            <table className="results-table diff-table">
              <thead>
                <tr>{expectedColumns.map((col, i) => <th key={i} className="sticky top-0">{col}</th>)}</tr>
              </thead>
              <tbody>
                {currentActual.map((item, i) => {
                  if (item.type === 'match') return <tr key={i} className="diff-match">{item.row.map((c, j) => <td key={j}><TableCell value={c} /></td>)}</tr>;
                  if (item.type === 'full') return <tr key={i}>{item.row.map((c, j) => <td key={j}><TableCell value={c} /></td>)}</tr>;
                  if (item.type === 'extra') return <tr key={i} className="diff-extra bg-red-500/10 line-through opacity-70">{item.row.map((c, j) => <td key={j}><TableCell value={c} /></td>)}</tr>;
                  if (item.type === 'mismatch') return <tr key={i}>{item.row.map((c, j) => {
                    const isWrongValue = String(c).trim() !== String(item.original.expected[j]).trim();
                    return <td key={j} className={isWrongValue ? "bg-orange-500/15 text-orange-500 font-semibold" : ""}><TableCell value={c} /></td>;
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
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface-2 shrink-0 text-[13px]">
          <div className="flex items-center gap-3">
            <span className="text-text-secondary">
              Showing {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows}
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value === 'All' ? 'All' : Number(e.target.value);
                setPageSize(val);
                setPage(1);
              }}
              className="bg-surface border border-border text-text px-2 py-1 rounded cursor-pointer"
            >
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
              <option value={500}>500 / page</option>
              <option value="All">All rows</option>
            </select>
          </div>

          {pageSize !== 'All' && totalPages > 1 && (
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className={`border-none px-3 py-1 rounded ${
                  safePage === 1
                    ? 'bg-surface text-muted cursor-not-allowed'
                    : 'bg-primary text-primary-foreground cursor-pointer'
                }`}
              >Prev</button>
              <span className="px-3 py-1 text-text">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className={`border-none px-3 py-1 rounded ${
                  safePage === totalPages
                    ? 'bg-surface text-muted cursor-not-allowed'
                    : 'bg-primary text-primary-foreground cursor-pointer'
                }`}
              >Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
