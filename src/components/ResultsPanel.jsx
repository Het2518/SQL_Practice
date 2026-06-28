export function ResultsPanel({
  result,
  validation,
  isRunning,
  onHint,
  onShowSolution,
  hasQuestion,
  hintsUsed
}) {
  if (isRunning) {
    return <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 12,
      color: 'var(--muted)'
    }}>
        <div className="animate-pulse-glow" style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: 'var(--accent)'
      }} />
        <span>Running query...</span>
      </div>;
  }
  if (!result) {
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 8,
      color: 'var(--muted)',
      fontSize: 13
    }}>
        <span style={{
        fontSize: 32
      }}>▶</span>
        <span>Run your query to see results</span>
        <span style={{
        fontSize: 11
      }}>Ctrl+Enter to execute</span>
      </div>;
  }
  const isError = !!result.error;
  const isDML = !isError && result.columns.length === 0;
  return <div style={{
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  }}>
      {/* Toolbar */}
      <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 14px',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
      overflowX: 'auto'
    }}>
        {/* Validation banner */}
        {validation && <div className={validation.isCorrect ? 'banner-correct' : 'banner-incorrect'} style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
            <span style={{
          flexShrink: 0
        }}>{validation.isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}</span>
            <span style={{
          fontSize: 12,
          fontWeight: 400,
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>{validation.message}</span>
          </div>}

        {isError && !validation && <div className="banner-error" style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
            <span style={{
          flexShrink: 0
        }}>⚠️ SQL Error</span>
            <span style={{
          fontSize: 12,
          fontWeight: 400,
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>{result.error}</span>
          </div>}

        {isDML && !isError && <div className="banner-correct" style={{
        whiteSpace: 'nowrap'
      }}>
            <span style={{
          flexShrink: 0
        }}>✅ Statement Executed</span>
            <span style={{
          fontSize: 12,
          fontWeight: 400
        }}>DML statement ran successfully.</span>
          </div>}

        {!validation && !isError && !isDML && <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: 'var(--muted)',
        fontSize: 12,
        whiteSpace: 'nowrap'
      }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>📊</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {result.rows.length} row{result.rows.length !== 1 ? 's' : ''} × {result.columns.length} col{result.columns.length !== 1 ? 's' : ''}
              </span>
            </span>
            {result.execTimeMs !== undefined && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>⏱️</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {result.execTimeMs.toFixed(1)} ms
                </span>
              </span>
            )}
          </div>}

        <div style={{
        flex: 1,
        minWidth: 16
      }} />

        {hasQuestion && <>
            <button id="btn-hint" onClick={onHint} className="btn btn-ghost" style={{
          fontSize: 12
        }}>
              💡 Hint {hintsUsed > 0 ? `(${hintsUsed}/3)` : ''}
            </button>
            <button id="btn-show-solution" onClick={onShowSolution} className="btn btn-ghost" style={{
          fontSize: 12,
          color: 'var(--muted)'
        }}>
              🔑 Solution
            </button>
          </>}
      </div>

      {/* Results Table */}
      {!isError && !isDML && result.columns.length > 0 && <div style={{
      flex: 1,
      overflow: 'auto'
    }}>
          <table className="results-table">
            <thead>
              <tr>
                {result.columns.map((col, i) => <th key={i}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {result.rows.slice(0, 500).map((row, ri) => <tr key={ri}>
                  {row.map((cell, ci) => {
              const isMismatch = validation && !validation.isCorrect && validation.mismatchedRows?.includes(ri);
              const isNull = cell === null || cell === undefined;
              return <td key={ci} className={isMismatch ? 'mismatch' : isNull ? 'null-val' : ''}>
                        {isNull ? 'NULL' : String(cell)}
                      </td>;
            })}
                </tr>)}
            </tbody>
          </table>
          {result.rows.length > 500 && <div style={{
        padding: '8px 12px',
        fontSize: 11,
        color: 'var(--muted)',
        borderTop: '1px solid var(--border)',
        textAlign: 'center'
      }}>
              Showing first 500 rows of {result.rows.length}
            </div>}
        </div>}

      {isError && <div style={{
      padding: 16,
      flex: 1
    }}>
          <pre style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--error)',
        whiteSpace: 'pre-wrap',
        lineHeight: 1.6
      }}>
            {result.error}
          </pre>
        </div>}

      {isDML && !isError && <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--muted)',
      fontSize: 13
    }}>
          DML statement executed. Use Reset DB to restore original data.
        </div>}
    </div>;
}