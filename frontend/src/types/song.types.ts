export type Language = 'SPANISH' | 'KICHWA' | 'ACHUAR' | 'OTHER';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string | null;
  genre: string;
  language: Language;
  duration: number;
  demoUrl: string;
  fullUrl?: string;
  coverUrl?: string | null;
  lyrics?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SongFilters {
  search?: string;
  language?: Language;
  genre?: string;
  artist?: string;
}

export interface CreateSongDto {
  title: string;
  artist: string;
  album?: string;
  genre: string;
  language: Language;
  duration: number;
  demoUrl: string;
  fullUrl: string;
  coverUrl?: string;
  lyrics?: string;
}

export interface UpdateSongDto extends Partial<CreateSongDto> {
  isActive?: boolean;
}
