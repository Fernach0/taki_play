import { api } from '@/lib/api';
import { SessionData } from '@/types/auth.types';

export const sessionsService = {
  joinTable: async (
    qrCode: string,
    clientName?: string
  ): Promise<SessionData> => {
    const { data } = await api.post<SessionData>('/sessions/join', {
      qrCode,
      clientName,
    });
    return data;
  },

  getSession: async (id: string): Promise<SessionData> => {
    const { data } = await api.get<SessionData>(`/sessions/${id}`);
    return data;
  },
};
