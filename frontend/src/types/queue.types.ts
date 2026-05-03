import { Song } from './song.types';

export type QueueStatus = 'PENDING' | 'PLAYING' | 'PLAYED' | 'CANCELLED';

export interface QueueItem {
  id: string;
  tableId: string;
  songId: string;
  song: Pick<Song, 'id' | 'title' | 'artist' | 'genre' | 'language' | 'coverUrl'>;
  requestedBy?: string | null;
  status: QueueStatus;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface TableQueue {
  tableId: string;
  tableNumber: number;
  items: QueueItem[];
  pendingCount: number;
}

export interface AllQueuesItem {
  tableId: string;
  tableNumber: number;
  pendingCount: number;
  currentlyPlaying: {
    id: string;
    song: Pick<Song, 'id' | 'title' | 'artist'>;
  } | null;
}

export interface GlobalQueueItem {
  id: string;
  tableId: string;
  tableNumber: number;
  song: Pick<Song, 'id' | 'title' | 'artist' | 'genre' | 'language' | 'coverUrl'>;
  requestedBy: string | null;
  position: number;
  createdAt: string;
  status: 'PENDING';
}

export interface AddToQueueDto {
  songId: string;
  tableId: string;
  sessionId: string;
  requestedBy?: string;
}

export interface UpdateQueueItemDto {
  status?: QueueStatus;
  position?: number;
}
