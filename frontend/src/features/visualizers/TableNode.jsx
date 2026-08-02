import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Key, Link as LinkIcon } from 'lucide-react';

export const TableNode = ({ data }) => {
  const { table, isFocus, activeConnections } = data;
  const isFaded = activeConnections && !activeConnections.has(table.name);

  return (
    <div
      className={`w-[300px] bg-surface rounded-xl overflow-hidden font-sans transition-all duration-200 ease-in-out ${
        isFocus 
          ? 'border-2 border-primary shadow-[0_0_0_3px_rgba(139,92,246,0.15),0_12px_32px_rgba(0,0,0,0.1)]' 
          : 'border border-border shadow-[0_8px_24px_rgba(0,0,0,0.04)]'
      } ${isFaded ? 'opacity-20' : 'opacity-100'}`}
    >
      <div className={`h-[46px] bg-surface-2 flex items-center justify-between px-4 border-b ${isFocus ? 'border-primary-light' : 'border-border'}`}>
        <span className={`font-bold text-sm ${isFocus ? 'text-primary' : 'text-text'}`}>
          {table.name}
        </span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isFocus ? 'text-primary bg-primary-muted' : 'text-muted bg-bg'}`}>
          {table.columns.length} COLS
        </span>
      </div>

      <div className="flex flex-col py-1">
        {table.columns.map((c, i) => (
          <div 
            key={c.name} 
            className={`relative flex items-center justify-between h-8 px-4 text-[13px] ${
              (c.isPrimaryKey || c.isForeignKey) ? 'bg-surface-2 opacity-100' : 'bg-transparent opacity-85'
            }`}
          >
            {/* Left handle for incoming connections (Foreign Keys) */}
            <Handle 
              type="target" 
              position={Position.Left} 
              id={`${table.name}-${c.name}-target`} 
              className="opacity-0 -left-[6px]"
            />

            <div className="flex items-center gap-2">
              {c.isPrimaryKey && <Key size={14} color="#f59e0b" title="Primary Key" />}
              {c.isForeignKey && <LinkIcon size={14} color="var(--primary)" title={`Foreign Key to ${c.references}`} />}
              {!c.isPrimaryKey && !c.isForeignKey && <span className="w-[14px]" />}
              <span className={(c.isPrimaryKey || c.isForeignKey) ? 'font-semibold text-text' : 'font-medium text-text-secondary'}>
                {c.name}
              </span>
            </div>
            <span className="text-muted text-[11px] font-mono">
              {c.type}
            </span>

            {/* Right handle for outgoing connections (Primary Keys referenced by others) */}
            <Handle 
              type="source" 
              position={Position.Right} 
              id={`${table.name}-${c.name}-source`} 
              className="opacity-0 -right-[6px]"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
