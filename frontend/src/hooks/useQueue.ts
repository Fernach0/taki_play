'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queueService } from '@/services/queue.service';
import { useSocket } from './useSocket';
import { QueueItem, TableQueue } from '@/types/queue.types';

export function useQueue(tableId: string | null) {
  const [realtimeQueue, setRealtimeQueue] = useState<QueueItem[] | null>(null);

  const { data: initialQueue, isLoading } = useQuery<TableQueue>({
    queryKey: ['queue', tableId],
    queryFn: () => queueService.getTableQueue(tableId!),
    enabled: !!tableId,
    staleTime: 0,
  });

  const handleQueueUpdate = useCallback(
    (data: { tableId: string; queue: QueueItem[] }) => {
      if (data.tableId === tableId) {
        setRealtimeQueue(data.queue);
      }
    },
    [tableId]
  );

  useSocket({ tableId, onQueueUpdate: handleQueueUpdate });

  const items = realtimeQueue ?? initialQueue?.items ?? [];
  const currentlyPlaying = items.find((i) => i.status === 'PLAYING') ?? null;
  const pendingItems = items.filter((i) => i.status === 'PENDING');

  return {
    items,
    currentlyPlaying,
    pendingItems,
    pendingCount: pendingItems.length,
    isLoading,
    tableNumber: initialQueue?.tableNumber,
  };
}
