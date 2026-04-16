import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Language } from '@prisma/client';

export class FilterSongsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  artist?: string;
}
