'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function ModalWrapper({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalWrapperProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-[rgba(13,10,7,0.85)] backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className={`fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 px-4 ${sizes[size]}`}
              >
                <div className="bg-dark-surface border border-inca-gold/30 rounded-2xl shadow-[0_0_40px_rgba(212,160,23,0.15)] overflow-hidden flex flex-col max-h-[85vh]">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-dark-border flex-shrink-0">
                    <div>
                      <Dialog.Title className="text-lg font-bold text-warm-white font-serif">
                        {title}
                      </Dialog.Title>
                      {/* Siempre presente para cumplir con ARIA — oculto si no hay descripción visible */}
                      <Dialog.Description className={description ? 'text-sm text-sand-beige mt-0.5' : 'sr-only'}>
                        {description ?? `Formulario: ${title}`}
                      </Dialog.Description>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg text-soil-brown hover:text-warm-white hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body — única zona con scroll */}
                  <div className="p-6 overflow-y-auto flex-1 min-h-0">{children}</div>

                  {/* Footer — fijo, siempre visible sin scrollear */}
                  {footer && (
                    <div className="p-6 pt-4 border-t border-dark-border flex-shrink-0">{footer}</div>
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
