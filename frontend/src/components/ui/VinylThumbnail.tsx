'use client';

import { SongCover } from './SongCover';

interface VinylThumbnailProps {
  songId: string;
  title: string;
  size?: number;
}

export function VinylThumbnail({ songId, title, size = 40 }: VinylThumbnailProps) {
  return (
    <div
      className="relative rounded-full overflow-hidden flex-shrink-0 bg-dark-base"
      style={{
        width: size,
        height: size,
        border: '2px solid #2e1f0e',
        boxShadow: 'inset 0 0 0 3px rgba(0,0,0,0.25), inset 0 0 6px rgba(0,0,0,0.5)',
      }}
    >
      <SongCover
        key={songId}
        songId={songId}
        title={title}
        className="w-full h-full rounded-full"
        iconClassName="w-4 h-4"
      />
      {/* Agujero central del vinilo */}
      <div
        className="absolute rounded-full bg-dark-base"
        style={{
          width: size * 0.14,
          height: size * 0.14,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
        }}
      />
    </div>
  );
}
