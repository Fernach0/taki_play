import { PrismaService } from '../prisma/prisma.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { FilterSongsDto } from './dto/filter-songs.dto';
export declare class SongsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    updateCoverImage(id: string, buffer: Buffer, mimeType: string): Promise<{
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
    removeCoverImage(id: string): Promise<{
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
    findCoverImage(id: string): Promise<{
        coverImage: Buffer<ArrayBufferLike>;
        coverMimeType: string;
    }>;
    updateDemoAudio(id: string, buffer: Buffer, mimeType: string): Promise<{
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
    updateFullAudio(id: string, buffer: Buffer, mimeType: string): Promise<{
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
    findAudio(id: string, type: 'demo' | 'full'): Promise<{
        demoAudio: Buffer<ArrayBufferLike>;
        demoMimeType: string;
        fullAudio: Buffer<ArrayBufferLike>;
        fullMimeType: string;
    }>;
    findOneForAdmin(id: string): Promise<{
        id: string;
        isActive: boolean;
    }>;
}
