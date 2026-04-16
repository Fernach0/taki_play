'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ModalWrapper } from './ModalWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { tablesService } from '@/services/tables.service';

const schema = z.object({
  number: z.number().int().positive(),
});

type FormData = z.infer<typeof schema>;

interface AddTableModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function AddTableModal({ isOpen, onClose }: AddTableModalProps) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: tablesService.createTable,
    onSuccess: (table) => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success(`Mesa #${table.number} creada exitosamente`);
      reset();
      onClose();
    },
    onError: () => toast.error('Error al crear la mesa. ¿El número ya existe?'),
  });

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Nueva Mesa" size="sm">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Input
          label="Número de mesa *"
          type="number"
          placeholder="ej: 6"
          error={errors.number?.message}
          {...register('number', { valueAsNumber: true })}
        />
        <p className="text-xs text-gray-500">
          El código QR se generará automáticamente al crear la mesa.
        </p>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" variant="primary" loading={mutation.isPending} className="flex-1">Crear Mesa</Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
