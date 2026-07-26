'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Music, ArrowLeft } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { useT } from '@/hooks/useT';

const schema = z.object({
  email: z.string().email('Email inválido'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const t = useT();
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => {
      setSent(true);
    },
    onError: () => {
      toast.error('Ocurrió un error. Intenta de nuevo.');
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neon-purple/20 border border-neon-purple/40 mb-4 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <Music className="w-8 h-8 text-neon-purple" />
          </div>
          <h1 className="text-3xl font-bold text-white neon-text">Taki Play</h1>
          <p className="text-gray-400 mt-1">{t.forgotPasswordTitle}</p>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          {sent ? (
            <div className="space-y-6 text-center">
              <p className="text-sm text-gray-300">{t.forgotPasswordSuccess}</p>
              <Link href="/dj/login" className="inline-flex items-center gap-2 text-sm text-inca-gold hover:underline">
                <ArrowLeft className="w-4 h-4" />
                {t.forgotPasswordBackToLogin}
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-6">{t.forgotPasswordDesc}</p>
              <form onSubmit={handleSubmit((d) => mutation.mutate(d.email))} className="space-y-4">
                <Input
                  label={t.djEmail}
                  type="email"
                  placeholder="dj@takiplay.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={mutation.isPending}
                  className="w-full mt-2"
                >
                  {t.forgotPasswordSendBtn}
                </Button>
              </form>
              <Link
                href="/dj/login"
                className="mt-4 inline-flex items-center gap-2 text-sm text-soil-brown hover:text-sand-beige"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.forgotPasswordBackToLogin}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
