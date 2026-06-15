import { Response } from 'express';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { FilterSongsDto } from './dto/filter-songs.dto';
export declare class SongsController {
    private readonly songsService;
    constructor(songsService: SongsService);
    findAll(filters: FilterSongsDto): Promise<{
        id: string;
        isActive: boolean;
        title: string;
        artist: string;
        album: string;
        genre: string;
        language: import(".prisma/client").$Enums.Language;
        duration: number;
        lyrics: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        isActive: boolean;
        title: string;
        artist: string;
        album: string;
        genre: string;
        language: import(".prisma/client").$Enums.Language;
        duration: number;
        lyrics: string;
    }>;
    getCover(id: string, res: Response): Promise<void>;
    getDemo(id: string, res: Response): Promise<void>;
    getFull(id: string, res: Response): Promise<void>;
    create(createSongDto: CreateSongDto): Promise<{
        id: string;
        isActive: boolean;
        title: string;
        artist: string;
        album: string;
        genre: string;
        language: import(".prisma/client").$Enums.Language;
        duration: number;
        lyrics: string;
    }>;
    update(id: string, updateSongDto: UpdateSongDto): Promise<{
        id: string;
        isActive: boolean;
        title: string;
        artist: string;
        album: string;
        genre: string;
        language: import(".prisma/client").$Enums.Language;
        duration: number;
        lyrics: string;
    }>;
    remove(id: string): Promise<{
        message: string;
        id: string;
        deleted: boolean;
    }>;
    removeCover(id: string): Promise<{
        id: string;
        isActive: boolean;
        title: string;
        artist: string;
        album: string;
        genre: string;
        language: import(".prisma/client").$Enums.Language;
        duration: number;
        lyrics: string;
    }>;
    uploadCover(id: string, file: Express.Multer.File): Promise<{
        id: string;
        isActive: boolean;
        title: string;
        artist: string;
        album: string;
        genre: string;
        language: import(".prisma/client").$Enums.Language;
        duration: number;
        lyrics: string;
    }>;
    uploadDemo(id: string, file: Express.Multer.File): Promise<{
        id: string;
        isActive: boolean;
        title: string;
        artist: string;
        album: string;
        genre: string;
        language: import(".prisma/client").$Enums.Language;
        duration: number;
        lyrics: string;
    }>;
    uploadFull(id: string, file: Express.Multer.File): Promise<{
        id: string;
        isActive: boolean;
        title: string;
        artist: string;
        album: string;
        genre: string;
        language: import(".prisma/client").$Enums.Language;
        duration: number;
        lyrics: string;
    }>;
}
