import React, { useState } from 'react';
import { TableCell } from './NullVisualizer';

export const DiffTable = ({ diff, expectedColumns }) => {
  const [showFullActual, setShowFullActual] = useState(false);

  return (
    <div className="diff-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Summary Banner */}
      <div style={{ padding: '12px 16px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px', fontSize: '13px', fontWeight: 600 }}>
        {diff.missingRows.length > 0 && <span style={{ color: 'var(--error)' }}>❌ {diff.missingRows.length} rows missing</span>}
        {diff.extraRows.length > 0 && <span style={{ color: 'var(--error)' }}>✗ {diff.extraRows.length} extra rows</span>}
        {diff.mismatchedRows.length > 0 && <span style={{ color: '#e67e22' }}>⚠️ {diff.mismatchedRows.length} rows with wrong values</span>}
        <span style={{ color: 'var(--success)' }}>✓ {diff.matchedRows.length} rows correct</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowFullActual(!showFullActual)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
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
                <tr>{expectedColumns.map((col, i) => <th key={i}>{col}</th>)}</tr>
              </thead>
              <tbody>
                {/* Matched Rows */}
                {diff.matchedRows.map((row, i) => (
                  <tr key={`match-exp-${i}`} className="diff-match">
                    {row.map((cell, j) => <TableCell key={j} value={cell} />)}
                  </tr>
                ))}
                
                {/* Mismatched Rows */}
                {diff.mismatchedRows.map((mismatch, i) => (
                  <tr key={`mismatch-exp-${i}`} className="diff-mismatch-row">
                    {mismatch.expected.map((cell, j) => <TableCell key={j} value={cell} />)}
                  </tr>
                ))}

                {/* Missing Rows */}
                {diff.missingRows.map((row, i) => (
                  <tr key={`missing-${i}`} className="diff-missing" style={{ background: 'rgba(239,68,68,0.1)' }}>
                    {row.map((cell, j) => <TableCell key={j} value={cell} />)}
                  </tr>
                ))}
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
                <tr>{expectedColumns.map((col, i) => <th key={i}>{col}</th>)}</tr>
              </thead>
              <tbody>
                {showFullActual ? (
                  <>
                    {[...diff.matchedRows, ...diff.mismatchedRows.map(m => m.actual), ...diff.extraRows].map((row, i) => (
                      <tr key={`full-act-${i}`}>
                        {row.map((cell, j) => <TableCell key={j} value={cell} />)}
                      </tr>
                    ))}
                  </>
                ) : (
                  <>
                    {/* Matched Rows */}
                    {diff.matchedRows.map((row, i) => (
                      <tr key={`match-act-${i}`} className="diff-match">
                        {row.map((cell, j) => <TableCell key={j} value={cell} />)}
                      </tr>
                    ))}
                    
                    {/* Mismatched Rows (Highlight differing cells) */}
                    {diff.mismatchedRows.map((mismatch, i) => (
                      <tr key={`mismatch-act-${i}`}>
                        {mismatch.actual.map((cell, j) => {
                          const isWrongValue = String(cell).trim() !== String(mismatch.expected[j]).trim();
                          return (
                            <td key={j} style={isWrongValue ? { background: 'rgba(230,126,34,0.15)', color: '#e67e22', fontWeight: 600 } : {}}>
                              <TableCell value={cell} />
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                    {/* Extra Rows */}
                    {diff.extraRows.map((row, i) => (
                      <tr key={`extra-${i}`} className="diff-extra" style={{ background: 'rgba(239,68,68,0.1)', textDecoration: 'line-through', opacity: 0.7 }}>
                        {row.map((cell, j) => <TableCell key={j} value={cell} />)}
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
