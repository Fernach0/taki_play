import { QueueStatus } from '@prisma/client';
export declare class UpdateQueueItemDto {
    status?: QueueStatus;
    position?: number;
}
