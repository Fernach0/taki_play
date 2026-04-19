'use client';

import { Music } from 'lucide-react';
import { Song } from '@/types/song.types';
import { Badge } from '@/components/ui/Badge';
import { formatDuration } from '@/lib/utils';

interface SongCardProps {
  song: Song;
  onClick: (song: Song) => void;
}

export function SongCard({ song, onClick }: SongCardProps) {
  return (
    <button
      onClick={() => onClick(song)}
      className="group flex flex-col bg-dark-surface border border-dark-border rounded-xl overflow-hidden hover:border-inca-gold/60 hover:shadow-[0_0_20px_rgba(212,160,23,0.12)] transition-all duration-200 text-left w-full"
    >
      {/* Cover */}
      <div className="relative aspect-square w-full bg-dark-base overflow-hidden">
        {song.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-dark-base">
            {/* Placeholder geométrico andino */}
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-inca-gold/30 rotate-45 absolute" />
              <Music className="w-8 h-8 text-inca-gold/40 relative z-10" />
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={song.language} />
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-warm-white text-sm font-semibold truncate font-serif">{song.title}</p>
        <p className="text-sand-beige text-xs truncate mt-0.5">{song.artist}</p>
        <p className="text-soil-brown text-xs mt-1">{formatDuration(song.duration)}</p>
      </div>
    </button>
  );
}
