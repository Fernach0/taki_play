'use client';

import { cn } from '@/lib/utils';
import { Language } from '@/types/song.types';

interface SongFiltersProps {
  selected: Language | 'ALL';
  onChange: (lang: Language | 'ALL') => void;
}

const filters: { value: Language | 'ALL'; label: string; activeClass: string }[] = [
  {
    value: 'ALL',
    label: 'Todos',
    activeClass: 'bg-inca-gold text-dark-base border-inca-gold shadow-[0_0_12px_rgba(212,160,23,0.4)]',
  },
  {
    value: 'SPANISH',
    label: 'Español',
    activeClass: 'bg-chakra-ocre text-warm-white border-chakra-ocre shadow-[0_0_12px_rgba(181,101,29,0.4)]',
  },
  {
    value: 'KICHWA',
    label: 'Kichwa',
    activeClass: 'bg-kichwa-rojo text-warm-white border-kichwa-rojo shadow-[0_0_12px_rgba(192,57,43,0.4)]',
  },
  {
    value: 'ACHUAR',
    label: 'Achuar',
    activeClass: 'bg-selva-verde text-warm-white border-selva-verde shadow-[0_0_12px_rgba(74,124,89,0.4)]',
  },
  {
    value: 'OTHER',
    label: 'Otros',
    activeClass: 'bg-gris-paramo text-warm-white border-gris-paramo shadow-[0_0_8px_rgba(93,109,126,0.3)]',
  },
];

export function SongFilters({ selected, onChange }: SongFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={cn(
            'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
            selected === f.value
              ? f.activeClass
              : 'bg-transparent text-soil-brown border-dark-border hover:border-sand-beige/40 hover:text-sand-beige'
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
