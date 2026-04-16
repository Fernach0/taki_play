'use client';

import { cn } from '@/lib/utils';
import { Language } from '@/types/song.types';

interface SongFiltersProps {
  selected: Language | 'ALL';
  onChange: (lang: Language | 'ALL') => void;
}

const filters: { value: Language | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'SPANISH', label: 'Español' },
  { value: 'KICHWA', label: 'Kichwa' },
  { value: 'ACHUAR', label: 'Achuar' },
  { value: 'OTHER', label: 'Otros' },
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
              ? 'bg-neon-purple text-white border-neon-purple shadow-[0_0_12px_rgba(168,85,247,0.5)]'
              : 'bg-transparent text-gray-400 border-dark-border hover:border-gray-500 hover:text-gray-200'
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
