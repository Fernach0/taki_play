import { api } from '@/lib/api';
import { LoginDto, LoginResponse, Admin, CreateAdminDto } from '@/types/auth.types';

export const authService = {
  login: async (dto: LoginDto): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', dto);
    return data;
  },

  getAdmins: async (): Promise<Admin[]> => {
    const { data } = await api.get<Admin[]>('/admin');
    return data;
  },

  createAdmin: async (dto: CreateAdminDto): Promise<Admin> => {
    const { data } = await api.post<Admin>('/admin', dto);
    return data;
  },
};
