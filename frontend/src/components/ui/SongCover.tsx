'use client';

import { useState } from 'react';
import { Music } from 'lucide-react';

interface SongCoverProps {
  songId: string;
  title: string;
  className?: string;
  iconClassName?: string;
}

export function SongCover({ songId, title, className = 'w-full h-full', iconClassName = 'w-8 h-8' }: SongCoverProps) {
  const [failed, setFailed] = useState(false);
  const src = `${process.env.NEXT_PUBLIC_API_URL}/songs/${songId}/cover`;

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-dark-base ${className}`}>
        <Music className={`text-inca-gold/40 ${iconClassName}`} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
