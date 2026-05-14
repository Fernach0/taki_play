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
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const queue_gateway_1 = require("../websockets/queue.gateway");
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
let QueueService = class QueueService {
    constructor(prisma, queueGateway) {
        this.prisma = prisma;
        this.queueGateway = queueGateway;
    }
    async addToQueue(addToQueueDto) {
        const { songId, tableId, sessionId, requestedBy } = addToQueueDto;
        const table = await this.prisma.table.findUnique({ where: { id: tableId } });
        if (!table || !table.isActive) {
            throw new common_1.NotFoundException('Mesa no encontrada o inactiva');
        }
        const song = await this.prisma.song.findUnique({ where: { id: songId } });
        if (!song || !song.isActive) {
            throw new common_1.NotFoundException('Canción no encontrada o inactiva');
        }
        const session = await this.prisma.tableSession.findFirst({
            where: { id: sessionId, tableId },
        });
        if (!session) {
            throw new common_1.NotFoundException('Sesión no válida para esta mesa');
        }
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
                throw new common_1.BadRequestException(`Debes esperar ${mins}:${secs.toString().padStart(2, '0')} min antes de pedir otra canción.`);
            }
        }
        const pendingCount = await this.prisma.queueItem.count({
            where: { tableId, status: 'PENDING' },
        });
        if (pendingCount >= 10) {
            throw new common_1.BadRequestException('La cola de esta mesa ya tiene el máximo de 10 canciones. Espera a que se reproduzcan algunas.');
        }
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
    async getTableQueue(tableId) {
        const table = await this.prisma.table.findUnique({ where: { id: tableId } });
        if (!table) {
            throw new common_1.NotFoundException('Mesa no encontrada');
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
        return Promise.all(tables.map(async (table) => {
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
        }));
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
    async updateItem(id, updateQueueItemDto) {
        const item = await this.prisma.queueItem.findUnique({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('Item de cola no encontrado');
        }
        if (updateQueueItemDto.status === 'PLAYING') {
            const playing = await this.prisma.queueItem.findFirst({
                where: { tableId: item.tableId, status: 'PLAYING', NOT: { id } },
            });
            if (playing) {
                throw new common_1.BadRequestException('Ya hay una canción reproduciéndose en esta mesa');
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
    async removeItem(id) {
        const item = await this.prisma.queueItem.findUnique({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('Item de cola no encontrado');
        }
        await this.prisma.queueItem.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
        const remaining = await this.prisma.queueItem.findMany({
            where: { tableId: item.tableId, status: 'PENDING' },
            orderBy: { position: 'asc' },
        });
        await Promise.all(remaining.map((ri, index) => this.prisma.queueItem.update({
            where: { id: ri.id },
            data: { position: index + 1 },
        })));
        await this.emitQueueUpdate(item.tableId);
        return { message: 'Item eliminado de la cola', id };
    }
    async emitQueueUpdate(tableId) {
        const queue = await this.prisma.queueItem.findMany({
            where: { tableId, status: { in: ['PENDING', 'PLAYING'] } },
            orderBy: { position: 'asc' },
            include: QUEUE_ITEM_INCLUDE,
        });
        this.queueGateway.emitQueueUpdate(tableId, queue);
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_gateway_1.QueueGateway])
], QueueService);
//# sourceMappingURL=queue.service.js.map