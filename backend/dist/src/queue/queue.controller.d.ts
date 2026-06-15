import { QueueService } from './queue.service';
import { AddToQueueDto } from './dto/add-to-queue.dto';
import { UpdateQueueItemDto } from './dto/update-queue-item.dto';
export declare class QueueController {
    private readonly queueService;
    constructor(queueService: QueueService);
    addToQueue(addToQueueDto: AddToQueueDto): Promise<{
        song: {
            id: string;
            title: string;
            artist: string;
            genre: string;
            language: import(".prisma/client").$Enums.Language;
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
    }>;
    getTableQueue(tableId: string): Promise<{
        tableId: string;
        tableNumber: number;
        items: ({
            song: {
                id: string;
                title: string;
                artist: string;
                genre: string;
                language: import(".prisma/client").$Enums.Language;
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
        pendingCount: number;
    }>;
    getAllQueues(): Promise<{
        tableId: string;
        tableNumber: number;
        pendingCount: number;
        currentlyPlaying: {
            id: string;
            song: {
                id: string;
                title: string;
                artist: string;
            };
        };
    }[]>;
    getGlobalQueue(): Promise<{
        id: string;
        tableId: string;
        tableNumber: number;
        song: {
            id: string;
            title: string;
            artist: string;
            genre: string;
            language: import(".prisma/client").$Enums.Language;
        };
        requestedBy: string;
        position: number;
        createdAt: Date;
        status: import(".prisma/client").$Enums.QueueStatus;
    }[]>;
    updateItem(id: string, updateQueueItemDto: UpdateQueueItemDto): Promise<{
        song: {
            id: string;
            title: string;
            artist: string;
            genre: string;
            language: import(".prisma/client").$Enums.Language;
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
    }>;
    removeItem(id: string): Promise<{
        message: string;
        id: string;
    }>;
}
