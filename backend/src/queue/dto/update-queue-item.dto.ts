import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { QueueStatus } from '@prisma/client';

export class UpdateQueueItemDto {
  @IsOptional()
  @IsEnum(QueueStatus, {
    message: 'status debe ser: PENDING, PLAYING, PLAYED o CANCELLED',
  })
  status?: QueueStatus;

  @IsOptional()
  @IsInt()
  @IsPositive()
  position?: number;
}
