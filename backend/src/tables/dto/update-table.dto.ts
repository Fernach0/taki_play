import { IsInt, IsPositive, IsBoolean, IsOptional } from 'class-validator';

export class UpdateTableDto {
  @IsOptional()
  @IsInt({ message: 'El número de mesa debe ser un entero' })
  @IsPositive({ message: 'El número de mesa debe ser positivo' })
  number?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
