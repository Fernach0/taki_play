"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TablesService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
let TablesService = class TablesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTableDto) {
        const existing = await this.prisma.table.findUnique({
            where: { number: createTableDto.number },
        });
        if (existing) {
            throw new common_1.ConflictException(`La mesa ${createTableDto.number} ya existe`);
        }
        return this.prisma.table.create({
            data: {
                number: createTableDto.number,
                qrCode: (0, crypto_1.randomUUID)(),
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Mesa no encontrada');
        }
        return table;
    }
    async update(id, updateTableDto) {
        await this.findOne(id);
        if (updateTableDto.number) {
            const existing = await this.prisma.table.findFirst({
                where: { number: updateTableDto.number, NOT: { id } },
            });
            if (existing) {
                throw new common_1.ConflictException(`El número ${updateTableDto.number} ya está en uso`);
            }
        }
        return this.prisma.table.update({
            where: { id },
            data: updateTableDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.table.update({
            where: { id },
            data: { isActive: false },
        });
        return { message: 'Mesa desactivada exitosamente', id };
    }
};
exports.TablesService = TablesService;
exports.TablesService = TablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TablesService);
//# sourceMappingURL=tables.service.js.map