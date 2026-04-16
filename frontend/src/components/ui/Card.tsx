import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'purple' | 'cyan' | 'pink' | 'none';
}

export function Card({ glow = 'none', className, children, ...props }: CardProps) {
  const glowStyles = {
    purple: 'hover:border-neon-purple/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    cyan: 'hover:border-neon-cyan/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]',
    pink: 'border-neon-pink/60 shadow-[0_0_20px_rgba(236,72,153,0.2)]',
    none: 'hover:border-dark-border/80',
  };

  return (
    <div
      className={cn(
        'bg-dark-surface border border-dark-border rounded-xl transition-all duration-200',
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
