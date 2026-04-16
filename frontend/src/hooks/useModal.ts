'use client';

import { useState, useCallback } from 'react';

export function useModal<T = undefined>() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<T | null>(null);

  const open = useCallback((entity?: T) => {
    setSelected(entity ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSelected(null);
  }, []);

  return { isOpen, selected, open, close };
}
