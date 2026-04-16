'use client';

import { Play, Trash2, Music2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queueService } from '@/services/queue.service';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export function QueueDJPanel() {
  const qc = useQueryClient();

  const { data: queues = [], isLoading } = useQuery({
    queryKey: ['all-queues'],
    queryFn: queueService.getAllQueues,
    refetchInterval: 5000,
  });

  const playMutation = useMutation({
    mutationFn: (id: string) => queueService.updateItem(id, { status: 'PLAYING' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-queues'] });
      toast.success('Reproduciendo canción');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Error'),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => queueService.removeItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-queues'] });
      toast.success('Canción eliminada de la cola');
    },
  });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-6">Cola en Vivo</h2>

      {queues.length === 0 ? (
        <p className="text-center text-gray-500 py-16">No hay mesas activas</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {queues.map((table) => (
            <Card
              key={table.tableId}
              glow={table.currentlyPlaying ? 'pink' : 'none'}
              className="p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">Mesa #{table.tableNumber}</h3>
                <span className="text-xs text-gray-500">{table.pendingCount} en cola</span>
              </div>

              {table.currentlyPlaying && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-neon-pink/10 border border-neon-pink/20">
                  <Music2 className="w-4 h-4 text-neon-pink animate-pulse flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold truncate">
                      {table.currentlyPlaying.song.title}
                    </p>
                    <p className="text-gray-400 text-xs truncate">
                      {table.currentlyPlaying.song.artist}
                    </p>
                  </div>
                  <Badge variant="PLAYING" className="flex-shrink-0" />
                </div>
              )}

              {/* Items de esta mesa — re-fetch individual */}
              <TableQueueItems
                tableId={table.tableId}
                onPlay={playMutation.mutate}
                onRemove={removeMutation.mutate}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TableQueueItems({
  tableId,
  onPlay,
  onRemove,
}: {
  tableId: string;
  onPlay: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const { data } = useQuery({
    queryKey: ['queue', tableId],
    queryFn: () => queueService.getTableQueue(tableId),
    refetchInterval: 3000,
  });

  const pending = data?.items.filter((i) => i.status === 'PENDING') ?? [];

  if (pending.length === 0) {
    return <p className="text-xs text-gray-600 text-center py-2">Cola vacía</p>;
  }

  return (
    <div className="space-y-1.5">
      {pending.map((item, i) => (
        <div key={item.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-dark-base/50 group">
          <span className="text-xs text-gray-600 font-mono w-4 text-center">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs truncate">{item.song.title}</p>
            <p className="text-gray-500 text-xs truncate">{item.song.artist}</p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onPlay(item.id)}
              className="p-1 rounded text-gray-400 hover:text-neon-green hover:bg-green-950/40 transition-colors"
              title="Reproducir"
            >
              <Play className="w-3 h-3" />
            </button>
            <button
              onClick={() => onRemove(item.id)}
              className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
