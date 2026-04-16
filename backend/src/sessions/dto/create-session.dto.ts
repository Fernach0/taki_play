import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty({ message: 'El qrCode es requerido' })
  qrCode: string;

  @IsOptional()
  @IsString()
  clientName?: string;
}
