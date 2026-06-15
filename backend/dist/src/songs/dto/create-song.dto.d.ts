import { Language } from '@prisma/client';
export declare class CreateSongDto {
    title: string;
    artist: string;
    album?: string;
    genre: string;
    language: Language;
    duration: number;
    lyrics?: string;
}
