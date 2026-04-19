'use client';

import { useState, useEffect, useRef } from 'react';
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

  const { sessionId, tableId, tableNumber, joinTable } = useSessionStore();
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState<Language | 'ALL'>('ALL');
  const songModal = useModal<Song>();

  // Estado local para saber si la sesión está garantizada desde esta carga de página.
  // NO depende de Zustand isJoined (que puede tener datos rancios de sessionStorage).
  const [sessionReady, setSessionReady] = useState(false);
  const joiningRef = useRef(false);

  useEffect(() => {
    // Evitar doble llamada por StrictMode o re-renders
    if (joiningRef.current) return;
    joiningRef.current = true;

    sessionsService
      .joinTable(qrCode)
      .then((session) => {
        joinTable(session);
        setSessionReady(true);
      })
      .catch(() => {
        toast.error('QR inválido o mesa no disponible');
        joiningRef.current = false;
      });
  }, [qrCode]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Pedir canción — tableId y sessionId garantizados por sessionReady
  const requestMutation = useMutation({
    mutationFn: (song: Song) => {
      // Capturamos los valores en el momento exacto de ejecución
      const currentTableId = useSessionStore.getState().tableId;
      const currentSessionId = useSessionStore.getState().sessionId;

      if (!song?.id || !currentTableId || !currentSessionId) {
        return Promise.reject(new Error('Sesión o canción inválida. Recarga la página.'));
      }

      return queueService.addToQueue({
        songId: song.id,
        tableId: currentTableId,
        sessionId: currentSessionId,
      });
    },
    onSuccess: (_, song) => {
      qc.invalidateQueries({ queryKey: ['queue', tableId] });
      toast.success(`"${song.title}" agregada a la cola`);
      songModal.close();
    },
    onError: (err: any) => {
      // Mostrar todos los errores de validación del backend o el mensaje directo
      const raw = err?.response?.data?.message ?? err?.message ?? 'Error al agregar la canción';
      const msg = Array.isArray(raw) ? raw.join(' · ') : raw;
      toast.error(msg);
    },
  });

  return (
    <div className="min-h-screen bg-dark-base text-white pb-24 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-dark-base/90 backdrop-blur-sm border-b border-dark-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-warm-white font-serif">Taki Play</h1>
            {tableNumber && (
              <p className="text-xs text-inca-gold">Mesa #{tableNumber}</p>
            )}
          </div>
          <div className="text-xs text-soil-brown">{pendingCount}/10 en cola</div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soil-brown" />
          <input
            type="text"
            placeholder="Buscar canciones o artistas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-surface border border-dark-border text-warm-white placeholder-soil-brown focus:outline-none focus:border-inca-gold transition-all text-sm"
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
          <div className="text-center py-16 text-soil-brown">
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
        isSessionReady={sessionReady}
      />
    </div>
  );
}
