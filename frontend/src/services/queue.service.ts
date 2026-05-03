import { api } from '@/lib/api';
import {
  TableQueue,
  AllQueuesItem,
  GlobalQueueItem,
  QueueItem,
  AddToQueueDto,
  UpdateQueueItemDto,
} from '@/types/queue.types';

export const queueService = {
  addToQueue: async (dto: AddToQueueDto): Promise<QueueItem> => {
    const { data } = await api.post<QueueItem>('/queue', dto);
    return data;
  },

  getTableQueue: async (tableId: string): Promise<TableQueue> => {
    const { data } = await api.get<TableQueue>(`/queue/table/${tableId}`);
    return data;
  },

  getAllQueues: async (): Promise<AllQueuesItem[]> => {
    const { data } = await api.get<AllQueuesItem[]>('/queue');
    return data;
  },

  getGlobalQueue: async (): Promise<GlobalQueueItem[]> => {
    const { data } = await api.get<GlobalQueueItem[]>('/queue/global');
    return data;
  },

  updateItem: async (id: string, dto: UpdateQueueItemDto): Promise<QueueItem> => {
    const { data } = await api.patch<QueueItem>(`/queue/${id}`, dto);
    return data;
  },

  removeItem: async (id: string): Promise<{ message: string; id: string }> => {
    const { data } = await api.delete(`/queue/${id}`);
    return data;
  },
};
