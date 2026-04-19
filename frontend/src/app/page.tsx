import { QrCode } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-base flex flex-col items-center justify-center p-6 text-center">
      {/* Fondo decorativo — resplandor dorado cálido */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-inca-gold/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-selva-verde/3 rounded-full blur-3xl" />
      </div>

      <div className="relative space-y-8 max-w-sm">
        {/* Logo — símbolo solar */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-inca-gold/15 border border-inca-gold/40 shadow-[0_0_40px_rgba(212,160,23,0.25)]" />
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-inca-gold relative z-10" stroke="currentColor" strokeWidth="1.2">
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="1" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="1" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="4.22" x2="7.05" y2="7.05" />
              <line x1="16.95" y1="16.95" x2="19.78" y2="19.78" />
              <line x1="4.22" y1="19.78" x2="7.05" y2="16.95" />
              <line x1="16.95" y1="7.05" x2="19.78" y2="4.22" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-warm-white font-serif oro-text">Taki Play</h1>
            <p className="text-inca-gold text-sm mt-1 tracking-widest uppercase">
              Karaoke Intercultural
            </p>
            <p className="text-soil-brown text-xs mt-2 italic">
              Kichwa · Achuar · Español
            </p>
          </div>
        </div>

        {/* Instrucción QR */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-xl border-2 border-inca-gold/50 flex items-center justify-center animate-pulse">
              <QrCode className="w-8 h-8 text-inca-gold" />
            </div>
          </div>
          <p className="text-warm-white font-semibold text-lg font-serif">Escanea el QR de tu mesa</p>
          <p className="text-sand-beige text-sm leading-relaxed">
            Busca el código QR en tu mesa, escanéalo con la cámara de tu teléfono
            y empieza a pedir canciones.
          </p>
          <div className="pt-2 border-t border-dark-border">
            <p className="text-soil-brown text-xs">
              Música de los pueblos indígenas del Ecuador
            </p>
          </div>
        </div>

        {/* Link al DJ */}
        <p className="text-soil-brown text-xs">
          ¿Eres el DJ?{' '}
          <Link href="/dj/login" className="text-inca-gold hover:text-[#e8b420] transition-colors">
            Accede al panel
          </Link>
        </p>
      </div>
    </div>
  );
}
