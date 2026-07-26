'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Music, ArrowLeft } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { useT } from '@/hooks/useT';

function buildSchema(mismatchMessage: string) {
  return z
    .object({
      newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
      confirmPassword: z.string().min(1, 'Requerido'),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: mismatchMessage,
      path: ['confirmPassword'],
    });
}

type FormData = z.infer<ReturnType<typeof buildSchema>>;

function ResetPasswordForm() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [done, setDone] = useState(false);

  const schema = buildSchema(t.resetPasswordMismatch);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (newPassword: string) => authService.resetPassword({ token, newPassword }),
    onSuccess: () => {
      setDone(true);
      toast.success(t.resetPasswordSuccess);
      setTimeout(() => router.push('/dj/login'), 2000);
    },
    onError: () => {
      toast.error(t.resetPasswordInvalidToken);
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
          <p className="text-gray-400 mt-1">{t.resetPasswordTitle}</p>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          {!token ? (
            <p className="text-sm text-red-400 text-center">{t.resetPasswordInvalidToken}</p>
          ) : done ? (
            <p className="text-sm text-gray-300 text-center">{t.resetPasswordSuccess}</p>
          ) : (
            <form onSubmit={handleSubmit((d) => mutation.mutate(d.newPassword))} className="space-y-4">
              <Input
                label={t.resetPasswordNewLabel}
                type="password"
                placeholder="••••••••"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
              <Input
                label={t.resetPasswordConfirmLabel}
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={mutation.isPending}
                className="w-full mt-2"
              >
                {t.resetPasswordSubmitBtn}
              </Button>
            </form>
          )}

          <Link
            href="/dj/login"
            className="mt-4 inline-flex items-center gap-2 text-sm text-soil-brown hover:text-sand-beige"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.forgotPasswordBackToLogin}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
