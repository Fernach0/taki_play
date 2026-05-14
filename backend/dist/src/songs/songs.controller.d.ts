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
        demoUrl: string;
        coverUrl: string;
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
        demoUrl: string;
        coverUrl: string;
        lyrics: string;
    }>;
    create(createSongDto: CreateSongDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        title: string;
        artist: string;
        album: string | null;
        genre: string;
        language: import(".prisma/client").$Enums.Language;
        duration: number;
        demoUrl: string;
        fullUrl: string;
        coverUrl: string | null;
        lyrics: string | null;
    }>;
    update(id: string, updateSongDto: UpdateSongDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        title: string;
        artist: string;
        album: string | null;
        genre: string;
        language: import(".prisma/client").$Enums.Language;
        duration: number;
        demoUrl: string;
        fullUrl: string;
        coverUrl: string | null;
        lyrics: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
        id: string;
    }>;
    uploadCover(id: string, file: Express.Multer.File, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        title: string;
        artist: string;
        album: string | null;
        genre: string;
        language: import(".prisma/client").$Enums.Language;
        duration: number;
        demoUrl: string;
        fullUrl: string;
        coverUrl: string | null;
        lyrics: string | null;
    }>;
}
