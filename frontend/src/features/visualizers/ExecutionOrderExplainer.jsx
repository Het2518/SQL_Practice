import React, { useState, useEffect } from 'react';
import { parseQueryClauses, extractFromTable, buildWhereOnlySql } from '@/utils/sqlAnalysis';

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
    <div className="py-4 px-5 border-b border-border">
      <div className="flex items-center gap-2 mb-3 font-semibold text-[13px] text-text">
        <span className="text-base">⏱️</span>
        Logical Execution Order
        {loading && <span className="animate-pulse-glow w-2 h-2 rounded-full bg-accent ml-2" />}
      </div>
      <div className="text-xs text-text-secondary mb-4">
        SQL is written logically, but executed in a specific sequence. Here is how the database engine processes your query:
      </div>

      <div className="flex flex-col gap-1.5 relative">
        <div className="absolute left-[11px] top-2.5 bottom-2.5 w-0.5 bg-border z-0" />
        {steps.map((step, idx) => (
          <div key={step.id} className={`flex gap-3 relative z-10 ${step.active ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step.active 
                ? 'bg-primary text-white shadow-[0_0_0_4px_var(--surface-2)]' 
                : 'bg-surface-3 text-muted shadow-[0_0_0_4px_var(--surface)]'
            }`}>
              {idx + 1}
            </div>
            <div className={`flex-1 rounded-md px-3 py-2 flex justify-between items-center ${
              step.active ? 'bg-surface border border-border' : 'bg-transparent border border-transparent'
            }`}>
              <div>
                <div className={`font-mono font-semibold text-xs mb-0.5 ${step.active ? 'text-primary-hover' : 'text-inherit'}`}>
                  {step.clause}
                </div>
                <div className="text-[11px] text-text-secondary">
                  {step.description}
                </div>
              </div>
              {step.rowCount !== undefined && (
                <div className="text-[10px] bg-surface-2 px-1.5 py-0.5 rounded text-muted border border-border whitespace-nowrap">
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
