'use client';

import { Music, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export function DJHeader() {
  const { admin, logout } = useAuth();

  return (
    <header className="bg-dark-surface/90 backdrop-blur-sm border-b border-dark-border px-6 py-4 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center">
            <Music className="w-4 h-4 text-neon-purple" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Taki Play</h1>
            <p className="text-xs text-neon-cyan">Panel del DJ</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {admin && (
            <span className="text-sm text-gray-400 hidden sm:block">
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
