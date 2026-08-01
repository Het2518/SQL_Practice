import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
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
import { Search, Database, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
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

// Custom Controls Panel — fully themed, no React Flow default styles
function CustomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const btnClass = "w-9 h-9 flex items-center justify-center bg-transparent border-none cursor-pointer text-text-secondary rounded-md transition-colors hover:bg-surface-2 hover:text-text";

  return (
    <div className="absolute bottom-6 left-4 z-10 flex flex-col gap-0.5 bg-surface border border-border rounded-xl p-1 shadow-lg">
      <button
        onClick={() => zoomIn({ duration: 300 })}
        title="Zoom In"
        className={btnClass}
      >
        <ZoomIn size={16} strokeWidth={2} />
      </button>
      <button
        onClick={() => zoomOut({ duration: 300 })}
        title="Zoom Out"
        className={btnClass}
      >
        <ZoomOut size={16} strokeWidth={2} />
      </button>
      <div className="h-px bg-border mx-1 my-0.5" />
      <button
        onClick={() => fitView({ padding: 0.2, duration: 600 })}
        title="Fit to Screen"
        className={btnClass}
      >
        <Maximize2 size={16} strokeWidth={2} />
      </button>
    </div>
  );
}

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
    <div ref={trapRef} className="fixed inset-0 z-[9999] bg-bg flex">
      
      {/* Left Sidebar */}
      <div className="w-[380px] border-r border-border bg-surface flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.05)] shrink-0">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
           <div>
             <div className="flex items-center gap-2 mb-1">
                <span className="text-[22px]">{dbInfo.icon}</span>
                <h2 className="m-0 text-lg font-bold text-text">{dbInfo.label} Schema</h2>
             </div>
             <div className="text-[13px] text-muted font-medium">{tables.length} Tables Available</div>
           </div>
           <button onClick={onClose} className="bg-surface-2 border-none w-8 h-8 rounded-lg cursor-pointer flex items-center justify-center text-text hover:bg-surface-3 transition-colors">✕</button>
        </div>

        {/* Search */}
        <div className="py-4 px-6 border-b border-border">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search tables..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full py-2.5 pr-3.5 pl-9 rounded-lg border border-border bg-bg text-text text-sm outline-none transition-colors box-border focus:border-primary"
            />
          </div>
        </div>

        {/* Table List */}
        <div className="flex-1 overflow-y-auto py-4 px-5">
           {tables.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map(t => {
             const isSelected = activeFocus === t.name;
             return (
               <div 
                  key={t.name}
                  onClick={() => setActiveFocus(isSelected ? null : t.name)}
                  className={`mb-2 py-3 px-4 rounded-xl cursor-pointer flex justify-between items-center transition-all duration-200 border ${isSelected ? 'bg-primary-muted border-primary/30 shadow-[0_4px_12px_rgba(139,92,246,0.1)]' : 'bg-surface border-border shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-primary/50'}`}
               >
                  <div className="flex items-center gap-2.5">
                     <Database size={16} className={isSelected ? "text-primary" : "text-muted"} />
                     <span className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-text'}`}>{t.name}</span>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${isSelected ? 'text-primary bg-surface' : 'text-muted bg-surface-2'}`}>{t.columns.length}</span>
               </div>
             )
           })}
        </div>
      </div>

      {/* Right Canvas */}
      <div className="flex-1 relative overflow-hidden bg-bg">
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

          {/* Custom Controls */}
          <CustomControls />

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
