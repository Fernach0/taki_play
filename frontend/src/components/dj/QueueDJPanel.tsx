'use client';

import { useRef, useEffect, useState } from 'react';
import { Play, Trash2, Music2, Clock, Users, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import { SongCover } from '@/components/ui/SongCover';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queueService } from '@/services/queue.service';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { GlobalQueueItem } from '@/types/queue.types';
import { useT } from '@/hooks/useT';

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  return `${Math.floor(diff / 3600)}h`;
}

export function QueueDJPanel() {
  const qc = useQueryClient();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const t = useT();

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

  const finishMutation = useMutation({
    mutationFn: (id: string) => queueService.updateItem(id, { status: 'PLAYED' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['global-queue'] });
      qc.invalidateQueries({ queryKey: ['all-queues'] });
      toast.success('Canción marcada como terminada');
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

  const nowPlaying = allQueues.filter((item) => item.currentlyPlaying !== null);
  const isLoading = loadingGlobal || loadingPlaying;

  const currentUrl = nowPlaying[0]?.currentlyPlaying?.song.fullUrl ?? null;
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentUrl) {
      if (audio.src !== currentUrl) {
        audio.src = currentUrl;
        audio.load();
      }
      audio.play().catch(() => {});
    } else {
      audio.pause();
      audio.src = '';
    }
  }, [currentUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="space-y-8">
      <audio ref={audioRef} />

      {/* ── En reproducción ── */}
      {nowPlaying.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-inca-gold uppercase tracking-widest flex items-center gap-2">
              <Music2 className="w-4 h-4 animate-pulse" />
              {t.nowPlaying}
            </h2>
            <button
              onClick={() => setMuted((m) => !m)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                muted
                  ? 'bg-kichwa-rojo/20 border-kichwa-rojo/40 text-kichwa-rojo'
                  : 'bg-selva-verde/20 border-selva-verde/40 text-selva-verde'
              }`}
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              {muted ? t.soundMuted : t.soundActive}
            </button>
          </div>
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
                  {t.tableLabel} {table.tableNumber}
                </span>
                <button
                  onClick={() => finishMutation.mutate(table.currentlyPlaying!.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-selva-verde/20 border border-selva-verde/40 text-selva-verde text-xs font-semibold hover:bg-selva-verde/30 transition-colors flex-shrink-0"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {t.markDone}
                </button>
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
            {t.queueRequests}
          </h2>
          <span className="text-xs text-soil-brown bg-dark-surface border border-dark-border px-2 py-1 rounded-lg">
            {globalQueue.length}
          </span>
        </div>

        {globalQueue.length === 0 ? (
          <div className="text-center py-16 text-soil-brown">
            <Music2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{t.noQueue}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {globalQueue.map((item: GlobalQueueItem, index: number) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-dark-surface border border-dark-border hover:border-inca-gold/30 transition-colors group"
              >
                <span className="text-lg font-bold text-inca-gold/60 font-serif w-7 text-center flex-shrink-0">
                  {index + 1}
                </span>

                <div className="w-10 h-10 rounded-lg bg-dark-base border border-dark-border flex-shrink-0 overflow-hidden">
                  <SongCover songId={item.song.id} title={item.song.title} iconClassName="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-warm-white text-sm font-semibold truncate">{item.song.title}</p>
                    <Badge variant={item.song.language} />
                  </div>
                  <p className="text-sand-beige text-xs truncate">{item.song.artist}</p>
                  {item.requestedBy && (
                    <p className="text-soil-brown text-xs truncate">
                      {t.by}: {item.requestedBy}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs font-bold text-chakra-ocre bg-chakra-ocre/15 px-2 py-0.5 rounded-md">
                    {t.tableLabel} {item.tableNumber}
                  </span>
                  <span className="text-xs text-soil-brown flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(item.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => playMutation.mutate(item.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-selva-verde hover:bg-selva-verde/20 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeMutation.mutate(item.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-kichwa-rojo hover:bg-kichwa-rojo/20 transition-colors"
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
