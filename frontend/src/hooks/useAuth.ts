'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { LoginDto } from '@/types/auth.types';

export function useAuth() {
  const router = useRouter();
  const { setAuth, clearAuth, isAuthenticated, admin } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (dto: LoginDto) => authService.login(dto),
    onSuccess: (data) => {
      setAuth(data.access_token, data.admin);
      toast.success(`Bienvenido, ${data.admin.name}`);
      router.push('/dj');
    },
    onError: () => {
      toast.error('Credenciales incorrectas. Verifica tu email y contraseña.');
    },
  });

  const logout = () => {
    clearAuth();
    router.push('/dj/login');
  };

  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
    logout,
    isAuthenticated,
    admin,
  };
}
