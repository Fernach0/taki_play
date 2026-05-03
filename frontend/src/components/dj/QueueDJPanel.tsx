'use client';

import { Play, Trash2, Music2, Clock, Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queueService } from '@/services/queue.service';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { GlobalQueueItem } from '@/types/queue.types';

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `hace ${diff}s`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}min`;
  return `hace ${Math.floor(diff / 3600)}h`;
}

export function QueueDJPanel() {
  const qc = useQueryClient();

  const { data: globalQueue = [], isLoading: loadingGlobal } = useQuery({
    queryKey: ['global-queue'],
    queryFn: queueService.getGlobalQueue,
    refetchInterval: 4000,
  });

  const { data: allQueues = [], isLoading: loadingPlaying } = useQuery({
    queryKey: ['all-queues'],
    queryFn: queueService.getAllQueues,
    refetchInterval: 4000,
  });

  const playMutation = useMutation({
    mutationFn: (id: string) => queueService.updateItem(id, { status: 'PLAYING' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['global-queue'] });
      qc.invalidateQueries({ queryKey: ['all-queues'] });
      toast.success('Reproduciendo canción');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Error'),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => queueService.removeItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['global-queue'] });
      qc.invalidateQueries({ queryKey: ['all-queues'] });
      toast.success('Canción eliminada de la cola');
    },
  });

  const nowPlaying = allQueues.filter((t) => t.currentlyPlaying !== null);
  const isLoading = loadingGlobal || loadingPlaying;

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="space-y-8">

      {/* ── En reproducción ── */}
      {nowPlaying.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-inca-gold uppercase tracking-widest mb-3 flex items-center gap-2">
            <Music2 className="w-4 h-4 animate-pulse" />
            En reproducción
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {nowPlaying.map((table) => (
              <div
                key={table.tableId}
                className="flex items-center gap-3 p-3 rounded-xl bg-kichwa-rojo/10 border border-kichwa-rojo/30"
              >
                <Music2 className="w-5 h-5 text-kichwa-rojo animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {table.currentlyPlaying!.song.title}
                  </p>
                  <p className="text-sand-beige text-xs truncate">
                    {table.currentlyPlaying!.song.artist}
                  </p>
                </div>
                <span className="text-xs font-bold text-kichwa-rojo bg-kichwa-rojo/20 px-2 py-1 rounded-lg flex-shrink-0">
                  Mesa {table.tableNumber}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Cola global ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-inca-gold uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4" />
            Cola de pedidos
          </h2>
          <span className="text-xs text-soil-brown bg-dark-surface border border-dark-border px-2 py-1 rounded-lg">
            {globalQueue.length} pendiente{globalQueue.length !== 1 ? 's' : ''}
          </span>
        </div>

        {globalQueue.length === 0 ? (
          <div className="text-center py-16 text-soil-brown">
            <Music2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No hay canciones en cola</p>
          </div>
        ) : (
          <div className="space-y-2">
            {globalQueue.map((item: GlobalQueueItem, index: number) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-dark-surface border border-dark-border hover:border-inca-gold/30 transition-colors group"
              >
                {/* Número de orden global */}
                <span className="text-lg font-bold text-inca-gold/60 font-serif w-7 text-center flex-shrink-0">
                  {index + 1}
                </span>

                {/* Info canción */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-warm-white text-sm font-semibold truncate">
                      {item.song.title}
                    </p>
                    <Badge variant={item.song.language} />
                  </div>
                  <p className="text-sand-beige text-xs truncate">{item.song.artist}</p>
                  {item.requestedBy && (
                    <p className="text-soil-brown text-xs truncate">
                      Pedido por: {item.requestedBy}
                    </p>
                  )}
                </div>

                {/* Mesa + tiempo */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs font-bold text-chakra-ocre bg-chakra-ocre/15 px-2 py-0.5 rounded-md">
                    Mesa {item.tableNumber}
                  </span>
                  <span className="text-xs text-soil-brown flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(item.createdAt)}
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => playMutation.mutate(item.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-selva-verde hover:bg-selva-verde/20 transition-colors"
                    title="Marcar como reproduciendo"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeMutation.mutate(item.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-kichwa-rojo hover:bg-kichwa-rojo/20 transition-colors"
                    title="Eliminar de la cola"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
