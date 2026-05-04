'use client';

import { useState } from 'react';
import { Music2, ChevronUp, ChevronDown } from 'lucide-react';
import { QueueItem } from '@/types/queue.types';
import { Badge } from '@/components/ui/Badge';
import { useT } from '@/hooks/useT';

interface QueuePanelProps {
  items: QueueItem[];
  pendingCount: number;
}

export function QueuePanel({ items, pendingCount }: QueuePanelProps) {
  const [expanded, setExpanded] = useState(false);
  const t = useT();

  if (items.length === 0) return null;

  const playing = items.find((i) => i.status === 'PLAYING');
  const pending = items.filter((i) => i.status === 'PENDING');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:relative md:z-auto">
      <div className="bg-dark-surface/95 backdrop-blur-sm border-t border-inca-gold/20 md:border md:border-dark-border md:rounded-xl md:mx-0">
        {/* Handle móvil */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-3 md:hidden"
        >
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-inca-gold" />
            <span className="text-sm font-semibold text-warm-white">
              {t.queueLabel} ({pendingCount})
            </span>
            {playing && <Badge variant="PLAYING" />}
          </div>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-soil-brown" />
          ) : (
            <ChevronUp className="w-4 h-4 text-soil-brown" />
          )}
        </button>

        <div className={`${expanded ? 'block' : 'hidden'} md:block px-4 pb-4 md:pt-4 max-h-64 overflow-y-auto space-y-2`}>
          {playing && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-inca-gold/10 border border-inca-gold/30">
              <div className="w-8 h-8 rounded bg-dark-base flex items-center justify-center flex-shrink-0">
                <Music2 className="w-4 h-4 text-inca-gold animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-warm-white text-xs font-semibold truncate font-serif">{playing.song.title}</p>
                <p className="text-sand-beige text-xs truncate">{playing.song.artist}</p>
              </div>
              <Badge variant="PLAYING" className="flex-shrink-0" />
            </div>
          )}

          {pending.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-dark-base/50">
              <span className="w-5 h-5 flex-shrink-0 text-xs text-soil-brown font-mono text-center">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-warm-white text-xs truncate">{item.song.title}</p>
                <p className="text-soil-brown text-xs truncate">{item.song.artist}</p>
              </div>
              {item.requestedBy && (
                <span className="text-xs text-soil-brown/70 flex-shrink-0">{t.by} {item.requestedBy}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
