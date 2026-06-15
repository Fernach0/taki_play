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
exports.SongsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const PUBLIC_SONG_SELECT = {
    id: true,
    title: true,
    artist: true,
    album: true,
    genre: true,
    language: true,
    duration: true,
    lyrics: true,
    isActive: true,
};
let SongsService = class SongsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const { search, language, genre, artist, includeInactive } = filters;
        return this.prisma.song.findMany({
            where: {
                ...(includeInactive ? {} : { isActive: true }),
                AND: [
                    search ? { OR: [
                            { title: { contains: search, mode: 'insensitive' } },
                            { artist: { contains: search, mode: 'insensitive' } },
                        ] } : {},
                    language ? { language } : {},
                    genre ? { genre: { contains: genre, mode: 'insensitive' } } : {},
                    artist ? { artist: { contains: artist, mode: 'insensitive' } } : {},
                ],
            },
            select: PUBLIC_SONG_SELECT,
            orderBy: { title: 'asc' },
        });
    }
    async findOne(id) {
        const song = await this.prisma.song.findUnique({ where: { id }, select: PUBLIC_SONG_SELECT });
        if (!song)
            throw new common_1.NotFoundException('Canción no encontrada');
        return song;
    }
    async create(createSongDto) {
        return this.prisma.song.create({ data: createSongDto, select: PUBLIC_SONG_SELECT });
    }
    async update(id, updateSongDto) {
        await this.findOneForAdmin(id);
        return this.prisma.song.update({ where: { id }, data: updateSongDto, select: PUBLIC_SONG_SELECT });
    }
    async remove(id) {
        const song = await this.findOneForAdmin(id);
        if (song.isActive) {
            await this.prisma.song.update({ where: { id }, data: { isActive: false } });
            return { message: 'Canción desactivada', id, deleted: false };
        }
        else {
            await this.prisma.queueItem.deleteMany({ where: { songId: id } });
            await this.prisma.song.delete({ where: { id } });
            return { message: 'Canción eliminada permanentemente', id, deleted: true };
        }
    }
    async updateCoverImage(id, buffer, mimeType) {
        await this.findOneForAdmin(id);
        return this.prisma.song.update({
            where: { id },
            data: { coverImage: buffer, coverMimeType: mimeType },
            select: PUBLIC_SONG_SELECT,
        });
    }
    async removeCoverImage(id) {
        await this.findOneForAdmin(id);
        return this.prisma.song.update({
            where: { id },
            data: { coverImage: null, coverMimeType: null },
            select: PUBLIC_SONG_SELECT,
        });
    }
    async findCoverImage(id) {
        const song = await this.prisma.song.findUnique({
            where: { id },
            select: { coverImage: true, coverMimeType: true },
        });
        if (!song)
            throw new common_1.NotFoundException('Canción no encontrada');
        return song;
    }
    async updateDemoAudio(id, buffer, mimeType) {
        await this.findOneForAdmin(id);
        return this.prisma.song.update({
            where: { id },
            data: { demoAudio: buffer, demoMimeType: mimeType },
            select: PUBLIC_SONG_SELECT,
        });
    }
    async updateFullAudio(id, buffer, mimeType) {
        await this.findOneForAdmin(id);
        return this.prisma.song.update({
            where: { id },
            data: { fullAudio: buffer, fullMimeType: mimeType },
            select: PUBLIC_SONG_SELECT,
        });
    }
    async findAudio(id, type) {
        const select = type === 'demo'
            ? { demoAudio: true, demoMimeType: true }
            : { fullAudio: true, fullMimeType: true };
        const song = await this.prisma.song.findUnique({ where: { id }, select });
        if (!song)
            throw new common_1.NotFoundException('Canción no encontrada');
        return song;
    }
    async findOneForAdmin(id) {
        const song = await this.prisma.song.findUnique({ where: { id }, select: { id: true, isActive: true } });
        if (!song)
            throw new common_1.NotFoundException('Canción no encontrada');
        return song;
    }
};
exports.SongsService = SongsService;
exports.SongsService = SongsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SongsService);
//# sourceMappingURL=songs.service.js.map