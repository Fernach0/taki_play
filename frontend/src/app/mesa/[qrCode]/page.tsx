'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { songsService } from '@/services/songs.service';
import { sessionsService } from '@/services/sessions.service';
import { queueService } from '@/services/queue.service';
import { useSessionStore } from '@/store/sessionStore';
import { useQueue } from '@/hooks/useQueue';
import { SongCard } from '@/components/client/SongCard';
import { SongFilters } from '@/components/client/SongFilters';
import { QueuePanel } from '@/components/client/QueuePanel';
import { SongDetailModal } from '@/components/modals/SongDetailModal';
import { Spinner } from '@/components/ui/Spinner';
import { Song } from '@/types/song.types';
import { Language } from '@/types/song.types';
import { useModal } from '@/hooks/useModal';

export default function MesaPage() {
  const params = useParams();
  const qrCode = params.qrCode as string;
  const qc = useQueryClient();

  const { sessionId, tableId, tableNumber, isJoined, joinTable } = useSessionStore();
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState<Language | 'ALL'>('ALL');
  const songModal = useModal<Song>();

  // Unirse a la mesa si no hay sesión activa
  useEffect(() => {
    if (!isJoined || !tableId) {
      sessionsService
        .joinTable(qrCode)
        .then((session) => joinTable(session))
        .catch(() => toast.error('QR inválido o mesa no disponible'));
    }
  }, [qrCode]);

  // Canciones
  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['songs', search, langFilter],
    queryFn: () =>
      songsService.getSongs({
        search: search || undefined,
        language: langFilter !== 'ALL' ? langFilter : undefined,
      }),
    staleTime: 1000 * 60 * 5,
  });

  // Cola en tiempo real
  const { items: queueItems, pendingCount } = useQueue(tableId);

  // Pedir canción
  const requestMutation = useMutation({
    mutationFn: (song: Song) =>
      queueService.addToQueue({
        songId: song.id,
        tableId: tableId!,
        sessionId: sessionId!,
      }),
    onSuccess: (_, song) => {
      qc.invalidateQueries({ queryKey: ['queue', tableId] });
      toast.success(`"${song.title}" agregada a la cola 🎵`);
      songModal.close();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Error al agregar la canción';
      toast.error(msg);
    },
  });

  return (
    <div className="min-h-screen bg-dark-base text-white pb-24 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-dark-base/90 backdrop-blur-sm border-b border-dark-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">🎵 Taki Play</h1>
            {tableNumber && (
              <p className="text-xs text-neon-cyan">Mesa #{tableNumber}</p>
            )}
          </div>
          <div className="text-xs text-gray-500">{pendingCount}/10 en cola</div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar canciones o artistas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-surface border border-dark-border text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple transition-all text-sm"
          />
        </div>

        {/* Filtros de idioma */}
        <SongFilters selected={langFilter} onChange={setLangFilter} />

        {/* Lista de canciones */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>No se encontraron canciones</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} onClick={songModal.open} />
            ))}
          </div>
        )}
      </main>

      {/* Panel de cola */}
      <QueuePanel items={queueItems} pendingCount={pendingCount} />

      {/* Modal de detalle */}
      <SongDetailModal
        isOpen={songModal.isOpen}
        onClose={songModal.close}
        song={songModal.selected}
        pendingCount={pendingCount}
        onRequest={requestMutation.mutate}
        isRequesting={requestMutation.isPending}
      />
    </div>
  );
}
