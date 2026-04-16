import { IsInt, IsPositive } from 'class-validator';

export class CreateTableDto {
  @IsInt({ message: 'El número de mesa debe ser un entero' })
  @IsPositive({ message: 'El número de mesa debe ser positivo' })
  number: number;
}
