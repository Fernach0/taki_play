'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { songsService } from '@/services/songs.service';
import { sessionsService } from '@/services/sessions.service';
import { queueService } from '@/services/queue.service';
import { useSessionStore } from '@/store/sessionStore';
import { useLanguageStore } from '@/store/languageStore';
import { useQueue } from '@/hooks/useQueue';
import { useT } from '@/hooks/useT';
import { SongCard } from '@/components/client/SongCard';
import { SongFilters } from '@/components/client/SongFilters';
import { QueuePanel } from '@/components/client/QueuePanel';
import { RandomSongPanel } from '@/components/client/RandomSongPanel';
import { SongDetailModal } from '@/components/modals/SongDetailModal';
import { VinylAnimation } from '@/components/ui/VinylAnimation';
import { Spinner } from '@/components/ui/Spinner';
import { Song } from '@/types/song.types';
import { Language } from '@/types/song.types';
import { UILang } from '@/lib/i18n';
import { useModal } from '@/hooks/useModal';

const LANGS: { id: UILang; icon: string; label: string }[] = [
  { id: 'es', icon: '🇪🇸', label: 'ES' },
  { id: 'ki', icon: '🪶', label: 'KI' },
  { id: 'sh', icon: '🌿', label: 'SH' },
];

export default function MesaPage() {
  const params = useParams();
  const qrCode = params.qrCode as string;
  const qc = useQueryClient();

  const { sessionId, tableId, tableNumber, joinTable } = useSessionStore();
  const { lang, setLang } = useLanguageStore();
  const t = useT();
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState<Language | 'ALL'>('ALL');
  const songModal = useModal<Song>();

  const [sessionReady, setSessionReady] = useState(false);
  const joiningRef = useRef(false);

  // Vinyl animation state
  const [vinylSong, setVinylSong] = useState<Song | null>(null);
  const pendingSongRef = useRef<Song | null>(null);

  useEffect(() => {
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

  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['songs', search, langFilter],
    queryFn: () =>
      songsService.getSongs({
        search: search || undefined,
        language: langFilter !== 'ALL' ? langFilter : undefined,
      }),
    staleTime: 1000 * 60 * 5,
  });

  const { items: queueItems, pendingCount } = useQueue(tableId);

  const requestMutation = useMutation({
    mutationFn: (song: Song) => {
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
      const raw = err?.response?.data?.message ?? err?.message ?? 'Error al agregar la canción';
      const msg = Array.isArray(raw) ? raw.join(' · ') : raw;
      toast.error(msg);
    },
  });

  // Click handler: show vinyl animation, then open detail modal
  const handleSongClick = useCallback((song: Song) => {
    pendingSongRef.current = song;
    setVinylSong(song);
  }, []);

  const handleVinylDone = useCallback(() => {
    const song = pendingSongRef.current;
    setVinylSong(null);
    if (song) songModal.open(song);
  }, [songModal]);

  return (
    <div className="min-h-screen text-white pb-24 md:pb-0">
      {/* Vinyl animation overlay */}
      {vinylSong && (
        <VinylAnimation
          songTitle={vinylSong.title}
          artistName={vinylSong.artist}
          onDone={handleVinylDone}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-dark-base/90 backdrop-blur-sm border-b border-dark-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-warm-white font-serif">Taki Play</h1>
            {tableNumber && (
              <p className="text-xs text-inca-gold">Mesa #{tableNumber}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Selector de idioma */}
            <div className="flex items-center gap-1 bg-dark-surface border border-dark-border rounded-xl p-1">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLang(l.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                    lang === l.id
                      ? 'bg-inca-gold text-dark-base'
                      : 'text-soil-brown hover:text-sand-beige'
                  }`}
                  title={l.label}
                >
                  <span>{l.icon}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>

            <div className="text-xs text-soil-brown">{pendingCount}/10</div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-4">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-6">
          {/* ── Columna izquierda: buscador + filtros + canciones ── */}
          <div className="space-y-4">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soil-brown" />
              <input
                type="text"
                placeholder={t.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-surface border border-dark-border text-warm-white placeholder-soil-brown focus:outline-none focus:border-inca-gold transition-all text-sm"
              />
            </div>

            {/* Filtros de idioma de canción */}
            <SongFilters selected={langFilter} onChange={setLangFilter} />

            {/* Lista de canciones */}
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Spinner size="lg" />
              </div>
            ) : songs.length === 0 ? (
              <div className="text-center py-16 text-soil-brown">
                <p>{t.noSongs}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {songs.map((song) => (
                  <SongCard key={song.id} song={song} onClick={handleSongClick} />
                ))}
              </div>
            )}
          </div>

          {/* ── Columna derecha: canción aleatoria ── */}
          <RandomSongPanel songs={songs} onSelect={handleSongClick} />
        </div>
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
