'use client';

import { ModalWrapper } from './ModalWrapper';
import { Button } from '@/components/ui/Button';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName: string;
  isLoading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  entityName,
  isLoading,
}: ConfirmDeleteModalProps) {
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar eliminación"
      size="sm"
    >
      <p className="text-gray-300 mb-6">
        ¿Estás seguro de que deseas desactivar{' '}
        <span className="text-white font-semibold">"{entityName}"</span>? Esta
        acción se puede revertir más tarde.
      </p>
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={isLoading}>
          Sí, eliminar
        </Button>
      </div>
    </ModalWrapper>
  );
}
