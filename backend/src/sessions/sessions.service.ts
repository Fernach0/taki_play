import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async join(createSessionDto: CreateSessionDto) {
    const { qrCode, clientName } = createSessionDto;

    const table = await this.prisma.table.findUnique({ where: { qrCode } });
    if (!table || !table.isActive) {
      throw new NotFoundException(
        'QR inválido o la mesa no está disponible. Pide ayuda al DJ.',
      );
    }

    const session = await this.prisma.tableSession.create({
      data: {
        tableId: table.id,
        clientName: clientName ?? null,
      },
    });

    return {
      sessionId: session.id,
      tableId: table.id,
      tableNumber: table.number,
      clientName: session.clientName,
      createdAt: session.createdAt,
    };
  }

  async findOne(id: string) {
    const session = await this.prisma.tableSession.findUnique({
      where: { id },
      include: {
        table: { select: { number: true, isActive: true } },
      },
    });

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    return {
      sessionId: session.id,
      tableId: session.tableId,
      tableNumber: session.table.number,
      clientName: session.clientName,
      createdAt: session.createdAt,
    };
  }
}
