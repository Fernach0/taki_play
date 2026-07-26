'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { FullPageSpinner } from '@/components/ui/Spinner';

// Rutas bajo /dj accesibles sin sesión iniciada
const PUBLIC_ROUTES = ['/dj/login', '/dj/forgot-password', '/dj/reset-password'];

export default function DJLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (!isAuthenticated && !isPublic) {
      router.replace('/dj/login');
    }
  }, [isAuthenticated, isPublic, router]);

  if (!isAuthenticated && !isPublic) {
    return <FullPageSpinner />;
  }

  return <>{children}</>;
}
