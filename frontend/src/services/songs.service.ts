import { api } from '@/lib/api';
import { Song, SongFilters, CreateSongDto, UpdateSongDto } from '@/types/song.types';

export const songsService = {
  getSongs: async (filters?: SongFilters): Promise<Song[]> => {
    const { data } = await api.get<Song[]>('/songs', { params: filters });
    return data;
  },

  getSong: async (id: string): Promise<Song> => {
    const { data } = await api.get<Song>(`/songs/${id}`);
    return data;
  },

  createSong: async (dto: CreateSongDto): Promise<Song> => {
    const { data } = await api.post<Song>('/songs', dto);
    return data;
  },

  updateSong: async (id: string, dto: UpdateSongDto): Promise<Song> => {
    const { data } = await api.patch<Song>(`/songs/${id}`, dto);
    return data;
  },

  deleteSong: async (id: string): Promise<{ message: string; id: string }> => {
    const { data } = await api.delete(`/songs/${id}`);
    return data;
  },
};
