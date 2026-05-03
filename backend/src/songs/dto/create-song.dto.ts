import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';
import { Language } from '@prisma/client';

export class CreateSongDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es requerido' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'El artista es requerido' })
  artist: string;

  @IsOptional()
  @IsString()
  album?: string;

  @IsString()
  @IsNotEmpty({ message: 'El género es requerido' })
  genre: string;

  @IsEnum(Language, {
    message: 'El idioma debe ser: SPANISH, KICHWA, ACHUAR u OTHER',
  })
  language: Language;

  @IsInt()
  @IsPositive({ message: 'La duración debe ser mayor a 0 (en segundos)' })
  duration: number;

  @IsUrl({}, { message: 'demoUrl debe ser una URL válida' })
  demoUrl: string;

  @IsUrl({}, { message: 'fullUrl debe ser una URL válida' })
  fullUrl: string;

  @IsOptional()
  @IsUrl({}, { message: 'coverUrl debe ser una URL válida' })
  coverUrl?: string;

  @IsOptional()
  @IsString()
  lyrics?: string;
}
