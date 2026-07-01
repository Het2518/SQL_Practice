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
    <div style={{ position: 'relative', paddingLeft: '24px', marginTop: '16px' }}>
      {/* Tree Line connections */}
      <div style={{
        position: 'absolute', left: 0, top: '-16px', bottom: isLast ? 'calc(100% - 20px)' : 0,
        width: '2px', background: 'var(--border)', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', left: 0, top: '20px', width: '24px', height: '2px',
        background: 'var(--border)', zIndex: 0
      }} />

      <div style={{ 
        display: 'flex', alignItems: 'flex-start', gap: '12px', 
        background: 'var(--surface)', border: `1px solid ${node.warning ? 'rgba(230,126,34,0.3)' : 'var(--border)'}`, 
        padding: '12px', borderRadius: '8px', position: 'relative', zIndex: 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          background: `${node.color}20`, color: node.color, 
          padding: '8px', borderRadius: '6px', display: 'flex' 
        }}>
          {node.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontWeight: 700, color: node.color, fontSize: '13px', letterSpacing: '0.02em' }}>
              {node.type}
            </span>
            {node.warning && (
              <span style={{ fontSize: '10px', background: 'rgba(230,126,34,0.1)', color: '#e67e22', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                FULL SCAN
              </span>
            )}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {node.detail}
          </div>
        </div>
      </div>

      <div style={{ marginLeft: '12px' }}>
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
    return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}><div className="spinner" style={{ margin: '0 auto 16px' }} />Executing SQLite Plan...</div>;
  }

  if (error) {
    return <div style={{ padding: '24px', color: 'var(--error)', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', margin: '16px' }}>{error}</div>;
  }

  if (!tree || tree.length === 0) {
    return <div style={{ padding: '24px', color: 'var(--muted)' }}>No execution plan generated.</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', padding: 10, borderRadius: 10 }}>
          <ListTree size={20} color="#fff" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Physical Execution Tree</h3>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Exactly how the SQLite engine executed your query.</div>
        </div>
      </div>

      <div style={{ background: 'var(--surface-2)', padding: '20px 24px 32px 8px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        {tree.map((node, i) => (
          <PlanNode key={node.id} node={node} isLast={i === tree.length - 1} />
        ))}
      </div>
    </div>
  );
}
