'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-base disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-inca-gold text-dark-base hover:bg-[#e8b420] focus:ring-inca-gold shadow-[0_0_15px_rgba(212,160,23,0.4)] hover:shadow-[0_0_25px_rgba(212,160,23,0.6)]',
      secondary:
        'border border-selva-verde text-selva-verde bg-transparent hover:bg-selva-verde/10 focus:ring-selva-verde',
      danger:
        'bg-kichwa-rojo text-warm-white hover:bg-rojo-sangay focus:ring-kichwa-rojo',
      ghost:
        'text-soil-brown hover:text-warm-white hover:bg-white/10 focus:ring-gris-paramo',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
