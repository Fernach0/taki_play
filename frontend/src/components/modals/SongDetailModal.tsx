'use client';

import { useRef } from 'react';
import { Music, Clock, Play } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Song } from '@/types/song.types';
import { formatDuration } from '@/lib/utils';

interface SongDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  pendingCount: number;
  onRequest: (song: Song) => void;
  isRequesting?: boolean;
}

export function SongDetailModal({
  isOpen,
  onClose,
  song,
  pendingCount,
  onRequest,
  isRequesting,
}: SongDetailModalProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const queueFull = pendingCount >= 10;

  if (!song) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Detalle de canción">
      <div className="flex gap-4 mb-6">
        {/* Cover */}
        <div className="w-24 h-24 rounded-xl bg-dark-base border border-dark-border flex-shrink-0 overflow-hidden">
          {song.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-8 h-8 text-gray-600" />
            </div>
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white truncate">{song.title}</h3>
          <p className="text-gray-400 text-sm mt-0.5">{song.artist}</p>
          {song.album && <p className="text-gray-500 text-xs mt-0.5">{song.album}</p>}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant={song.language} />
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(song.duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Demo player */}
      <div className="bg-dark-base rounded-xl p-4 mb-6 border border-dark-border">
        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <Play className="w-3 h-3" /> Vista previa (demo)
        </p>
        <audio ref={audioRef} controls className="w-full h-10" src={song.demoUrl}>
          Tu navegador no soporta audio HTML5.
        </audio>
      </div>

      {/* Cola llena warning */}
      {queueFull && (
        <p className="text-center text-sm text-amber-400 mb-4 bg-amber-900/20 rounded-lg p-3 border border-amber-700/30">
          La cola está llena (10/10). Espera a que se reproduzcan algunas canciones.
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onClose} className="flex-1">
          Cerrar
        </Button>
        <Button
          variant="primary"
          onClick={() => onRequest(song)}
          disabled={queueFull}
          loading={isRequesting}
          className="flex-1"
        >
          Pedir esta canción
        </Button>
      </div>
    </ModalWrapper>
  );
}
