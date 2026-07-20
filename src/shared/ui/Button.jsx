import React from 'react';
import { RotateCcw } from 'lucide-react';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  disabled = false, 
  icon: Icon,
  className = '',
  style = {},
  ...props 
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    border: '1px solid transparent',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled && !isLoading ? 0.6 : 1,
    transition: 'all 0.15s ease',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '11px', borderRadius: '6px', height: '28px' },
    md: { padding: '8px 16px', fontSize: '13px', borderRadius: '8px', height: '36px' },
    lg: { padding: '12px 24px', fontSize: '14px', borderRadius: '10px', height: '44px' },
  };

  const variants = {
    primary: {
      background: 'var(--primary)',
      color: '#fff',
      borderColor: 'transparent',
    },
    secondary: {
      background: 'var(--surface-2)',
      color: 'var(--text)',
      borderColor: 'var(--border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      borderColor: 'transparent',
    },
    danger: {
      background: 'var(--error)',
      color: '#fff',
      borderColor: 'transparent',
    },
    outline: {
      background: 'transparent',
      color: 'var(--primary)',
      borderColor: 'var(--primary)',
    }
  };

  const vStyle = variants[variant] || variants.primary;
  const sStyle = sizes[size] || sizes.md;

  const handleMouseEnter = (e) => {
    if (disabled || isLoading) return;
    if (variant === 'primary') e.currentTarget.style.background = 'var(--primary-hover)';
    if (variant === 'secondary') e.currentTarget.style.background = 'var(--border)';
    if (variant === 'ghost') {
      e.currentTarget.style.background = 'var(--surface-2)';
      e.currentTarget.style.color = 'var(--text)';
    }
    if (variant === 'danger') e.currentTarget.style.background = 'var(--error-muted)';
    if (variant === 'outline') e.currentTarget.style.background = 'var(--primary-muted)';
  };

  const handleMouseLeave = (e) => {
    if (disabled || isLoading) return;
    e.currentTarget.style.background = vStyle.background;
    if (variant === 'ghost') e.currentTarget.style.color = vStyle.color;
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{ ...baseStyle, ...vStyle, ...sStyle, ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      {...props}
    >
      {isLoading ? (
        <RotateCcw size={size === 'sm' ? 12 : 14} style={{ animation: 'spin 1s linear infinite' }} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 16} />
      ) : null}
      {children}
    </button>
  );
}
