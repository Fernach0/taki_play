'use client';

import { useEffect, useState, useCallback } from 'react';
import { Shuffle, Dices } from 'lucide-react';
import { Song } from '@/types/song.types';
import { SongCover } from '@/components/ui/SongCover';
import { Badge } from '@/components/ui/Badge';
import { formatDuration } from '@/lib/utils';

interface RandomSongPanelProps {
  songs: Song[];
  onSelect: (song: Song) => void;
}

function pickRandom(songs: Song[], exclude?: string): Song {
  const pool = songs.filter((s) => s.id !== exclude);
  const list = pool.length > 0 ? pool : songs;
  return list[Math.floor(Math.random() * list.length)];
}

export function RandomSongPanel({ songs, onSelect }: RandomSongPanelProps) {
  const [current, setCurrent] = useState<Song | null>(null);

  useEffect(() => {
    if (songs.length > 0 && !current) {
      setCurrent(pickRandom(songs));
    }
  }, [songs]); // eslint-disable-line react-hooks/exhaustive-deps

  const shuffle = useCallback(() => {
    if (songs.length === 0) return;
    setCurrent((prev) => pickRandom(songs, prev?.id));
  }, [songs]);

  return (
    <aside className="hidden lg:flex flex-col gap-4">
      {/* Random song card */}
      <div className="rounded-2xl bg-dark-surface border border-dark-border overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-dark-border">
          <div className="flex items-center gap-2">
            <Dices className="w-4 h-4 text-inca-gold" />
            <span className="text-sm font-semibold text-warm-white">Sorpréndeme</span>
          </div>
          <button
            onClick={shuffle}
            title="Otra canción"
            className="p-1.5 rounded-lg hover:bg-dark-border transition-colors group"
          >
            <Shuffle className="w-4 h-4 text-soil-brown group-hover:text-inca-gold transition-colors" />
          </button>
        </div>

        {current ? (
          <>
          <button onClick={() => onSelect(current)} className="w-full text-left group block">
            {/* Cover */}
            <div className="relative mx-4 mt-4 mb-3 rounded-xl overflow-hidden aspect-square bg-dark-base">
              <SongCover
                songId={current.id}
                title={current.title}
                className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                iconClassName="w-12 h-12"
              />
              {/* Gradient overlay with info */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-base/90 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-warm-white font-serif font-bold text-base leading-tight line-clamp-2">
                  {current.title}
                </p>
                <p className="text-sand-beige text-xs mt-0.5 truncate">{current.artist}</p>
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant={current.language} />
              </div>

              {/* Play button hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
                  style={{ background: 'rgba(212,160,23,0.9)' }}>
                  <svg viewBox="0 0 24 24" className="w-7 h-7 ml-1" fill="#0d0a07">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="px-4 pb-3 flex items-center justify-between">
              <span className="text-xs text-soil-brown">{formatDuration(current.duration)}</span>
              <span className="text-xs font-semibold text-inca-gold group-hover:underline">
                Pedir esta →
              </span>
            </div>
          </button>

          {/* Botón cambiar canción */}
          <div className="px-4 pb-4">
            <button
              onClick={shuffle}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dark-border bg-dark-base hover:border-inca-gold/50 hover:bg-dark-surface transition-all text-sm text-soil-brown hover:text-inca-gold"
            >
              <Shuffle className="w-3.5 h-3.5" />
              No me convence, otra
            </button>
          </div>
          </>
        ) : (
          <div className="mx-4 my-4 aspect-square rounded-xl bg-dark-base flex items-center justify-center">
            <p className="text-soil-brown text-sm">Cargando canciones...</p>
          </div>
        )}
      </div>

      {/* Tip card */}
      <div className="rounded-2xl bg-dark-surface border border-dark-border p-4">
        <p className="text-xs text-soil-brown leading-relaxed">
          💡 Toca cualquier canción para escucharla y pedirla al DJ.
        </p>
      </div>
    </aside>
  );
}
