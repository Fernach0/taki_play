'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export function DJHeader() {
  const { admin, logout } = useAuth();

  return (
    <header className="bg-dark-surface/90 backdrop-blur-sm border-b border-inca-gold/20 px-6 py-4 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Símbolo solar estilizado */}
          <div className="w-9 h-9 rounded-lg bg-inca-gold/15 border border-inca-gold/40 flex items-center justify-center shadow-[0_0_12px_rgba(212,160,23,0.2)]">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-inca-gold" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
              <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
              <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" />
              <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-warm-white font-serif">Taki Play</h1>
            <p className="text-xs text-inca-gold">Panel del DJ</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {admin && (
            <span className="text-sm text-sand-beige hidden sm:block">
              {admin.name}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={logout} className="gap-1">
            <LogOut className="w-4 h-4" />
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
}
