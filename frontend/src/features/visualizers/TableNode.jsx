import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Key, Link as LinkIcon } from 'lucide-react';

export const TableNode = ({ data }) => {
  const { table, isFocus, activeConnections } = data;
  const isFaded = activeConnections && !activeConnections.has(table.name);

  return (
    <div
      style={{
        width: 300,
        background: 'var(--surface)',
        border: `1px solid ${isFocus ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 12,
        boxShadow: isFocus 
          ? '0 0 0 3px rgba(139, 92, 246, 0.15), 0 12px 32px rgba(0,0,0,0.1)' 
          : '0 8px 24px rgba(0,0,0,0.04)',
        opacity: isFaded ? 0.2 : 1,
        transition: 'opacity 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div 
        style={{ 
          height: 46, 
          background: 'var(--surface-2)', 
          borderBottom: `1px solid ${isFocus ? 'var(--primary-light)' : 'var(--border)'}`, 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 16px', 
          justifyContent: 'space-between' 
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, color: isFocus ? 'var(--primary)' : 'var(--text)' }}>
          {table.name}
        </span>
        <span style={{ 
          fontSize: 10, 
          color: isFocus ? 'var(--primary)' : 'var(--muted)', 
          fontWeight: 700, 
          background: isFocus ? 'var(--primary-muted)' : 'var(--bg)', 
          padding: '2px 6px', 
          borderRadius: 4 
        }}>
          {table.columns.length} COLS
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 0' }}>
        {table.columns.map((c, i) => (
          <div 
            key={c.name} 
            style={{ 
              position: 'relative',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              height: 32, 
              padding: '0 16px', 
              fontSize: 13, 
              background: (c.isPrimaryKey || c.isForeignKey) ? 'var(--surface-2)' : 'transparent',
              opacity: (c.isPrimaryKey || c.isForeignKey) ? 1 : 0.85
            }}
          >
            {/* Left handle for incoming connections (Foreign Keys) */}
            <Handle 
              type="target" 
              position={Position.Left} 
              id={`${table.name}-${c.name}-target`} 
              style={{ opacity: 0, left: -6 }} 
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {c.isPrimaryKey && <Key size={14} color="#f59e0b" title="Primary Key" />}
              {c.isForeignKey && <LinkIcon size={14} color="var(--primary)" title={`Foreign Key to ${c.references}`} />}
              {!c.isPrimaryKey && !c.isForeignKey && <span style={{ width: 14 }} />}
              <span style={{ 
                fontWeight: (c.isPrimaryKey || c.isForeignKey) ? 600 : 500, 
                color: (c.isPrimaryKey || c.isForeignKey) ? 'var(--text)' : 'var(--text-secondary)' 
              }}>
                {c.name}
              </span>
            </div>
            <span style={{ color: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              {c.type}
            </span>

            {/* Right handle for outgoing connections (Primary Keys referenced by others) */}
            <Handle 
              type="source" 
              position={Position.Right} 
              id={`${table.name}-${c.name}-source`} 
              style={{ opacity: 0, right: -6 }} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};
