import { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import { DB_INFO } from '@/types';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export function ERDiagramModal({ dbName, onClose }) {
  const [svgContent, setSvgContent] = useState('');
  const [isRendering, setIsRendering] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    // Grab computed hex colors from the active theme to pass valid colors to Mermaid
    const root = document.querySelector('.practice-root') || document.documentElement;
    const style = getComputedStyle(root);
    const getVar = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
    const surface = getVar('--surface', '#FFFFFF');
    const surface2 = getVar('--surface-2', '#F5F2F0');
    const border = getVar('--border', '#D6C0B3');
    const text = getVar('--text', '#493628');
    const textSec = getVar('--text-secondary', '#AB886D');
    const primary = getVar('--primary', '#AB886D');
    const bg = getVar('--bg', '#E4E0E1');

    // Initialize mermaid theme perfectly aligned with the app's aesthetic
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        fontFamily: getVar('--font-sans', 'Inter, sans-serif'),
        lineColor: primary,
        primaryColor: surface,
        primaryTextColor: text,
        primaryBorderColor: border,
        titleColor: text,
        tertiaryColor: surface2,
        tertiaryTextColor: textSec,
        tertiaryBorderColor: border,
        secondaryColor: surface2,
        secondaryTextColor: text,
        secondaryBorderColor: border,
        background: bg
      },
      er: {
        layoutDirection: 'LR',
        minEntityWidth: 130,
        minEntityHeight: 75,
        entityPadding: 15
      }
    });
    const dbInfo = DB_INFO[dbName];

    // Build ER Diagram string based on our internal schema definition
    let erDef = "%%{init: {'er': {'layoutDirection': 'LR'}}}%%\nerDiagram\n";

    // 1. Define entities and their attributes
    dbInfo.tables.forEach(t => {
      erDef += `  ${t.name} {\n`;
      t.columns.forEach(c => {
        const keyType = c.isPrimaryKey ? 'PK' : c.isForeignKey ? 'FK' : '';
        // Mermaid parser requires simple alphanumeric strings for types, so we strip parentheses and spaces
        const typeStr = c.type.replace(/[^A-Za-z0-9_]/g, '');
        erDef += `    ${typeStr} ${c.name} ${keyType}\n`;
      });
      erDef += `  }\n`;
    });

    // 2. Define relationships
    // SQLite doesn't strictly enforce relationship directions in PRAGMA, but based on typical ER logic:
    // A table with a foreign key belongs to the referenced table (Many-to-One).
    dbInfo.tables.forEach(t => {
      t.columns.forEach(c => {
        if (c.isForeignKey && c.references) {
          // Format: Entity1 ||--o{ Entity2 : "Relationship"
          // In Mermaid: "One Entity1 has many Entity2"
          erDef += `  ${c.references} ||--o{ ${t.name} : "has"\n`;
        }
      });
    });

    // Handle single table databases gracefully
    if (dbInfo.tables.length === 1 && !erDef.includes('||--')) {
      erDef += `\n  %% Single table database\n`;
    }

    setSvgContent('');
    setIsRendering(true);

    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render('er-diagram-svg', erDef);
        setSvgContent(svg);
      } catch (err) {
        console.error('Failed to render ER diagram:', err);
        setSvgContent(`<div style="padding: 20px; color: var(--error);">Failed to generate ER diagram. Please try again.</div>`);
      } finally {
        setIsRendering(false);
      }
    };

    renderDiagram();
  }, [dbName]);

  const handleDownload = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dbName}-schema.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const dbInfo = DB_INFO[dbName];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 99999 }}>
      <div className="modal-content" style={{ width: '90vw', height: '90vh', maxWidth: '1400px', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        <div style={{ padding: '16px 24px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{dbInfo.icon}</span>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{dbInfo.label} Schema</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
             <button className="btn btn-secondary" onClick={handleDownload} disabled={!svgContent} style={{ fontSize: 14 }}>
               💾 Download SVG
             </button>
             <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 14 }}>
               ✕ Close
             </button>
          </div>
        </div>
        
        <div style={{ flex: 1, overflow: 'hidden', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
          {isRendering ? (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="spinner" />
            </div>
          ) : (
            <TransformWrapper
               initialScale={1}
               minScale={0.1}
               maxScale={4}
               centerOnInit={true}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div style={{ position: 'absolute', bottom: '30px', right: '30px', zIndex: 10, display: 'flex', gap: '8px', background: 'var(--surface)', padding: '8px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid var(--border)' }}>
                     <button className="btn btn-ghost btn-icon" onClick={() => zoomIn()}>➕</button>
                     <button className="btn btn-ghost btn-icon" onClick={() => zoomOut()}>➖</button>
                     <button className="btn btn-ghost btn-icon" onClick={() => resetTransform()}>🔄 Reset</button>
                  </div>
                  <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                     <div 
                       ref={containerRef}
                       id="mermaid-container" 
                       style={{ minWidth: '100%', minHeight: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}
                       dangerouslySetInnerHTML={{ __html: svgContent }} 
                     />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          )}
        </div>
      </div>
    </div>
  );
}