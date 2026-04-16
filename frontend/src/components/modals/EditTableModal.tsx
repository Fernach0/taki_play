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
import { tablesService } from '@/services/tables.service';
import { Table } from '@/types/table.types';

const schema = z.object({
  number: z.number().int().positive(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface EditTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
}

export function EditTableModal({ isOpen, onClose, table }: EditTableModalProps) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (table) reset({ number: table.number, isActive: table.isActive });
  }, [table, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => tablesService.updateTable(table!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Mesa actualizada');
      onClose();
    },
    onError: () => toast.error('Error al actualizar la mesa'),
  });

  if (!table) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={`Editar Mesa #${table.number}`} size="sm">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Input label="Número de mesa *" type="number" error={errors.number?.message} {...register('number', { valueAsNumber: true })} />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="tableActive" {...register('isActive')} className="w-4 h-4 accent-neon-purple" />
          <label htmlFor="tableActive" className="text-sm text-gray-300">Mesa activa</label>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" variant="primary" loading={mutation.isPending} className="flex-1">Guardar</Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
