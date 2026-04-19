import { cn } from '@/lib/utils';
import { Language } from '@/types/song.types';
import { QueueStatus } from '@/types/queue.types';

type BadgeVariant = Language | QueueStatus | 'default';

const variantStyles: Record<BadgeVariant, string> = {
  // Idiomas — identidad cultural
  SPANISH:   'bg-chakra-ocre/20 text-[#e8a855] border border-chakra-ocre/50',
  KICHWA:    'bg-kichwa-rojo/20 text-[#e87070] border border-kichwa-rojo/50',
  ACHUAR:    'bg-selva-verde/20 text-[#7abf96] border border-selva-verde/50',
  OTHER:     'bg-gris-paramo/20 text-sand-beige border border-gris-paramo/40',
  // Estados de la cola
  PLAYING:   'bg-inca-gold/20 text-inca-gold border border-inca-gold/50 animate-pulse',
  PENDING:   'bg-dark-border/60 text-soil-brown border border-dark-border',
  PLAYED:    'bg-dark-base/60 text-soil-brown/60 border border-dark-border/50',
  CANCELLED: 'bg-kichwa-rojo/10 text-kichwa-rojo border border-kichwa-rojo/30',
  default:   'bg-dark-border/60 text-soil-brown border border-dark-border',
};

const labels: Record<BadgeVariant, string> = {
  SPANISH:   'Español',
  KICHWA:    'Kichwa',
  ACHUAR:    'Achuar',
  OTHER:     'Otro',
  PLAYING:   '▶ Reproduciendo',
  PENDING:   'En cola',
  PLAYED:    'Reproducida',
  CANCELLED: 'Cancelada',
  default:   '',
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
