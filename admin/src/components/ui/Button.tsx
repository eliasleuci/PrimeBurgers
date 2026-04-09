import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, fullWidth, leftIcon, rightIcon, children, disabled, type = 'button', onClick, ...props }, ref) => {
    
    const variantStyles = {
      primary: 'bg-primary text-surface-base hover:bg-primary-hover shadow-lg shadow-primary/10 active:scale-[0.96]',
      secondary: 'bg-surface-elevated text-text-primary hover:bg-slate-800 border border-border-subtle active:scale-[0.96]',
      danger: 'bg-danger text-white hover:bg-red-600 shadow-lg shadow-danger/10 active:scale-[0.96]',
      success: 'bg-success text-white hover:bg-emerald-600 shadow-lg shadow-success/10 active:scale-[0.96]',
      ghost: 'bg-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary active:scale-[0.96]',
    };

    const sizeStyles = {
      md: 'h-12 px-6 text-sm',
      lg: 'h-14 px-8 text-base',
    };

    const baseStyles = cn(
      'inline-flex items-center justify-center rounded-2xl font-black uppercase tracking-widest transition-all duration-150 ease-out disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && 'w-full',
      className
    );

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        onClick={onClick}
        className={baseStyles}
        aria-busy={isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
