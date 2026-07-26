'use client';

import { useState } from 'react';
import { Mic2, ChevronUp, ChevronDown } from 'lucide-react';
import { Song } from '@/types/song.types';
import { QueueStatus } from '@/types/queue.types';
import { Badge } from '@/components/ui/Badge';
import { useT } from '@/hooks/useT';

export interface LyricsQueueEntry {
  queueItemId: string;
  song: Song;
  status: QueueStatus;
  position: number;
}

interface LyricsPanelProps {
  entries: LyricsQueueEntry[];
}

function LyricsEmptyState() {
  const t = useT();
  return (
    <div className="rounded-2xl bg-dark-surface border border-dark-border p-5 text-center">
      <Mic2 className="w-8 h-8 text-soil-brown mx-auto mb-3" />
      <p className="text-xs text-soil-brown leading-relaxed">{t.lyricsPanelEmpty}</p>
    </div>
  );
}

function LyricsEntryCard({ entry }: { entry: LyricsQueueEntry }) {
  const t = useT();
  return (
    <div className="rounded-2xl bg-dark-surface border border-dark-border overflow-hidden flex-shrink-0">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-2 border-b border-dark-border">
        <div className="min-w-0">
          <p className="text-warm-white font-serif font-bold text-sm truncate">{entry.song.title}</p>
          <p className="text-sand-beige text-xs truncate">{entry.song.artist}</p>
        </div>
        <Badge variant={entry.status} className="flex-shrink-0" />
      </div>
      <div className="p-4">
        {entry.song.lyrics ? (
          <pre className="text-sm text-warm-white font-serif whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-dark-border">
            {entry.song.lyrics}
          </pre>
        ) : (
          <p className="text-xs text-soil-brown italic">{t.lyricsPanelNoLyrics}</p>
        )}
      </div>
    </div>
  );
}

export function LyricsPanel({ entries }: LyricsPanelProps) {
  return (
    <aside className="hidden xl:flex flex-col gap-4 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
      {entries.length === 0 ? (
        <LyricsEmptyState />
      ) : (
        entries.map((entry) => <LyricsEntryCard key={entry.queueItemId} entry={entry} />)
      )}
    </aside>
  );
}

export function LyricsAccordion({ entries }: LyricsPanelProps) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);

  if (entries.length === 0) return null;

  return (
    <div className="xl:hidden rounded-2xl bg-dark-surface border border-dark-border overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Mic2 className="w-4 h-4 text-inca-gold" />
          <span className="text-sm font-semibold text-warm-white">
            {t.lyrics} ({entries.length})
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-soil-brown" />
        ) : (
          <ChevronDown className="w-4 h-4 text-soil-brown" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 max-h-96 overflow-y-auto">
          {entries.map((entry) => (
            <LyricsEntryCard key={entry.queueItemId} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
