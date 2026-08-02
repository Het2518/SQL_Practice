import * as React from 'react';
import { RotateCcw } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-bg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm',
        secondary: 'bg-surface-2 text-text border border-border hover:bg-surface-3 hover:border-border-hover shadow-sm',
        ghost: 'bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text',
        danger: 'bg-error text-white hover:bg-error/90 shadow-sm',
        outline: 'border border-border bg-transparent text-text hover:bg-surface-2 hover:text-text',
        nav: 'bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text font-medium',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        md: 'h-9 px-4 py-2 rounded-lg',
        lg: 'h-11 px-8 rounded-xl',
        icon: 'h-9 w-9 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

const Button = React.forwardRef(({
  className,
  variant,
  size,
  isLoading = false,
  icon: Icon,
  children,
  disabled,
  ...props
}, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
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
});

Button.displayName = 'Button';

export { Button, buttonVariants };
