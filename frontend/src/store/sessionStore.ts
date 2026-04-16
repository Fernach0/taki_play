'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SessionState {
  sessionId: string | null;
  tableId: string | null;
  tableNumber: number | null;
  clientName: string | null;
  isJoined: boolean;
  joinTable: (data: {
    sessionId: string;
    tableId: string;
    tableNumber: number;
    clientName?: string | null;
  }) => void;
  leaveTable: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionId: null,
      tableId: null,
      tableNumber: null,
      clientName: null,
      isJoined: false,
      joinTable: (data) =>
        set({
          sessionId: data.sessionId,
          tableId: data.tableId,
          tableNumber: data.tableNumber,
          clientName: data.clientName ?? null,
          isJoined: true,
        }),
      leaveTable: () =>
        set({
          sessionId: null,
          tableId: null,
          tableNumber: null,
          clientName: null,
          isJoined: false,
        }),
    }),
    {
      name: 'taki-session',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : localStorage
      ),
    }
  )
);
