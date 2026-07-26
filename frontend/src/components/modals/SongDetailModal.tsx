'use client';

import { useRef } from 'react';
import { Clock, Play, FileText } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Song } from '@/types/song.types';
import { SongCover } from '@/components/ui/SongCover';
import { formatDuration } from '@/lib/utils';
import { useT } from '@/hooks/useT';

interface SongDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  pendingCount: number;
  onRequest: (song: Song) => void;
  isRequesting?: boolean;
  isSessionReady?: boolean;
}

export function SongDetailModal({
  isOpen,
  onClose,
  song,
  pendingCount,
  onRequest,
  isRequesting,
  isSessionReady = false,
}: SongDetailModalProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const t = useT();
  const queueFull = pendingCount >= 10;

  if (!song) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={song.title}
      footer={
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            {t.close}
          </Button>
          <Button
            variant="primary"
            onClick={() => onRequest(song)}
            disabled={queueFull || !isSessionReady}
            loading={isRequesting}
            className="flex-1"
          >
            {t.requestSong}
          </Button>
        </div>
      }
    >
      <div className="flex gap-4 mb-6">
        {/* Cover */}
        <div className="w-24 h-24 rounded-xl bg-dark-base border border-dark-border flex-shrink-0 overflow-hidden">
          <SongCover songId={song.id} title={song.title} />
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
          <Play className="w-3 h-3" /> {t.preview}
        </p>
        <audio ref={audioRef} controls className="w-full h-10" src={`${process.env.NEXT_PUBLIC_API_URL}/songs/${song.id}/full`}>
          Tu navegador no soporta audio HTML5.
        </audio>
      </div>

      {/* Letra */}
      {song.lyrics && (
        <div className="bg-dark-base rounded-xl p-4 mb-6 border border-dark-border">
          <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
            <FileText className="w-3 h-3" /> {t.lyrics}
          </p>
          <pre className="text-sm text-warm-white font-serif whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-dark-border">
            {song.lyrics}
          </pre>
        </div>
      )}

      {/* Sesión no lista */}
      {!isSessionReady && (
        <p className="text-center text-sm text-amber-400 mb-4 bg-amber-900/20 rounded-lg p-3 border border-amber-700/30">
          {t.connecting}
        </p>
      )}

      {/* Cola llena */}
      {queueFull && isSessionReady && (
        <p className="text-center text-sm text-amber-400 mb-4 bg-amber-900/20 rounded-lg p-3 border border-amber-700/30">
          {t.queueFull}
        </p>
      )}
    </ModalWrapper>
  );
}
