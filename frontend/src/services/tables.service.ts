import { api } from '@/lib/api';
import { Table, CreateTableDto, UpdateTableDto } from '@/types/table.types';

export const tablesService = {
  getTables: async (): Promise<Table[]> => {
    const { data } = await api.get<Table[]>('/tables');
    return data;
  },

  getTable: async (id: string): Promise<Table> => {
    const { data } = await api.get<Table>(`/tables/${id}`);
    return data;
  },

  createTable: async (dto: CreateTableDto): Promise<Table> => {
    const { data } = await api.post<Table>('/tables', dto);
    return data;
  },

  updateTable: async (id: string, dto: UpdateTableDto): Promise<Table> => {
    const { data } = await api.patch<Table>(`/tables/${id}`, dto);
    return data;
  },

  deleteTable: async (id: string): Promise<{ message: string; id: string }> => {
    const { data } = await api.delete(`/tables/${id}`);
    return data;
  },
};
