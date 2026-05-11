'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { songsService } from '@/services/songs.service';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { AddSongModal } from '@/components/modals/AddSongModal';
import { EditSongModal } from '@/components/modals/EditSongModal';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { useModal } from '@/hooks/useModal';
import { useT } from '@/hooks/useT';
import { Song } from '@/types/song.types';
import { formatDuration } from '@/lib/utils';

export function SongsPanel() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const t = useT();
  const addModal = useModal();
  const editModal = useModal<Song>();
  const deleteModal = useModal<Song>();

  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['songs', search],
    queryFn: () => songsService.getSongs({ search: search || undefined, includeInactive: true }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => songsService.deleteSong(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['songs'] });
      toast.success('Canción desactivada');
      deleteModal.close();
    },
    onError: () => toast.error('Error al desactivar la canción'),
  });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h2 className="text-lg font-bold text-white">{t.songsTitle} ({songs.length})</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder={t.djSearch}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg bg-dark-surface border border-dark-border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple transition-all"
            />
          </div>
          <Button variant="primary" size="sm" onClick={() => addModal.open()}>
            <Plus className="w-4 h-4" /> {t.newSong}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-dark-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border bg-dark-base/50">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">{t.colSong}</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">{t.colLanguage}</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">{t.colGenre}</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">{t.colDuration}</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">{t.colStatus}</th>
              <th className="text-right px-4 py-3 text-gray-400 font-medium">{t.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <tr key={song.id} className="border-b border-dark-border/50 hover:bg-dark-base/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-white font-medium truncate max-w-[200px]">{song.title}</p>
                  <p className="text-gray-400 text-xs">{song.artist}</p>
                </td>
                <td className="px-4 py-3"><Badge variant={song.language} /></td>
                <td className="px-4 py-3 text-gray-400">{song.genre}</td>
                <td className="px-4 py-3 text-gray-400 font-mono">{formatDuration(song.duration)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${song.isActive ? 'bg-green-900/50 text-green-300' : 'bg-gray-800 text-gray-500'}`}>
                    {song.isActive ? t.statusActive : t.statusInactive}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => editModal.open(song)} className="p-1.5 rounded-lg text-gray-400 hover:text-neon-cyan hover:bg-cyan-950/30 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteModal.open(song)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddSongModal isOpen={addModal.isOpen} onClose={addModal.close} />
      <EditSongModal isOpen={editModal.isOpen} onClose={editModal.close} song={editModal.selected} />
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={() => deleteModal.selected && deleteMutation.mutate(deleteModal.selected.id)}
        entityName={deleteModal.selected?.title ?? ''}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
