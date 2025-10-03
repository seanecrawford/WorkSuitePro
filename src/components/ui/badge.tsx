import * as React from 'react';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'destructive';
  className?: string;
};

export function Badge({ variant = 'secondary', className = '', children, ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-slate-800 text-slate-100 border-slate-700',
    secondary: 'bg-slate-900 text-slate-200 border-slate-700',
    outline: 'bg-transparent text-slate-200 border-slate-600',
    success: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/40',
    destructive: 'bg-rose-600/20 text-rose-300 border-rose-600/40',
  };

  return (
    <span
      className={
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs ' +
        (variants[variant] ?? variants.secondary) + ' ' + className
      }
      {...props}
    >
      {children}
    </span>
  );
}

// default export too, in case some files use import Badge from ...
export default Badge;
