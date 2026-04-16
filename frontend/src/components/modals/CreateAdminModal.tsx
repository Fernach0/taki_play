'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ModalWrapper } from './ModalWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type FormData = z.infer<typeof schema>;

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAdminModal({ isOpen, onClose }: CreateAdminModalProps) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: authService.createAdmin,
    onSuccess: (admin) => {
      qc.invalidateQueries({ queryKey: ['admins'] });
      toast.success(`Administrador "${admin.name}" creado`);
      reset();
      onClose();
    },
    onError: () => toast.error('Error al crear el administrador. ¿El email ya existe?'),
  });

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Nuevo Administrador" size="sm">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Input label="Nombre completo *" error={errors.name?.message} {...register('name')} />
        <Input label="Email *" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Contraseña *" type="password" error={errors.password?.message} {...register('password')} />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" variant="primary" loading={mutation.isPending} className="flex-1">Crear Admin</Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
