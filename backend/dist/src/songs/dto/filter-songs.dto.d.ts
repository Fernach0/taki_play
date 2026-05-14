import { Language } from '@prisma/client';
export declare class FilterSongsDto {
    search?: string;
    language?: Language;
    genre?: string;
    artist?: string;
    includeInactive?: boolean;
}
