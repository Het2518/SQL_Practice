import React, { useState, useEffect } from 'react';
import { Database, Search, FastForward, GitCommit, ListTree, Activity } from 'lucide-react';

// Parses SQLite EXPLAIN QUERY PLAN into a nested tree structure
const buildPlanTree = (rows) => {
  if (!rows || rows.length === 0) return [];
  
  const nodeMap = {};
  const roots = [];

  rows.forEach(row => {
    const [id, parentId, _, detail] = row;
    nodeMap[id] = {
      id,
      parentId,
      detail,
      children: [],
      ...analyzeDetail(detail)
    };
  });

  rows.forEach(row => {
    const [id, parentId] = row;
    if (parentId === 0) {
      roots.push(nodeMap[id]);
    } else if (nodeMap[parentId]) {
      nodeMap[parentId].children.push(nodeMap[id]);
    } else {
      roots.push(nodeMap[id]);
    }
  });

  return roots;
};

// Extracts metadata from SQLite detail string for visualization
const analyzeDetail = (detail) => {
  let type = 'OTHER';
  let target = '';
  let warning = false;
  let icon = <GitCommit size={16} />;
  let color = 'var(--text)';

  if (detail.includes('SCAN TABLE') || detail.includes('SCAN')) {
    type = 'SCAN';
    target = detail.match(/TABLE\s+([a-zA-Z0-9_]+)/i)?.[1] || 'Table';
    warning = true; // Full table scans are generally bad
    icon = <Search size={16} />;
    color = '#e67e22'; // Warning orange
  } else if (detail.includes('SEARCH TABLE') || detail.includes('SEARCH')) {
    type = 'SEARCH';
    target = detail.match(/TABLE\s+([a-zA-Z0-9_]+)/i)?.[1] || 'Table';
    const index = detail.match(/INDEX\s+([a-zA-Z0-9_]+)/i)?.[1] || '';
    icon = <FastForward size={16} />;
    color = '#10b981'; // Success green
  } else if (detail.includes('USE TEMP B-TREE')) {
    type = 'B-TREE';
    target = detail.split('FOR ')[1] || 'Sorting/Grouping';
    icon = <ListTree size={16} />;
    color = '#3b82f6'; // Info blue
  } else if (detail.includes('SUBQUERY')) {
    type = 'SUBQUERY';
    icon = <Database size={16} />;
    color = '#8b5cf6'; // Purple
  } else if (detail.includes('COMPOUND QUERY')) {
    type = 'COMPOUND';
    icon = <Activity size={16} />;
    color = '#ec4899'; // Pink
  }

  return { type, target, warning, icon, color };
};

const PlanNode = ({ node, isLast }) => {
  return (
    <div className="relative pl-6 mt-4">
      {/* Tree Line connections */}
      <div 
        className="absolute left-0 -top-4 w-0.5 bg-border z-0"
        style={{ bottom: isLast ? 'calc(100% - 20px)' : 0 }} 
      />
      <div className="absolute left-0 top-5 w-6 h-0.5 bg-border z-0" />

      <div 
        className={`flex items-start gap-3 bg-surface p-3 rounded-lg relative z-10 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border ${
          node.warning ? 'border-orange-500/30' : 'border-border'
        }`}
      >
        <div 
          className="p-2 rounded-md flex"
          style={{ background: `${node.color}20`, color: node.color }}
        >
          {node.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[13px] tracking-[0.02em]" style={{ color: node.color }}>
              {node.type}
            </span>
            {node.warning && (
              <span className="text-[10px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded font-semibold">
                FULL SCAN
              </span>
            )}
          </div>
          <div className="text-[13px] text-text-secondary font-mono">
            {node.detail}
          </div>
        </div>
      </div>

      <div className="ml-3">
        {node.children.map((child, i) => (
          <PlanNode key={child.id} node={child} isLast={i === node.children.length - 1} />
        ))}
      </div>
    </div>
  );
};

export function ExecutionPlanTree({ sql, executeQuery, refreshTrigger = 0 }) {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!sql || !executeQuery) return;

    const analyze = async () => {
      setLoading(true);
      setError(null);
      try {
        const planRes = await executeQuery(`EXPLAIN QUERY PLAN ${sql}`);
        if (planRes.error) throw new Error(planRes.error);
        
        if (mounted) {
          const roots = buildPlanTree(planRes.rows || []);
          setTree(roots);
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to explain query plan.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    analyze();
    return () => { mounted = false; };
  }, [sql, executeQuery, refreshTrigger]);

  if (loading) {
    return (
      <div className="p-8 text-center text-muted">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Executing SQLite Plan...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-error bg-error/10 rounded-lg m-4">{error}</div>;
  }

  if (!tree || tree.length === 0) {
    return <div className="p-6 text-muted">No execution plan generated.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2.5 rounded-xl">
          <ListTree size={20} color="#fff" />
        </div>
        <div>
          <h3 className="m-0 text-base font-bold">Physical Execution Tree</h3>
          <div className="text-xs text-muted mt-0.5">Exactly how the SQLite engine executed your query.</div>
        </div>
      </div>

      <div className="bg-surface-2 pt-5 pr-6 pb-8 pl-2 rounded-xl border border-border">
        {tree.map((node, i) => (
          <PlanNode key={node.id} node={node} isLast={i === tree.length - 1} />
        ))}
      </div>
    </div>
  );
}
