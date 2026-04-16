import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { AddToQueueDto } from './dto/add-to-queue.dto';
import { UpdateQueueItemDto } from './dto/update-queue-item.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  // Rutas públicas (clientes)
  @Post()
  addToQueue(@Body() addToQueueDto: AddToQueueDto) {
    return this.queueService.addToQueue(addToQueueDto);
  }

  @Get('table/:tableId')
  getTableQueue(@Param('tableId') tableId: string) {
    return this.queueService.getTableQueue(tableId);
  }

  // Rutas protegidas (DJ)
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllQueues() {
    return this.queueService.getAllQueues();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateItem(
    @Param('id') id: string,
    @Body() updateQueueItemDto: UpdateQueueItemDto,
  ) {
    return this.queueService.updateItem(id, updateQueueItemDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  removeItem(@Param('id') id: string) {
    return this.queueService.removeItem(id);
  }
}
