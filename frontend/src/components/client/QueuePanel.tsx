'use client';

import { useState } from 'react';
import { Music2, ChevronUp, ChevronDown } from 'lucide-react';
import { QueueItem } from '@/types/queue.types';
import { Badge } from '@/components/ui/Badge';

interface QueuePanelProps {
  items: QueueItem[];
  pendingCount: number;
}

export function QueuePanel({ items, pendingCount }: QueuePanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const playing = items.find((i) => i.status === 'PLAYING');
  const pending = items.filter((i) => i.status === 'PENDING');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:relative md:z-auto">
      <div className="bg-dark-surface/95 backdrop-blur-sm border-t border-dark-border md:border md:rounded-xl md:mx-0">
        {/* Handle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-3 md:hidden"
        >
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-neon-purple" />
            <span className="text-sm font-semibold text-white">
              En cola ({pendingCount})
            </span>
            {playing && (
              <Badge variant="PLAYING" />
            )}
          </div>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Lista expandible en móvil, siempre visible en desktop */}
        <div className={`${expanded ? 'block' : 'hidden'} md:block px-4 pb-4 md:pt-4 max-h-64 overflow-y-auto space-y-2`}>
          {playing && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-neon-pink/10 border border-neon-pink/30">
              <div className="w-8 h-8 rounded bg-dark-base flex items-center justify-center flex-shrink-0">
                <Music2 className="w-4 h-4 text-neon-pink animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{playing.song.title}</p>
                <p className="text-gray-400 text-xs truncate">{playing.song.artist}</p>
              </div>
              <Badge variant="PLAYING" className="flex-shrink-0" />
            </div>
          )}

          {pending.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-dark-base/50">
              <span className="w-5 h-5 flex-shrink-0 text-xs text-gray-500 font-mono text-center">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs truncate">{item.song.title}</p>
                <p className="text-gray-500 text-xs truncate">{item.song.artist}</p>
              </div>
              {item.requestedBy && (
                <span className="text-xs text-gray-600 flex-shrink-0">por {item.requestedBy}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
