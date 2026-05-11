'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Music } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageStore } from '@/store/languageStore';
import { useT } from '@/hooks/useT';
import { UILang } from '@/lib/i18n';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type FormData = z.infer<typeof schema>;

const LANGS: { id: UILang; icon: string; label: string }[] = [
  { id: 'es', icon: '🇪🇸', label: 'ES' },
  { id: 'ki', icon: '🪶', label: 'KI' },
  { id: 'sh', icon: '🌿', label: 'SH' },
];

export default function DJLoginPage() {
  const { login, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { lang, setLang } = useLanguageStore();
  const t = useT();

  useEffect(() => {
    if (isAuthenticated) router.replace('/dj');
  }, [isAuthenticated, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <div className="min-h-screen bg-dark-base flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
      </div>

      {/* Selector de idioma */}
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

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neon-purple/20 border border-neon-purple/40 mb-4 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <Music className="w-8 h-8 text-neon-purple" />
          </div>
          <h1 className="text-3xl font-bold text-white neon-text">Taki Play</h1>
          <p className="text-gray-400 mt-1">{t.djSubtitle}</p>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <h2 className="text-xl font-semibold text-white mb-6">{t.djLoginTitle}</h2>

          <form onSubmit={handleSubmit((d) => login(d))} className="space-y-4">
            <Input
              label={t.djEmail}
              type="email"
              placeholder="dj@takiplay.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label={t.djPassword}
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full mt-2"
            >
              {t.djLoginBtn}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
