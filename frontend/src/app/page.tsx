'use client';

import { QrCode } from 'lucide-react';
import Link from 'next/link';
import { useLanguageStore } from '@/store/languageStore';
import { useT } from '@/hooks/useT';
import { UILang } from '@/lib/i18n';

const LANGS: { id: UILang; icon: string; label: string }[] = [
  { id: 'es', icon: '🇪🇸', label: 'ES' },
  { id: 'ki', icon: '🪶', label: 'KI' },
  { id: 'sh', icon: '🌿', label: 'SH' },
];

export default function HomePage() {
  const { lang, setLang } = useLanguageStore();
  const t = useT();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-inca-gold/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-selva-verde/3 rounded-full blur-3xl" />
      </div>

      {/* Selector de idioma — esquina superior derecha */}
      <div className="absolute top-4 right-4 flex items-center gap-1 bg-dark-surface border border-dark-border rounded-xl p-1">
        {LANGS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLang(l.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
              lang === l.id
                ? 'bg-inca-gold text-dark-base'
                : 'text-soil-brown hover:text-sand-beige'
            }`}
          >
            <span>{l.icon}</span>
            <span>{l.label}</span>
          </button>
        ))}
      </div>

      <div className="relative space-y-8 max-w-sm">
        {/* Logo */}
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
              {t.homeSubtitle}
            </p>
            <p className="text-soil-brown text-xs mt-2 italic">
              {t.homeLangs}
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
          <p className="text-warm-white font-semibold text-lg font-serif">{t.homeQrTitle}</p>
          <p className="text-sand-beige text-sm leading-relaxed">{t.homeQrDesc}</p>
          <div className="pt-2 border-t border-dark-border">
            <p className="text-soil-brown text-xs">{t.homeFooter}</p>
          </div>
        </div>

        {/* Link al DJ */}
        <p className="text-soil-brown text-xs">
          {t.homeIsDJ}{' '}
          <Link href="/dj/login" className="text-inca-gold hover:text-[#e8b420] transition-colors">
            {t.homeDJLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
