import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'primary';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  warning: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  danger: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  neutral: 'bg-slate-700/50 text-slate-100 border-white/10 shadow-sm',
  primary: 'bg-primary/20 text-primary border-primary/20',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[8px]',
  md: 'px-3 py-1 text-[10px]',
};

const Badge: React.FC<BadgeProps> = React.memo(({ children, variant = 'neutral', size = 'md', className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-black uppercase tracking-widest border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
