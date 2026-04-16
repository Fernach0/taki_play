export interface Table {
  id: string;
  number: number;
  qrCode: string;
  isActive: boolean;
  pendingQueueCount?: number;
  createdAt: string;
}

export interface CreateTableDto {
  number: number;
}

export interface UpdateTableDto {
  number?: number;
  isActive?: boolean;
}
