import React, { useState, useEffect } from 'react';
import { parseQueryClauses, extractFromTable, buildWhereOnlySql } from '../utils/sqlAnalysis';

export function ExecutionOrderExplainer({ sql, db }) {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sql || !db) return;

    setLoading(true);
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
            const res = db.exec(`SELECT COUNT(*) FROM ${fromTable}`);
            fromRows = res[0]?.values[0][0];
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
          const res = db.exec(`SELECT COUNT(*) FROM (${whereSql})`);
          whereRows = res[0]?.values[0][0];
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
        const res = db.exec(sql);
        const finalRows = res[0]?.values?.length ?? 0;
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
      console.error("Execution breakdown failed", err);
    } finally {
      setLoading(false);
    }
  }, [sql, db]);

  if (loading) return <div style={{ padding: 16, color: 'var(--muted)' }}>Analyzing execution order...</div>;
  if (!steps.length) return null;

  return (
    <div className="execution-order-panel" style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
      <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--text)' }}>🧠 How SQL Executed Your Query</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {steps.map(step => (
          <div key={step.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '8px 12px',
            background: step.active ? 'var(--surface)' : 'transparent',
            border: `1px solid ${step.active ? 'var(--border)' : 'transparent'}`,
            borderRadius: '6px',
            opacity: step.active ? 1 : 0.5
          }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              background: step.active ? 'var(--primary)' : 'var(--border)', 
              color: 'var(--bg)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700
            }}>
              {step.id}
            </div>
            <div style={{ width: '100px', fontWeight: 600, fontSize: '12px' }}>
              {step.clause}
            </div>
            <div style={{ flex: 1, fontSize: '13px', color: step.active ? 'var(--text)' : 'var(--muted)' }}>
              {step.description}
            </div>
            {step.rowCount !== undefined && (
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success)' }}>
                {step.rowCount} rows
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
