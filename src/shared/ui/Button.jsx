import React from 'react';
import { RotateCcw } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 border border-transparent font-sans font-semibold transition-all duration-150 select-none whitespace-nowrap no-underline',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white border-transparent hover:bg-primary-hover active:scale-95 shadow-[0_2px_4px_rgba(37,99,235,0.2)]',
        secondary:
          'bg-surface-2 text-text border-border hover:bg-surface-3 hover:border-border-hover active:scale-95',
        ghost:
          'bg-transparent text-text-secondary border-transparent hover:bg-surface-2 hover:text-text active:scale-95',
        danger:
          'bg-error text-white border-transparent hover:bg-error/90 active:scale-95 shadow-[0_2px_4px_rgba(220,38,38,0.2)]',
        outline: 'bg-transparent text-text border-border hover:bg-surface-2 active:scale-95',
        nav: 'bg-transparent text-text-secondary border-transparent hover:bg-surface-2 hover:text-text !font-medium',
      },
      size: {
        sm: 'px-3 py-1.5 text-[11px] rounded-md h-7',
        md: 'px-4 py-2 text-[13px] rounded-lg h-9',
        lg: 'px-6 py-3 text-[14px] rounded-xl h-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export function Button({
  children,
  variant,
  size,
  isLoading = false,
  disabled = false,
  icon: Icon,
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size }),
        (disabled || isLoading) && 'cursor-not-allowed opacity-60 pointer-events-none',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <RotateCcw className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      ) : null}
      {children}
    </button>
  );
}
