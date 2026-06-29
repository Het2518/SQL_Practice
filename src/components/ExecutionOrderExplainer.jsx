import React, { useState, useEffect } from 'react';
import { parseQueryClauses, extractFromTable, buildWhereOnlySql } from '../utils/sqlAnalysis';

export function ExecutionOrderExplainer({ sql, executeQuery }) {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!sql || !executeQuery) return;

    setLoading(true);
    
    const analyze = async () => {
      const clauses = parseQueryClauses(sql);
      const newSteps = [];
      let stepCount = 1;

      const addStep = (clause, desc, isActive, rowCount) => {
        newSteps.push({ id: stepCount++, clause, description: desc, active: isActive, rowCount });
      };

      try {
        // 1. CTE / WITH
        if (clauses.hasCTE) {
          addStep('WITH (CTE)', 'Materialized temporary result set(s) for reuse', true, undefined);
        } else {
          addStep('WITH', '(Not used)', false, undefined);
        }

        // 2. FROM / JOIN
        let fromRows = undefined;
        if (clauses.hasFROM) {
          const fromTable = extractFromTable(sql);
          if (fromTable) {
            try {
              const res = await executeQuery(`SELECT COUNT(*) FROM ${fromTable}`);
              if (res.rows && res.rows.length) fromRows = res.rows[0][0];
            } catch { /* ignore */ }
          }
          
          const joinText = clauses.hasJOIN ? 'Loaded and joined tables' : 'Loaded base table';
          addStep('FROM / JOIN', joinText, true, fromRows);
        } else {
          addStep('FROM', '(Not used - No table source)', false, undefined);
        }

        // 3. WHERE
        let whereRows = undefined;
        if (clauses.hasWHERE) {
          try {
            const whereSql = buildWhereOnlySql(sql);
            const res = await executeQuery(`SELECT COUNT(*) FROM (${whereSql})`);
            if (res.rows && res.rows.length) whereRows = res.rows[0][0];
          } catch { /* ignore */ }
          addStep('WHERE', 'Filtered individual rows based on conditions', true, whereRows);
        } else {
          addStep('WHERE', '(Not used)', false, undefined);
        }

        // 4. GROUP BY
        if (clauses.hasGROUPBY) {
          addStep('GROUP BY', 'Aggregated filtered rows into logical groups', true, undefined);
        } else {
          addStep('GROUP BY', '(Not used)', false, undefined);
        }

        // 5. HAVING
        if (clauses.hasHAVING) {
          addStep('HAVING', 'Filtered groups based on aggregate conditions', true, undefined);
        } else {
          addStep('HAVING', '(Not used)', false, undefined);
        }

        // 6. SELECT
        try {
          const res = await executeQuery(sql);
          const finalRows = res.rows?.length ?? 0;
          addStep('SELECT', 'Projected columns and computed expressions', true, finalRows);
        } catch {
          addStep('SELECT', 'Projected columns and computed expressions', true, undefined);
        }

        // 7. DISTINCT
        if (clauses.hasDISTINCT) {
          addStep('DISTINCT', 'Removed duplicate rows from the result set', true, undefined);
        } else {
          addStep('DISTINCT', '(Not used)', false, undefined);
        }

        // 8. ORDER BY
        if (clauses.hasORDERBY) {
          addStep('ORDER BY', 'Sorted the final result set', true, undefined);
        } else {
          addStep('ORDER BY', '(Not used)', false, undefined);
        }

        // 9. LIMIT
        if (clauses.hasLIMIT) {
          addStep('LIMIT', 'Truncated results for pagination/limits', true, undefined);
        } else {
          addStep('LIMIT', '(Not used)', false, undefined);
        }

      setSteps(newSteps);
    } catch (err) {
      console.error(err);
    } finally {
      if (mounted) setLoading(false);
    }
    };
    
    analyze();
    return () => { mounted = false; };
  }, [sql, executeQuery]);

  if (!sql) return null;

  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
        <span style={{ fontSize: 16 }}>⏱️</span>
        Logical Execution Order
        {loading && <span className="animate-pulse-glow" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginLeft: 8 }} />}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
        SQL is written logically, but executed in a specific sequence. Here is how the database engine processes your query:
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: 11,
          top: 10,
          bottom: 10,
          width: 2,
          background: 'var(--border)',
          zIndex: 0
        }} />
        {steps.map((step, idx) => (
          <div key={step.id} style={{ 
            display: 'flex', 
            gap: 12, 
            position: 'relative', 
            zIndex: 1,
            opacity: step.active ? 1 : 0.4
          }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: step.active ? 'var(--primary)' : 'var(--surface-3)',
              color: step.active ? 'white' : 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              boxShadow: step.active ? '0 0 0 4px var(--surface-2)' : '0 0 0 4px var(--surface)'
            }}>
              {idx + 1}
            </div>
            <div style={{
              flex: 1,
              background: step.active ? 'var(--surface)' : 'transparent',
              border: `1px solid ${step.active ? 'var(--border)' : 'transparent'}`,
              borderRadius: 6,
              padding: '8px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12, color: step.active ? 'var(--primary-hover)' : 'inherit', marginBottom: 2 }}>
                  {step.clause}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {step.description}
                </div>
              </div>
              {step.rowCount !== undefined && (
                <div style={{ 
                  fontSize: 10, 
                  background: 'var(--surface-2)', 
                  padding: '2px 6px', 
                  borderRadius: 4,
                  color: 'var(--muted)',
                  border: '1px solid var(--border)',
                  whiteSpace: 'nowrap'
                }}>
                  {step.rowCount} row{step.rowCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
