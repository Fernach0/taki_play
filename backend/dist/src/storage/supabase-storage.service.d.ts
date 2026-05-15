import { ConfigService } from '@nestjs/config';
export declare class SupabaseStorageService {
    private readonly config;
    private readonly supabase;
    private readonly bucket;
    constructor(config: ConfigService);
    uploadCover(songId: string, buffer: Buffer, mimetype: string): Promise<string>;
    deleteCover(songId: string): Promise<void>;
}
