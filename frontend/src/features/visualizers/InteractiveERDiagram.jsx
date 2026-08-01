import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { DB_INFO } from '@/data/schemas';
import { Search, Database } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { TableNode } from './TableNode';

const nodeTypes = {
  table: TableNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const NODE_WIDTH = 300;
const NODE_HEIGHT_ESTIMATE = 150; // Will be adjusted by Dagre dynamically, but good enough for init

const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 50 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT_ESTIMATE });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT_ESTIMATE / 2,
      },
    };
    return newNode;
  });

  return { nodes: newNodes, edges };
};

function ERDiagramFlow({ dbName, onClose }) {
  const trapRef = useFocusTrap(true);
  const dbInfo = DB_INFO[dbName];
  const tables = dbInfo?.tables || [];

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFocus, setActiveFocus] = useState(null);
  
  const { fitView, setCenter } = useReactFlow();

  // Initialize Nodes and Edges
  useEffect(() => {
    if (tables.length === 0) return;

    const initialNodes = tables.map((t) => ({
      id: t.name,
      type: 'table',
      data: { 
        table: t,
        isFocus: false,
        activeConnections: null 
      },
      position: { x: 0, y: 0 },
    }));

    const initialEdges = [];
    tables.forEach((t) => {
      t.columns.forEach((c) => {
        if (c.isForeignKey && c.references) {
          const referencedTable = tables.find(rt => rt.name === c.references);
          const referencedPk = referencedTable?.columns.find(rc => rc.isPrimaryKey)?.name || 'id';

          initialEdges.push({
            id: `e-${t.name}-${c.references}`,
            source: c.references, 
            sourceHandle: `${c.references}-${referencedPk}-source`,
            target: t.name,
            targetHandle: `${t.name}-${c.name}-target`,
            type: 'smoothstep',
            animated: false,
            style: { stroke: 'var(--border)', strokeWidth: 1.5, opacity: 0.4 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: 'var(--border)',
            },
          });
        }
      });
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      'LR'
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Give it a tiny delay to render then fit view
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 800 });
    }, 100);
  }, [tables, setNodes, setEdges, fitView]);

  // Handle active focus updates (Highlighting lines and nodes)
  useEffect(() => {
    if (!activeFocus) {
      setNodes((nds) => nds.map(n => ({
        ...n,
        data: { ...n.data, isFocus: false, activeConnections: null }
      })));
      setEdges((eds) => eds.map(e => ({
        ...e,
        style: { stroke: 'var(--border)', strokeWidth: 1.5, opacity: 0.4 },
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--border)' }
      })));
      return;
    }

    // Find connections
    const connectedNodeIds = new Set([activeFocus]);
    edges.forEach(e => {
      if (e.source === activeFocus) connectedNodeIds.add(e.target);
      if (e.target === activeFocus) connectedNodeIds.add(e.source);
    });

    setNodes((nds) => nds.map(n => ({
      ...n,
      data: { 
        ...n.data, 
        isFocus: n.id === activeFocus, 
        activeConnections: connectedNodeIds 
      }
    })));

    setEdges((eds) => eds.map(e => {
      const isConnected = e.source === activeFocus || e.target === activeFocus;
      return {
        ...e,
        style: { 
          stroke: isConnected ? 'var(--primary)' : 'var(--border)', 
          strokeWidth: isConnected ? 2.5 : 1.5, 
          opacity: isConnected ? 1 : 0.1 
        },
        animated: isConnected,
        markerEnd: { 
          type: MarkerType.ArrowClosed, 
          color: isConnected ? 'var(--primary)' : 'var(--border)' 
        }
      };
    }));

    // Pan to node
    const targetNode = nodes.find(n => n.id === activeFocus);
    if (targetNode) {
      setCenter(targetNode.position.x + NODE_WIDTH/2, targetNode.position.y + 100, { zoom: 1.2, duration: 800 });
    }

  }, [activeFocus]); // Intentionally omitting edges/nodes from deps to avoid infinite loops

  return (
    <div ref={trapRef} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'var(--bg)', display: 'flex' }}>
      
      {/* Left Sidebar */}
      <div style={{ width: 380, borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', zIndex: 20, boxShadow: '4px 0 24px rgba(0,0,0,0.05)', flexShrink: 0 }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 22 }}>{dbInfo.icon}</span>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{dbInfo.label} Schema</h2>
             </div>
             <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{tables.length} Tables Available</div>
           </div>
           <button onClick={onClose} style={{ background: 'var(--surface-2)', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>✕</button>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input 
              type="text" 
              placeholder="Search tables..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* Table List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
           {tables.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map(t => {
             const isSelected = activeFocus === t.name;
             return (
               <div 
                  key={t.name}
                  onClick={() => setActiveFocus(isSelected ? null : t.name)}
                  style={{ 
                    marginBottom: 8,
                    padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                    background: isSelected ? 'var(--primary-muted)' : 'var(--surface)',
                    border: `1px solid ${isSelected ? 'var(--primary-light)' : 'var(--border)'}`,
                    boxShadow: isSelected ? '0 4px 12px rgba(139, 92, 246, 0.1)' : '0 2px 8px rgba(0,0,0,0.02)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
               >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                     <Database size={16} color={isSelected ? "var(--primary)" : "var(--muted)"} />
                     <span style={{ fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text)', fontSize: 14 }}>{t.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: isSelected ? 'var(--primary)' : 'var(--muted)', background: isSelected ? 'var(--surface)' : 'var(--surface-2)', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>{t.columns.length}</span>
               </div>
             )
           })}
        </div>
      </div>

      {/* Right Canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'var(--bg)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setActiveFocus(node.id === activeFocus ? null : node.id)}
          onPaneClick={() => setActiveFocus(null)}
          fitView
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{ zIndex: 0 }}
        >
          <Background color="var(--border)" gap={24} size={1} />
          <Controls 
            style={{ 
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)', 
              border: '1px solid var(--border)',
              borderRadius: 8,
              overflow: 'hidden'
            }} 
          />
          <MiniMap 
            nodeColor={(node) => node.id === activeFocus ? 'var(--primary)' : 'var(--surface-2)'}
            maskColor="var(--bg)"
            style={{ 
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

// Wrap with ReactFlowProvider
export const InteractiveERDiagram = React.memo(function WrappedERDiagram(props) {
  return (
    <ReactFlowProvider>
      <ERDiagramFlow {...props} />
    </ReactFlowProvider>
  );
});
