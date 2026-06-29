import React, { useState } from 'react';
import { TableCell } from '@/features/visualizers/NullVisualizer';

const getGroupConstituents = async (executeQuery, sql, groupByCols, rowData, allColumns) => {
  // Find the base FROM and WHERE clauses
  const fromMatch = sql.match(/FROM\s+([\s\S]+?)(?:GROUP BY|ORDER BY|LIMIT|$)/i);
  if (!fromMatch) return null;
  
  const baseFromWhere = fromMatch[1];
  
  // Build WHERE conditions for the grouped columns
  const conditions = [];
  groupByCols.forEach((colName) => {
    const colIndex = allColumns.indexOf(colName);
    if (colIndex !== -1) {
      const val = rowData[colIndex];
      if (val === null) {
        conditions.push(`${colName} IS NULL`);
      } else if (typeof val === 'string') {
        conditions.push(`${colName} = '${val.replace(/'/g, "''")}'`);
      } else {
        conditions.push(`${colName} = ${val}`);
      }
    }
  });

  const conditionString = conditions.length > 0 ? (baseFromWhere.toUpperCase().includes('WHERE') ? ' AND ' : ' WHERE ') + conditions.join(' AND ') : '';
  
  const query = `SELECT * FROM ${baseFromWhere}${conditionString} LIMIT 50`;
  
  try {
    const res = await executeQuery(query);
    if (res.rows && res.rows.length > 0) {
      return { columns: res.columns, values: res.rows };
    }
    return null;
  } catch (err) {
    console.error("Constituent fetch failed:", err);
    return null;
  }
};

const extractGroupByColumns = (sql) => {
  const match = sql.match(/GROUP\s+BY\s+([a-zA-Z0-9_,\s]+)(?:HAVING|ORDER BY|LIMIT|$)/i);
  if (match) {
    return match[1].split(',').map(s => s.trim());
  }
  return [];
};

export const GroupedResultRow = ({ row, sql, executeQuery, columns }) => {
  const [expanded, setExpanded] = useState(false);
  const [constituents, setConstituents] = useState(null);
  const [loading, setLoading] = useState(false);

  const groupByCols = extractGroupByColumns(sql);
  const hasGroupBy = groupByCols.length > 0;

  const handleExpand = async () => {
    if (!hasGroupBy) return;
    
    if (!expanded) {
      setLoading(true);
      const data = await getGroupConstituents(executeQuery, sql, groupByCols, row, columns);
      setConstituents(data);
      setLoading(false);
    }
    setExpanded(!expanded);
  };

  if (!hasGroupBy) {
    return (
      <tr>
        {row.map((cell, ci) => <TableCell key={ci} value={cell} />)}
      </tr>
    );
  }

  return (
    <>
      <tr onClick={handleExpand} style={{ cursor: 'pointer', background: expanded ? 'var(--surface-2)' : 'transparent' }} title="Click to see rows in this group">
        <td style={{ width: '30px', textAlign: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
          {expanded ? '▼' : '▶'}
        </td>
        {row.map((cell, ci) => <TableCell key={ci} value={cell} />)}
      </tr>
      
      {expanded && (
        <tr className="constituent-row">
          <td colSpan={columns.length + 1} style={{ padding: 0, background: 'var(--bg)' }}>
            <div style={{ padding: '12px 12px 12px 42px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                ↳ Constituent Rows ({constituents?.values?.length || 0})
              </div>
              
              {loading ? (
                <div style={{ color: 'var(--muted)', fontSize: '12px' }}>Loading constituent rows...</div>
              ) : constituents ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="results-table" style={{ margin: 0, opacity: 0.9 }}>
                    <thead>
                      <tr>
                        {constituents.columns.map((col, i) => <th key={i}>{col}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {constituents.values.map((cRow, ri) => (
                        <tr key={ri}>
                          {cRow.map((cell, ci) => <TableCell key={ci} value={cell} />)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ color: 'var(--error)', fontSize: '12px' }}>Could not fetch constituent rows.</div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};
