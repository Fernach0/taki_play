'use client';

import { useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import { QueueItem } from '@/types/queue.types';
import { Song } from '@/types/song.types';

interface UseSocketOptions {
  tableId: string | null;
  onQueueUpdate?: (data: { tableId: string; queue: QueueItem[] }) => void;
  onNowPlaying?: (data: { tableId: string; currentSong: Song }) => void;
}

export function useSocket({ tableId, onQueueUpdate, onNowPlaying }: UseSocketOptions) {
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!tableId) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    if (!joinedRef.current) {
      socket.emit('join-table', { tableId });
      joinedRef.current = true;
    }

    if (onQueueUpdate) {
      socket.on('queue:updated', onQueueUpdate);
    }

    if (onNowPlaying) {
      socket.on('queue:now-playing', onNowPlaying);
    }

    return () => {
      socket.off('queue:updated');
      socket.off('queue:now-playing');
      socket.emit('leave-table', { tableId });
      socket.disconnect();
      joinedRef.current = false;
    };
  }, [tableId]);
}
