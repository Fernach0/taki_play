'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Admin } from '@/types/auth.types';

interface AuthState {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  setAuth: (token: string, admin: Admin) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,
      setAuth: (token, admin) => set({ token, admin, isAuthenticated: true }),
      clearAuth: () => set({ token: null, admin: null, isAuthenticated: false }),
    }),
    {
      name: 'taki-auth',
    }
  )
);
