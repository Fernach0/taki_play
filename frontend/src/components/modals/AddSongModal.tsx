'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Music, FileAudio } from 'lucide-react';
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
  duration: z.number().int().positive('La duración debe ser mayor a 0'),
  lyrics: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSongModal({ isOpen, onClose }: AddSongModalProps) {
  const qc = useQueryClient();
  const demoRef = useRef<HTMLInputElement>(null);
  const fullRef = useRef<HTMLInputElement>(null);

  const [demoFile, setDemoFile] = useState<File | null>(null);
  const [fullFile, setFullFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const song = await songsService.createSong(data);
      setUploading(true);
      if (demoFile) await songsService.uploadDemo(song.id, demoFile);
      if (fullFile) await songsService.uploadFull(song.id, fullFile);
      return song;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['songs'] });
      toast.success('Canción creada exitosamente');
      reset();
      setDemoFile(null);
      setFullFile(null);
      setUploading(false);
      onClose();
    },
    onError: () => {
      setUploading(false);
      toast.error('Error al crear la canción');
    },
  });

  const handleFileSelect = (type: 'demo' | 'full', file: File | undefined) => {
    if (!file) return;
    if (type === 'demo') setDemoFile(file);
    else setFullFile(file);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Nueva Canción" size="lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">

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
            {errors.language && <p className="text-xs text-red-400">{errors.language.message}</p>}
          </div>
          <Input
            label="Duración (segundos) *"
            type="number"
            error={errors.duration?.message}
            {...register('duration', { valueAsNumber: true })}
          />
        </div>

        {/* Archivos MP3 */}
        <div className="grid grid-cols-2 gap-3">
          {/* Demo */}
          <div
            onClick={() => demoRef.current?.click()}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-dark-border bg-dark-base hover:border-inca-gold/50 cursor-pointer transition-colors"
          >
            <FileAudio className={`w-6 h-6 ${demoFile ? 'text-selva-verde' : 'text-soil-brown'}`} />
            <p className="text-xs font-medium text-gray-300">Demo (15-30 seg)</p>
            <p className="text-xs text-center text-soil-brown truncate w-full text-center">
              {demoFile ? demoFile.name : 'Clic para seleccionar MP3'}
            </p>
            <input
              ref={demoRef}
              type="file"
              accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
              className="hidden"
              onChange={(e) => handleFileSelect('demo', e.target.files?.[0])}
            />
          </div>

          {/* Full */}
          <div
            onClick={() => fullRef.current?.click()}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-dark-border bg-dark-base hover:border-inca-gold/50 cursor-pointer transition-colors"
          >
            <Music className={`w-6 h-6 ${fullFile ? 'text-selva-verde' : 'text-soil-brown'}`} />
            <p className="text-xs font-medium text-gray-300">Audio completo</p>
            <p className="text-xs text-center text-soil-brown truncate w-full text-center">
              {fullFile ? fullFile.name : 'Clic para seleccionar MP3'}
            </p>
            <input
              ref={fullRef}
              type="file"
              accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
              className="hidden"
              onChange={(e) => handleFileSelect('full', e.target.files?.[0])}
            />
          </div>
        </div>
        <p className="text-xs text-soil-brown">Demo: máx 20 MB · Audio completo: máx 50 MB</p>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">Letra</label>
          <textarea
            rows={4}
            placeholder="Escribe aquí la letra de la canción..."
            className="w-full px-4 py-2.5 rounded-lg text-sm text-white bg-dark-surface border border-dark-border focus:outline-none focus:border-neon-purple transition-all resize-none font-serif"
            {...register('lyrics')}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button
            type="submit"
            variant="primary"
            loading={mutation.isPending || uploading}
            className="flex-1"
          >
            {uploading ? 'Subiendo archivos...' : 'Crear Canción'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
