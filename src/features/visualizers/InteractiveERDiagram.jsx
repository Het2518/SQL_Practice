import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { DB_INFO } from '@/data/schemas';
import { Search, Key, Link as LinkIcon, ZoomIn, ZoomOut, Maximize, Database } from 'lucide-react';

const NODE_WIDTH = 300;
const HEADER_HEIGHT = 46;
const ROW_HEIGHT = 32;

export const InteractiveERDiagram = React.memo(function InteractiveERDiagram({ dbName, onClose }) {
  const dbInfo = DB_INFO[dbName];
  const tables = dbInfo?.tables || [];

  const [nodes, setNodes] = useState({});
  const [layoutBounds, setLayoutBounds] = useState({ width: 0, height: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  
  const [highlightedTable, setHighlightedTable] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  
  const transformRef = useRef(null);

  // 1. Generate Hierarchical Auto-Layout
  useEffect(() => {
    if (tables.length === 0) return;

    const edges = [];
    tables.forEach(t => t.columns.forEach(c => {
      if (c.isForeignKey && c.references) {
        edges.push({ from: t.name, to: c.references });
      }
    }));

    const levels = {};
    tables.forEach(t => levels[t.name] = 0);
    
    let changed = true;
    let iterations = 0;
    while(changed && iterations < tables.length) {
      changed = false;
      edges.forEach(e => {
        if(levels[e.from] <= levels[e.to]) {
          levels[e.from] = levels[e.to] + 1;
          changed = true;
        }
      });
      iterations++;
    }

    const usedLevels = Array.from(new Set(Object.values(levels))).sort((a,b) => a-b);
    const levelMap = {};
    usedLevels.forEach((l, idx) => levelMap[l] = idx);
    tables.forEach(t => levels[t.name] = levelMap[levels[t.name]]);

    const levelGroups = {};
    Object.entries(levels).forEach(([name, lvl]) => {
      if(!levelGroups[lvl]) levelGroups[lvl] = [];
      levelGroups[lvl].push(name);
    });

    Object.values(levelGroups).forEach(group => group.sort());

    const initialNodes = {};
    const GAP_X = 140; 
    const GAP_Y = 40;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    Object.keys(levelGroups).forEach(lvl => {
      const levelIdx = parseInt(lvl);
      const group = levelGroups[lvl];
      
      const totalHeight = group.reduce((sum, name) => {
        const t = tables.find(t => t.name === name);
        return sum + HEADER_HEIGHT + (t.columns.length * ROW_HEIGHT) + GAP_Y;
      }, 0);
      
      let yOffset = -totalHeight / 2;

      group.forEach((name) => {
        const table = tables.find(t => t.name === name);
        const height = HEADER_HEIGHT + (table.columns.length * ROW_HEIGHT);
        
        const x = levelIdx * (NODE_WIDTH + GAP_X);
        const y = yOffset;
        
        initialNodes[name] = { table, x, y };
        
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + NODE_WIDTH);
        maxY = Math.max(maxY, y + height);

        yOffset += height + GAP_Y;
      });
    });

    const PADDING = 100;
    Object.values(initialNodes).forEach(n => {
      n.x = n.x - minX + PADDING;
      n.y = n.y - minY + PADDING;
    });

    setNodes(initialNodes);
    setLayoutBounds({ 
      width: maxX - minX + PADDING * 2, 
      height: maxY - minY + PADDING * 2 
    });
  }, [tables]);

  // Smart Panning
  useEffect(() => {
    if (selectedTable && transformRef.current) {
      setTimeout(() => {
         transformRef.current.zoomToElement(`node-${selectedTable}`, 1.2, 500, 'easeOut');
      }, 50);
    }
  }, [selectedTable]);

  const relationships = useMemo(() => {
    const edges = [];
    tables.forEach(table => {
      table.columns.forEach(col => {
        if (col.isForeignKey && col.references) {
          edges.push({ sourceTable: table.name, sourceCol: col.name, targetTable: col.references });
        }
      });
    });
    return edges;
  }, [tables]);

  const activeFocus = highlightedTable || selectedTable;
  const activeConnections = activeFocus ? (
    new Set([
      activeFocus,
      ...relationships.filter(r => r.sourceTable === activeFocus || r.targetTable === activeFocus).map(r => r.sourceTable === activeFocus ? r.targetTable : r.sourceTable)
    ])
  ) : null;

  const renderLines = () => {
    return relationships.map((edge, idx) => {
      const sourceNode = nodes[edge.sourceTable];
      const targetNode = nodes[edge.targetTable];
      if (!sourceNode || !targetNode) return null;

      let sourceColIndex = sourceNode.table.columns.findIndex(c => c.name === edge.sourceCol);
      if (sourceColIndex === -1) sourceColIndex = 0;
      
      const sourceY = sourceNode.y + HEADER_HEIGHT + (sourceColIndex * ROW_HEIGHT + ROW_HEIGHT/2);
      const targetY = targetNode.y + HEADER_HEIGHT/2; 

      const isSourceLeft = sourceNode.x < targetNode.x;
      const startX = isSourceLeft ? sourceNode.x + NODE_WIDTH : sourceNode.x;
      const endX = isSourceLeft ? targetNode.x : targetNode.x + NODE_WIDTH;

      const dx = Math.abs(endX - startX);
      const midX = startX + (isSourceLeft ? dx / 2 : -dx / 2);

      const isHighlighted = !activeFocus || (edge.sourceTable === activeFocus || edge.targetTable === activeFocus);
      const color = isHighlighted ? 'var(--primary)' : 'var(--border)';
      const opacity = isHighlighted ? 1 : 0.15;
      const strokeWidth = isHighlighted ? 2.5 : 1.5;
      const zIndex = isHighlighted ? 5 : 0;

      return (
        <path
          key={idx}
          d={`M ${startX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${endX} ${targetY}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={opacity}
          markerEnd={isHighlighted ? "url(#arrow-active)" : "url(#arrow-inactive)"}
          style={{ transition: 'opacity 0.3s ease, stroke-width 0.3s ease', zIndex }}
        />
      );
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'var(--bg)', display: 'flex' }}>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

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
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
           {tables.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map(t => {
             const isSelected = selectedTable === t.name;
             return (
               <div key={t.name} style={{ marginBottom: 12 }}>
                  <div 
                     onClick={() => setSelectedTable(isSelected ? null : t.name)}
                     onMouseEnter={() => setHighlightedTable(t.name)}
                     onMouseLeave={() => setHighlightedTable(null)}
                     style={{ 
                       padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                       background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--surface-2)',
                       border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                       display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                       transition: 'all 0.2s'
                     }}
                  >
                     <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Database size={16} color={isSelected ? "var(--primary)" : "var(--muted)"} />
                        <span style={{ fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text)', fontSize: 14 }}>{t.name}</span>
                     </div>
                     <span style={{ fontSize: 12, color: 'var(--muted)', background: 'var(--bg)', padding: '4px 10px', borderRadius: 12, fontWeight: 600 }}>{t.columns.length}</span>
                  </div>
                  
                  {isSelected && (
                     <div style={{ padding: '12px 16px 16px 42px', animation: 'fadeIn 0.2s ease-out' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Columns</div>
                        {t.columns.map(c => (
                           <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px dashed var(--border)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                 {c.isPrimaryKey && <Key size={12} color="#e67e22" title="Primary Key" />}
                                 {c.isForeignKey && <LinkIcon size={12} color="var(--primary)" title={`Foreign Key to ${c.references}`} />}
                                 {!c.isPrimaryKey && !c.isForeignKey && <span style={{ width: 12 }} />}
                                 <span style={{ color: (c.isPrimaryKey || c.isForeignKey) ? 'var(--text)' : 'var(--text-secondary)', fontWeight: (c.isPrimaryKey || c.isForeignKey) ? 500 : 400 }}>{c.name}</span>
                              </div>
                              <span style={{ color: 'var(--muted)', fontSize: 12 }}>{c.type}</span>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
             )
           })}
        </div>
      </div>

      {/* Right Canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'var(--bg)' }} onClick={() => setSelectedTable(null)}>
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={0.3}
          maxScale={2}
          centerOnInit={true}
          limitToBounds={false}
          panning={{ velocityMultiplier: 0.5 }}
          doubleClick={{ disabled: true }}
        >
          {({ zoomIn, zoomOut, centerView }) => (
            <>
              {/* Floating Controls */}
              <div style={{ 
                position: 'absolute', bottom: 32, right: 32, zIndex: 10, 
                display: 'flex', flexDirection: 'column', gap: 6, 
                background: 'var(--surface)', padding: 6, borderRadius: 12, 
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid var(--border)' 
              }}>
                 <button onClick={() => zoomIn(0.2, 300)} title="Zoom In" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text)', borderRadius: 8 }} onMouseOver={e => e.currentTarget.style.background='var(--surface-2)'} onMouseOut={e => e.currentTarget.style.background='transparent'}><ZoomIn size={20} /></button>
                 <button onClick={() => zoomOut(0.2, 300)} title="Zoom Out" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text)', borderRadius: 8 }} onMouseOver={e => e.currentTarget.style.background='var(--surface-2)'} onMouseOut={e => e.currentTarget.style.background='transparent'}><ZoomOut size={20} /></button>
                 <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                 <button onClick={() => centerView(1, 400)} title="Fit to Screen" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text)', borderRadius: 8 }} onMouseOver={e => e.currentTarget.style.background='var(--surface-2)'} onMouseOut={e => e.currentTarget.style.background='transparent'}><Maximize size={20} /></button>
              </div>

              <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                <div style={{ width: layoutBounds.width, height: layoutBounds.height, position: 'relative' }}>
                  
                  {/* SVG Layer for Lines */}
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
                    <defs>
                      <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--primary)" />
                      </marker>
                      <marker id="arrow-inactive" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--border)" opacity="0.6" />
                      </marker>
                    </defs>
                    {renderLines()}
                  </svg>

                  {/* HTML Layer for Nodes */}
                  {Object.values(nodes).map((node, index) => {
                    const t = node.table;
                    const isFaded = activeConnections && !activeConnections.has(t.name);
                    const isFocus = activeFocus === t.name;

                    return (
                      <div
                        id={`node-${t.name}`}
                        key={t.name}
                        onClick={(e) => { e.stopPropagation(); setSelectedTable(t.name); }}
                        onMouseEnter={() => setHighlightedTable(t.name)}
                        onMouseLeave={() => setHighlightedTable(null)}
                        style={{
                          position: 'absolute',
                          left: node.x,
                          top: node.y,
                          width: NODE_WIDTH,
                          background: 'var(--surface)',
                          border: `2px solid ${isFocus ? 'var(--primary)' : 'var(--border)'}`,
                          borderRadius: 14,
                          boxShadow: isFocus ? '0 0 0 4px rgba(59, 130, 246, 0.15), 0 12px 32px rgba(0,0,0,0.1)' : '0 12px 32px rgba(0,0,0,0.08)',
                          opacity: isFaded ? 0.25 : 1,
                          transition: 'opacity 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                          zIndex: isFocus ? 10 : 1,
                          userSelect: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ height: HEADER_HEIGHT, background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', borderTopLeftRadius: 12, borderTopRightRadius: 12, display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{t.name}</span>
                          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, background: 'var(--bg)', padding: '4px 8px', borderRadius: 6 }}>{t.columns.length} COLS</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 0' }}>
                          {t.columns.map((c, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: ROW_HEIGHT, padding: '0 16px', fontSize: 13, background: (c.isPrimaryKey || c.isForeignKey) ? 'var(--surface-2)' : 'transparent' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {c.isPrimaryKey && <Key size={14} color="#e67e22" title="Primary Key" />}
                                {c.isForeignKey && <LinkIcon size={14} color="var(--primary)" title={`Foreign Key to ${c.references}`} />}
                                {!c.isPrimaryKey && !c.isForeignKey && <span style={{ width: 14 }} />}
                                <span style={{ fontWeight: (c.isPrimaryKey || c.isForeignKey) ? 600 : 500, color: (c.isPrimaryKey || c.isForeignKey) ? 'var(--text)' : 'var(--text-secondary)' }}>{c.name}</span>
                              </div>
                              <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 500 }}>{c.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
});
