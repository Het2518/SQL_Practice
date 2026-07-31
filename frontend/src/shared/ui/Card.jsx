import React from 'react';

export function Card({ 
  children, 
  title,
  subtitle,
  actions,
  padding = '20px',
  style = {},
  className = '',
  ...props 
}) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
        ...style
      }}
      className={className}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface)'
        }}>
          <div>
            {title && <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 0 0' }}>{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div style={{ padding }}>
        {children}
      </div>
    </div>
  );
}
