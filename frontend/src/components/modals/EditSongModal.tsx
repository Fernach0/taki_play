'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ModalWrapper } from './ModalWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { songsService } from '@/services/songs.service';
import { Song } from '@/types/song.types';

const schema = z.object({
  title: z.string().min(1),
  artist: z.string().min(1),
  album: z.string().optional(),
  genre: z.string().min(1),
  language: z.enum(['SPANISH', 'KICHWA', 'ACHUAR', 'OTHER']),
  duration: z.number().int().positive(),
  demoUrl: z.string().url(),
  fullUrl: z.string().url(),
  coverUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

interface EditSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
}

export function EditSongModal({ isOpen, onClose, song }: EditSongModalProps) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (song) reset({ ...song, coverUrl: song.coverUrl ?? '', album: song.album ?? '' });
  }, [song, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => songsService.updateSong(song!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['songs'] });
      toast.success('Canción actualizada');
      onClose();
    },
    onError: () => toast.error('Error al actualizar'),
  });

  if (!song) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Editar Canción" size="lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d as FormData))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Título *" error={errors.title?.message} {...register('title')} />
          <Input label="Artista *" error={errors.artist?.message} {...register('artist')} />
          <Input label="Álbum" {...register('album')} />
          <Input label="Género *" error={errors.genre?.message} {...register('genre')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Idioma *</label>
            <select className="w-full px-4 py-2.5 rounded-lg text-sm text-white bg-dark-surface border border-dark-border focus:outline-none focus:border-neon-purple transition-all" {...register('language')}>
              <option value="SPANISH">Español</option>
              <option value="KICHWA">Kichwa</option>
              <option value="ACHUAR">Achuar</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>
          <Input label="Duración (seg) *" type="number" error={errors.duration?.message} {...register('duration', { valueAsNumber: true })} />
        </div>
        <Input label="URL Demo *" error={errors.demoUrl?.message} {...register('demoUrl')} />
        <Input label="URL Completa *" error={errors.fullUrl?.message} {...register('fullUrl')} />
        <Input label="URL Portada" error={errors.coverUrl?.message} {...register('coverUrl')} />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isActive" {...register('isActive')} className="w-4 h-4 accent-neon-purple" />
          <label htmlFor="isActive" className="text-sm text-gray-300">Activa</label>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" variant="primary" loading={mutation.isPending} className="flex-1">Guardar cambios</Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
