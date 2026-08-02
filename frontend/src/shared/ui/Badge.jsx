import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-surface-2 text-text-secondary hover:bg-surface-3',
        primary: 'border-transparent bg-primary-muted text-primary hover:bg-primary-light',
        success: 'border-transparent bg-success-muted text-success hover:bg-success/20',
        warning: 'border-transparent bg-warning-muted text-warning hover:bg-warning/20',
        danger: 'border-transparent bg-error-muted text-error hover:bg-error/20',
        error: 'border-transparent bg-error-muted text-error hover:bg-error/20',
        easy: 'border-transparent bg-success-muted text-success hover:bg-success/20',
        medium: 'border-transparent bg-warning-muted text-warning hover:bg-warning/20',
        hard: 'border-transparent bg-error-muted text-error hover:bg-error/20',
        accent: 'border-transparent bg-accent-1/10 text-accent-1 hover:bg-accent-1/20',
        outline: 'text-text',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-[9px] uppercase tracking-wider',
        md: 'px-2 py-0.5 text-[10px] uppercase tracking-wider',
        lg: 'px-2.5 py-1 text-[11px] uppercase tracking-wider',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

function Badge({ className, variant, size, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
