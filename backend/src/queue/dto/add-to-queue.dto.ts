import { IsOptional, IsString, IsUUID } from 'class-validator';

export class AddToQueueDto {
  @IsUUID('4', { message: 'songId debe ser un UUID válido' })
  songId: string;

  @IsUUID('4', { message: 'tableId debe ser un UUID válido' })
  tableId: string;

  @IsUUID('4', { message: 'sessionId debe ser un UUID válido' })
  sessionId: string;

  @IsOptional()
  @IsString()
  requestedBy?: string;
}
