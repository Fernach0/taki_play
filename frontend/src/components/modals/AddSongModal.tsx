'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ModalWrapper } from './ModalWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { songsService } from '@/services/songs.service';

const schema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  artist: z.string().min(1, 'El artista es requerido'),
  album: z.string().optional(),
  genre: z.string().min(1, 'El género es requerido'),
  language: z.enum(['SPANISH', 'KICHWA', 'ACHUAR', 'OTHER']),
  duration: z.number().int().positive(),
  demoUrl: z.string().url('Debe ser una URL válida'),
  fullUrl: z.string().url('Debe ser una URL válida'),
  coverUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSongModal({ isOpen, onClose }: AddSongModalProps) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: songsService.createSong,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['songs'] });
      toast.success('Canción creada exitosamente');
      reset();
      onClose();
    },
    onError: () => toast.error('Error al crear la canción'),
  });

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Nueva Canción" size="lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d as FormData))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Título *" error={errors.title?.message} {...register('title')} />
          <Input label="Artista *" error={errors.artist?.message} {...register('artist')} />
          <Input label="Álbum" error={errors.album?.message} {...register('album')} />
          <Input label="Género *" error={errors.genre?.message} {...register('genre')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Idioma *</label>
            <select
              className="w-full px-4 py-2.5 rounded-lg text-sm text-white bg-dark-surface border border-dark-border focus:outline-none focus:border-neon-purple transition-all"
              {...register('language')}
            >
              <option value="SPANISH">Español</option>
              <option value="KICHWA">Kichwa</option>
              <option value="ACHUAR">Achuar</option>
              <option value="OTHER">Otro</option>
            </select>
            {errors.language && <p className="text-xs text-red-400">{errors.language.message}</p>}
          </div>
          <Input label="Duración (segundos) *" type="number" error={errors.duration?.message} {...register('duration', { valueAsNumber: true })} />
        </div>
        <Input label="URL Demo (15-30 seg) *" error={errors.demoUrl?.message} {...register('demoUrl')} />
        <Input label="URL Completa *" error={errors.fullUrl?.message} {...register('fullUrl')} />
        <Input label="URL Portada" error={errors.coverUrl?.message} {...register('coverUrl')} />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" variant="primary" loading={mutation.isPending} className="flex-1">Crear Canción</Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
