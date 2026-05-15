'use client';

import { ModalWrapper } from './ModalWrapper';
import { Button } from '@/components/ui/Button';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName: string;
  description?: string;
  isLoading?: boolean;
  isDangerous?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  entityName,
  description,
  isLoading,
  isDangerous = false,
}: ConfirmDeleteModalProps) {
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isDangerous ? 'Eliminar permanentemente' : 'Confirmar desactivación'}
      size="sm"
    >
      <p className="text-gray-300 mb-2">
        {isDangerous ? '¿Eliminar permanentemente ' : '¿Desactivar '}
        <span className="text-white font-semibold">"{entityName}"</span>?
      </p>
      <p className={`text-xs mb-6 ${isDangerous ? 'text-red-400' : 'text-gray-500'}`}>
        {description ?? (isDangerous
          ? 'Esta acción no se puede deshacer.'
          : 'Se puede reactivar más tarde desde esta misma pantalla.')}
      </p>
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={isLoading}>
          {isDangerous ? 'Eliminar definitivamente' : 'Sí, desactivar'}
        </Button>
      </div>
    </ModalWrapper>
  );
}
