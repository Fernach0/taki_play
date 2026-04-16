import { cn } from '@/lib/utils';
import { Language } from '@/types/song.types';
import { QueueStatus } from '@/types/queue.types';

type BadgeVariant = Language | QueueStatus | 'default';

const variantStyles: Record<BadgeVariant, string> = {
  SPANISH: 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50',
  KICHWA: 'bg-purple-900/50 text-purple-300 border border-purple-700/50',
  ACHUAR: 'bg-green-900/50 text-green-300 border border-green-700/50',
  OTHER: 'bg-gray-800/50 text-gray-300 border border-gray-600/50',
  PLAYING: 'bg-pink-900/50 text-pink-300 border border-pink-700/50 animate-pulse',
  PENDING: 'bg-gray-800/50 text-gray-400 border border-gray-700/50',
  PLAYED: 'bg-gray-900/50 text-gray-600 border border-gray-800/50',
  CANCELLED: 'bg-red-900/50 text-red-400 border border-red-800/50',
  default: 'bg-gray-800/50 text-gray-400 border border-gray-700/50',
};

const labels: Record<BadgeVariant, string> = {
  SPANISH: 'Español',
  KICHWA: 'Kichwa',
  ACHUAR: 'Achuar',
  OTHER: 'Otro',
  PLAYING: '▶ Reproduciendo',
  PENDING: 'En cola',
  PLAYED: 'Reproducida',
  CANCELLED: 'Cancelada',
  default: '',
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

export function Badge({ variant, label, className }: BadgeProps) {
  const style = variantStyles[variant] ?? variantStyles.default;
  const text = label ?? labels[variant] ?? variant;

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', style, className)}>
      {text}
    </span>
  );
}
