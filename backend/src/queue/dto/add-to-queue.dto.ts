import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddToQueueDto {
  @IsNotEmpty({ message: 'songId es requerido' })
  @IsString({ message: 'songId debe ser texto' })
  songId: string;

  @IsNotEmpty({ message: 'tableId es requerido' })
  @IsString({ message: 'tableId debe ser texto' })
  tableId: string;

  @IsNotEmpty({ message: 'sessionId es requerido' })
  @IsString({ message: 'sessionId debe ser texto' })
  sessionId: string;

  @IsOptional()
  @IsString()
  requestedBy?: string;
}
