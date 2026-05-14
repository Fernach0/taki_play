import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
export declare class TablesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createTableDto: CreateTableDto): Promise<{
        number: number;
        id: string;
        createdAt: Date;
        qrCode: string;
        isActive: boolean;
    }>;
    findAll(): Promise<{
        id: string;
        number: number;
        qrCode: string;
        isActive: boolean;
        pendingQueueCount: number;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        queueItems: ({
            song: {
                id: string;
                title: string;
                artist: string;
                language: import(".prisma/client").$Enums.Language;
                coverUrl: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            position: number;
            tableId: string;
            songId: string;
            requestedBy: string | null;
            status: import(".prisma/client").$Enums.QueueStatus;
        })[];
    } & {
        number: number;
        id: string;
        createdAt: Date;
        qrCode: string;
        isActive: boolean;
    }>;
    update(id: string, updateTableDto: UpdateTableDto): Promise<{
        number: number;
        id: string;
        createdAt: Date;
        qrCode: string;
        isActive: boolean;
    }>;
    remove(id: string): Promise<{
        message: string;
        id: string;
    }>;
}
