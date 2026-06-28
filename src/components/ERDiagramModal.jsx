import { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { DB_INFO } from '../types';
export function ERDiagramModal({
  dbName,
  onClose
}) {
  const [svgContent, setSvgContent] = useState('');
  const [isRendering, setIsRendering] = useState(true);
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
        layoutDirection: 'LR'
      }
    });
    const dbInfo = DB_INFO[dbName];

    // Build ER Diagram string based on our internal schema definition
    let erDef = '%%{init: {\'er\': {\'layoutDirection\': \'LR\'}}}%%\nerDiagram\n';

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
    dbInfo.tables.forEach(t => {
      t.columns.forEach(c => {
        if (c.isForeignKey && c.references) {
          // Skip self-referencing lines (e.g. categories -> categories) because 
          // Mermaid's layout engine draws them as massive broken loops into empty space.
          // The column still shows "FK" inside the entity box, which is sufficient.
          if (c.references !== t.name) {
            erDef += `  ${c.references} ||--o{ ${t.name} : ""\n`;
          }
        }
      });
    });

    // Render SVG dynamically
    const renderDiagram = async () => {
      try {
        setIsRendering(true);
        const {
          svg
        } = await mermaid.render('mermaid-er-diagram', erDef);
        setSvgContent(svg);
      } catch (err) {
        console.error('Mermaid rendering failed:', err);
        setSvgContent('<div style="color: #f87171; padding: 20px;">Failed to render diagram</div>');
      } finally {
        setIsRendering(false);
      }
    };
    renderDiagram();
  }, [dbName]);
  return <div className="modal-overlay animate-fade-in" onClick={onClose} style={{
    padding: 40,
    zIndex: 9999,
    background: 'rgba(0,0,0,0.85)'
  }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
      width: '100%',
      maxWidth: '95vw',
      height: '95vh',
      background: 'var(--surface)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 30px 100px rgba(0,0,0,0.8)'
    }}>
        <div style={{
        padding: '16px 24px',
        background: 'var(--surface-2)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
            <span style={{
            fontSize: 24
          }}>{DB_INFO[dbName].icon}</span>
            <h2 style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700
          }}>{DB_INFO[dbName].label} Schema</h2>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{
          fontSize: 14
        }}>✕ Close</button>
        </div>
        
        <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 40,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column'
      }}>
          {isRendering ? <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
              <div className="spinner" />
            </div> : <div style={{
          margin: 'auto',
          display: 'grid',
          placeItems: 'center',
          minWidth: '100%',
          minHeight: '100%'
        }}>
              <style>{`
                /* Ensure SVG renders large enough to be readable and allows scrolling if necessary */
                #mermaid-container svg {
                  min-width: 1000px;
                  max-width: 100%;
                  height: auto;
                  font-size: 16px;
                }
              `}</style>
              <div id="mermaid-container" dangerouslySetInnerHTML={{
            __html: svgContent
          }} />
            </div>}
        </div>
      </div>
    </div>;
}