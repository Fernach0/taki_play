import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAdminDto: CreateAdminDto) {
    const { name, email, password } = createAdminDto;

    const existing = await this.prisma.admin.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await this.prisma.admin.create({
      data: { name, email, passwordHash },
    });

    const { passwordHash: _, ...result } = admin;
    return result;
  }

  async findAll() {
    const admins = await this.prisma.admin.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return admins.map(({ passwordHash: _, ...admin }) => admin);
  }
}
