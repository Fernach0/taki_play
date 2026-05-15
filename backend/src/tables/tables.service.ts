import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTableDto: CreateTableDto) {
    const existing = await this.prisma.table.findUnique({
      where: { number: createTableDto.number },
    });
    if (existing) {
      throw new ConflictException(`La mesa ${createTableDto.number} ya existe`);
    }

    return this.prisma.table.create({
      data: {
        number: createTableDto.number,
        qrCode: randomUUID(),
      },
    });
  }

  async findAll() {
    const tables = await this.prisma.table.findMany({
      orderBy: { number: 'asc' },
      include: {
        _count: {
          select: {
            queueItems: {
              where: { status: 'PENDING' },
            },
          },
        },
      },
    });

    return tables.map((t) => ({
      id: t.id,
      number: t.number,
      qrCode: t.qrCode,
      isActive: t.isActive,
      pendingQueueCount: t._count.queueItems,
      createdAt: t.createdAt,
    }));
  }

  async findOne(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        queueItems: {
          where: { status: { in: ['PENDING', 'PLAYING'] } },
          orderBy: { position: 'asc' },
          include: {
            song: {
              select: {
                id: true,
                title: true,
                artist: true,
                language: true,
              },
            },
          },
        },
      },
    });

    if (!table) {
      throw new NotFoundException('Mesa no encontrada');
    }

    return table;
  }

  async update(id: string, updateTableDto: UpdateTableDto) {
    await this.findOne(id);

    if (updateTableDto.number) {
      const existing = await this.prisma.table.findFirst({
        where: { number: updateTableDto.number, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(
          `El número ${updateTableDto.number} ya está en uso`,
        );
      }
    }

    return this.prisma.table.update({
      where: { id },
      data: updateTableDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.table.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Mesa desactivada exitosamente', id };
  }
}
