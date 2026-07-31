import React from 'react';

export function Badge({ 
  children, 
  variant = 'default',
  size = 'md',
  style = {},
  className = '',
  ...props 
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontFamily: 'var(--font-sans)',
    whiteSpace: 'nowrap',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  const sizes = {
    sm: { padding: '2px 6px', fontSize: '9px', borderRadius: '4px' },
    md: { padding: '3px 8px', fontSize: '10px', borderRadius: '5px' },
    lg: { padding: '4px 10px', fontSize: '11px', borderRadius: '6px' },
  };

  // Maps variant names (or difficulty strings) to theme colors
  const getColors = (v) => {
    const norm = v.toLowerCase();
    switch (norm) {
      case 'easy':
      case 'success':
        return { color: 'var(--success)', background: 'var(--success-muted)' };
      case 'medium':
      case 'warning':
        return { color: 'var(--warning)', background: 'var(--warning-muted)' };
      case 'hard':
      case 'error':
      case 'danger':
        return { color: 'var(--error)', background: 'var(--error-muted)' };
      case 'primary':
      case 'info':
        return { color: 'var(--primary)', background: 'var(--primary-muted)' };
      case 'accent':
      case 'maang':
        return { color: 'var(--accent-1)', background: 'rgba(139,92,246,0.1)' };
      default:
        return { color: 'var(--text-secondary)', background: 'var(--surface-2)', border: '1px solid var(--border)' };
    }
  };

  const vStyle = getColors(variant);
  const sStyle = sizes[size] || sizes.md;

  return (
    <span
      style={{ ...baseStyle, ...vStyle, ...sStyle, ...style }}
      className={className}
      {...props}
    >
      {children}
    </span>
  );
}
