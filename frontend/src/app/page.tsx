import { QrCode, Music } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-base flex flex-col items-center justify-center p-6 text-center">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-3xl" />
      </div>

      <div className="relative space-y-8 max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)]">
            <Music className="w-10 h-10 text-neon-purple" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Taki Play</h1>
            <p className="text-neon-cyan text-sm mt-1 tracking-widest uppercase">
              Karaoke Intercultural
            </p>
          </div>
        </div>

        {/* Instrucción QR */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-xl border-2 border-neon-cyan/60 flex items-center justify-center animate-pulse">
              <QrCode className="w-8 h-8 text-neon-cyan" />
            </div>
          </div>
          <p className="text-white font-semibold text-lg">Escanea el QR de tu mesa</p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Busca el código QR en tu mesa, escanéalo con la cámara de tu teléfono
            y empieza a pedir canciones.
          </p>
        </div>

        {/* Link al DJ */}
        <p className="text-gray-600 text-xs">
          ¿Eres el DJ?{' '}
          <Link href="/dj/login" className="text-neon-purple hover:text-purple-300 transition-colors">
            Accede al panel
          </Link>
        </p>
      </div>
    </div>
  );
}
