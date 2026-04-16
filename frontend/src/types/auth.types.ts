export interface Admin {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  admin: Admin;
}

export interface CreateAdminDto {
  name: string;
  email: string;
  password: string;
}

export interface SessionData {
  sessionId: string;
  tableId: string;
  tableNumber: number;
  clientName?: string | null;
  createdAt: string;
}
