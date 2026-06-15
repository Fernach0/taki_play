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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SongsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const songs_service_1 = require("./songs.service");
const create_song_dto_1 = require("./dto/create-song.dto");
const update_song_dto_1 = require("./dto/update-song.dto");
const filter_songs_dto_1 = require("./dto/filter-songs.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const audioFilter = (_req, file, cb) => {
    if (!file.mimetype.match(/audio\/(mpeg|mp3|wav|ogg|mp4|aac)/)) {
        return cb(new common_1.BadRequestException('Solo se permiten archivos de audio (mp3, wav, ogg)'), false);
    }
    cb(null, true);
};
const imageFilter = (_req, file, cb) => {
    if (!file.mimetype.match(/image\/(jpg|jpeg|png|gif|webp)/)) {
        return cb(new common_1.BadRequestException('Solo se permiten imágenes (jpg, png, gif, webp)'), false);
    }
    cb(null, true);
};
let SongsController = class SongsController {
    constructor(songsService) {
        this.songsService = songsService;
    }
    findAll(filters) {
        return this.songsService.findAll(filters);
    }
    findOne(id) {
        return this.songsService.findOne(id);
    }
    async getCover(id, res) {
        const song = await this.songsService.findCoverImage(id);
        if (!song.coverImage)
            throw new common_1.NotFoundException('Esta canción no tiene imagen');
        res.setHeader('Content-Type', song.coverMimeType ?? 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.send(song.coverImage);
    }
    async getDemo(id, res) {
        const song = await this.songsService.findAudio(id, 'demo');
        if (!('demoAudio' in song) || !song.demoAudio)
            throw new common_1.NotFoundException('Esta canción no tiene demo');
        res.setHeader('Content-Type', song.demoMimeType ?? 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.send(song.demoAudio);
    }
    async getFull(id, res) {
        const song = await this.songsService.findAudio(id, 'full');
        if (!('fullAudio' in song) || !song.fullAudio)
            throw new common_1.NotFoundException('Esta canción no tiene audio completo');
        res.setHeader('Content-Type', song.fullMimeType ?? 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.send(song.fullAudio);
    }
    create(createSongDto) {
        return this.songsService.create(createSongDto);
    }
    update(id, updateSongDto) {
        return this.songsService.update(id, updateSongDto);
    }
    remove(id) {
        return this.songsService.remove(id);
    }
    async removeCover(id) {
        return this.songsService.removeCoverImage(id);
    }
    async uploadCover(id, file) {
        if (!file)
            throw new common_1.BadRequestException('No se recibió ningún archivo');
        return this.songsService.updateCoverImage(id, file.buffer, file.mimetype);
    }
    async uploadDemo(id, file) {
        if (!file)
            throw new common_1.BadRequestException('No se recibió ningún archivo');
        return this.songsService.updateDemoAudio(id, file.buffer, file.mimetype);
    }
    async uploadFull(id, file) {
        if (!file)
            throw new common_1.BadRequestException('No se recibió ningún archivo');
        return this.songsService.updateFullAudio(id, file.buffer, file.mimetype);
    }
};
exports.SongsController = SongsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_songs_dto_1.FilterSongsDto]),
    __metadata("design:returntype", void 0)
], SongsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SongsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/cover'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SongsController.prototype, "getCover", null);
__decorate([
    (0, common_1.Get)(':id/demo'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SongsController.prototype, "getDemo", null);
__decorate([
    (0, common_1.Get)(':id/full'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SongsController.prototype, "getFull", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_song_dto_1.CreateSongDto]),
    __metadata("design:returntype", void 0)
], SongsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_song_dto_1.UpdateSongDto]),
    __metadata("design:returntype", void 0)
], SongsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SongsController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id/cover'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SongsController.prototype, "removeCover", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/cover'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('cover', { storage: (0, multer_1.memoryStorage)(), fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SongsController.prototype, "uploadCover", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/demo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('demo', { storage: (0, multer_1.memoryStorage)(), fileFilter: audioFilter, limits: { fileSize: 20 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SongsController.prototype, "uploadDemo", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/full'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('full', { storage: (0, multer_1.memoryStorage)(), fileFilter: audioFilter, limits: { fileSize: 50 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SongsController.prototype, "uploadFull", null);
exports.SongsController = SongsController = __decorate([
    (0, common_1.Controller)('songs'),
    __metadata("design:paramtypes", [songs_service_1.SongsService])
], SongsController);
//# sourceMappingURL=songs.controller.js.map