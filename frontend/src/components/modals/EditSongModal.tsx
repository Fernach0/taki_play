'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ImagePlus, Trash2, Music } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { songsService } from '@/services/songs.service';
import { Song } from '@/types/song.types';

const schema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  artist: z.string().min(1, 'El artista es requerido'),
  album: z.string().optional(),
  genre: z.string().min(1, 'El género es requerido'),
  language: z.enum(['SPANISH', 'KICHWA', 'ACHUAR', 'OTHER']),
  lyrics: z.string().optional(),
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview local antes de subir
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // null = sin cambios, '' = quitar imagen
  const [coverAction, setCoverAction] = useState<'none' | 'upload' | 'remove'>('none');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (song) {
      reset({
        title: song.title,
        artist: song.artist,
        album: song.album ?? '',
        genre: song.genre,
        language: song.language,
        lyrics: song.lyrics ?? '',
        isActive: song.isActive,
      });
      setPreviewUrl(null);
      setCoverAction('none');
      setSelectedFile(null);
    }
  }, [song, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setCoverAction('upload');
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveCover = () => {
    setCoverAction('remove');
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancelCoverChange = () => {
    setCoverAction('none');
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      // 1. Guardar datos del formulario
      await songsService.updateSong(song!.id, data);

      // 2. Procesar imagen según la acción elegida
      if (coverAction === 'upload' && selectedFile) {
        setUploadingCover(true);
        await songsService.uploadCover(song!.id, selectedFile);
        setUploadingCover(false);
      } else if (coverAction === 'remove') {
        await songsService.removeCover(song!.id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['songs'] });
      toast.success('Canción actualizada');
      onClose();
    },
    onError: () => {
      setUploadingCover(false);
      toast.error('Error al actualizar');
    },
  });

  if (!song) return null;

  const displayedCover = previewUrl ?? song.coverUrl ?? null;
  const isRemoving = coverAction === 'remove';

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Editar Canción" size="lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">

        {/* ── Portada ── */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-dark-base border border-dark-border">
          {/* Preview */}
          <div className="w-24 h-24 rounded-xl border border-dark-border flex-shrink-0 overflow-hidden bg-dark-surface flex items-center justify-center">
            {displayedCover && !isRemoving ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayedCover}
                alt="Portada"
                className="w-full h-full object-cover"
              />
            ) : (
              <Music className="w-8 h-8 text-soil-brown opacity-50" />
            )}
          </div>

          {/* Controles */}
          <div className="flex flex-col gap-2 flex-1">
            <p className="text-xs text-gray-400 font-medium">Imagen de portada</p>

            {isRemoving && (
              <p className="text-xs text-amber-400 bg-amber-900/20 rounded-lg px-2 py-1">
                La imagen se quitará al guardar
              </p>
            )}
            {coverAction === 'upload' && selectedFile && (
              <p className="text-xs text-selva-verde bg-selva-verde/10 rounded-lg px-2 py-1 truncate">
                ✓ {selectedFile.name}
              </p>
            )}

            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-surface border border-dark-border text-xs text-gray-300 hover:border-inca-gold/50 hover:text-inca-gold transition-colors"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                {displayedCover && !isRemoving ? 'Cambiar imagen' : 'Agregar imagen'}
              </button>

              {(displayedCover && !isRemoving) && (
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-kichwa-rojo/10 border border-kichwa-rojo/30 text-xs text-kichwa-rojo hover:bg-kichwa-rojo/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Quitar imagen
                </button>
              )}

              {coverAction !== 'none' && (
                <button
                  type="button"
                  onClick={handleCancelCoverChange}
                  className="px-3 py-1.5 rounded-lg bg-dark-surface border border-dark-border text-xs text-soil-brown hover:text-sand-beige transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>

            <p className="text-xs text-soil-brown">JPG, PNG, WEBP · máx 5 MB</p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpg,image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* ── Campos del formulario ── */}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Título *" error={errors.title?.message} {...register('title')} />
          <Input label="Artista *" error={errors.artist?.message} {...register('artist')} />
          <Input label="Álbum" {...register('album')} />
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
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">Letra</label>
          <textarea
            rows={5}
            placeholder="Escribe aquí la letra de la canción..."
            className="w-full px-4 py-2.5 rounded-lg text-sm text-white bg-dark-surface border border-dark-border focus:outline-none focus:border-neon-purple transition-all resize-none font-serif"
            {...register('lyrics')}
          />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="isActive" {...register('isActive')} className="w-4 h-4 accent-neon-purple" />
          <label htmlFor="isActive" className="text-sm text-gray-300">Activa</label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={mutation.isPending || uploadingCover}
            className="flex-1"
          >
            {uploadingCover ? 'Subiendo imagen...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
