import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToQueueDto } from './dto/add-to-queue.dto';
import { UpdateQueueItemDto } from './dto/update-queue-item.dto';
import { QueueGateway } from '../websockets/queue.gateway';

const QUEUE_ITEM_INCLUDE = {
  song: {
    select: {
      id: true,
      title: true,
      artist: true,
      genre: true,
      language: true,
      coverUrl: true,
    },
  },
};

@Injectable()
export class QueueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueGateway: QueueGateway,
  ) {}

  async addToQueue(addToQueueDto: AddToQueueDto) {
    const { songId, tableId, sessionId, requestedBy } = addToQueueDto;

    // Verificar mesa activa
    const table = await this.prisma.table.findUnique({ where: { id: tableId } });
    if (!table || !table.isActive) {
      throw new NotFoundException('Mesa no encontrada o inactiva');
    }

    // Verificar canción activa
    const song = await this.prisma.song.findUnique({ where: { id: songId } });
    if (!song || !song.isActive) {
      throw new NotFoundException('Canción no encontrada o inactiva');
    }

    // Verificar sesión válida
    const session = await this.prisma.tableSession.findFirst({
      where: { id: sessionId, tableId },
    });
    if (!session) {
      throw new NotFoundException('Sesión no válida para esta mesa');
    }

    // Cooldown: mínimo 6 minutos entre pedidos por mesa
    const COOLDOWN_MS = 6 * 60 * 1000;
    const lastRequest = await this.prisma.queueItem.findFirst({
      where: { tableId, status: { in: ['PENDING', 'PLAYING', 'PLAYED'] } },
      orderBy: { createdAt: 'desc' },
    });
    if (lastRequest) {
      const elapsed = Date.now() - new Date(lastRequest.createdAt).getTime();
      if (elapsed < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        throw new BadRequestException(
          `Debes esperar ${mins}:${secs.toString().padStart(2, '0')} min antes de pedir otra canción.`,
        );
      }
    }

    // Regla crítica: máximo 10 canciones pendientes por mesa
    const pendingCount = await this.prisma.queueItem.count({
      where: { tableId, status: 'PENDING' },
    });
    if (pendingCount >= 10) {
      throw new BadRequestException(
        'La cola de esta mesa ya tiene el máximo de 10 canciones. Espera a que se reproduzcan algunas.',
      );
    }

    // Calcular siguiente posición
    const lastItem = await this.prisma.queueItem.findFirst({
      where: { tableId, status: { in: ['PENDING', 'PLAYING'] } },
      orderBy: { position: 'desc' },
    });
    const nextPosition = lastItem ? lastItem.position + 1 : 1;

    const queueItem = await this.prisma.queueItem.create({
      data: { tableId, songId, requestedBy, position: nextPosition },
      include: QUEUE_ITEM_INCLUDE,
    });

    await this.emitQueueUpdate(tableId);
    return queueItem;
  }

  async getTableQueue(tableId: string) {
    const table = await this.prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      throw new NotFoundException('Mesa no encontrada');
    }

    const items = await this.prisma.queueItem.findMany({
      where: { tableId, status: { in: ['PENDING', 'PLAYING'] } },
      orderBy: { position: 'asc' },
      include: QUEUE_ITEM_INCLUDE,
    });

    return {
      tableId,
      tableNumber: table.number,
      items,
      pendingCount: items.filter((i) => i.status === 'PENDING').length,
    };
  }

  async getAllQueues() {
    const tables = await this.prisma.table.findMany({
      where: { isActive: true },
      orderBy: { number: 'asc' },
    });

    return Promise.all(
      tables.map(async (table) => {
        const playing = await this.prisma.queueItem.findFirst({
          where: { tableId: table.id, status: 'PLAYING' },
          include: {
            song: { select: { id: true, title: true, artist: true, fullUrl: true } },
          },
        });
        const pendingCount = await this.prisma.queueItem.count({
          where: { tableId: table.id, status: 'PENDING' },
        });

        return {
          tableId: table.id,
          tableNumber: table.number,
          pendingCount,
          currentlyPlaying: playing
            ? { id: playing.id, song: playing.song }
            : null,
        };
      }),
    );
  }

  async getGlobalQueue() {
    const items = await this.prisma.queueItem.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: {
        ...QUEUE_ITEM_INCLUDE,
        table: { select: { id: true, number: true } },
      },
    });

    return items.map((item) => ({
      id: item.id,
      tableId: item.tableId,
      tableNumber: item.table.number,
      song: item.song,
      requestedBy: item.requestedBy,
      position: item.position,
      createdAt: item.createdAt,
      status: item.status,
    }));
  }

  async updateItem(id: string, updateQueueItemDto: UpdateQueueItemDto) {
    const item = await this.prisma.queueItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Item de cola no encontrado');
    }

    // Si se marca como PLAYING, verificar que no haya otro reproduciéndose
    if (updateQueueItemDto.status === 'PLAYING') {
      const playing = await this.prisma.queueItem.findFirst({
        where: { tableId: item.tableId, status: 'PLAYING', NOT: { id } },
      });
      if (playing) {
        throw new BadRequestException(
          'Ya hay una canción reproduciéndose en esta mesa',
        );
      }
    }

    const updated = await this.prisma.queueItem.update({
      where: { id },
      data: updateQueueItemDto,
      include: QUEUE_ITEM_INCLUDE,
    });

    await this.emitQueueUpdate(item.tableId);

    if (updateQueueItemDto.status === 'PLAYING') {
      this.queueGateway.emitNowPlaying(item.tableId, updated.song);
    }

    return updated;
  }

  async removeItem(id: string) {
    const item = await this.prisma.queueItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Item de cola no encontrado');
    }

    await this.prisma.queueItem.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Re-calcular posiciones de los items pendientes restantes
    const remaining = await this.prisma.queueItem.findMany({
      where: { tableId: item.tableId, status: 'PENDING' },
      orderBy: { position: 'asc' },
    });

    await Promise.all(
      remaining.map((ri, index) =>
        this.prisma.queueItem.update({
          where: { id: ri.id },
          data: { position: index + 1 },
        }),
      ),
    );

    await this.emitQueueUpdate(item.tableId);
    return { message: 'Item eliminado de la cola', id };
  }

  private async emitQueueUpdate(tableId: string) {
    const queue = await this.prisma.queueItem.findMany({
      where: { tableId, status: { in: ['PENDING', 'PLAYING'] } },
      orderBy: { position: 'asc' },
      include: QUEUE_ITEM_INCLUDE,
    });

    this.queueGateway.emitQueueUpdate(tableId, queue);
  }
}
