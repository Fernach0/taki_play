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
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
const node_path_2 = require("node:path");
const songs_service_1 = require("./songs.service");
const create_song_dto_1 = require("./dto/create-song.dto");
const update_song_dto_1 = require("./dto/update-song.dto");
const filter_songs_dto_1 = require("./dto/filter-songs.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
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
    create(createSongDto) {
        return this.songsService.create(createSongDto);
    }
    update(id, updateSongDto) {
        return this.songsService.update(id, updateSongDto);
    }
    remove(id) {
        return this.songsService.remove(id);
    }
    uploadCover(id, file, req) {
        if (!file)
            throw new common_1.BadRequestException('No se recibió ningún archivo');
        const host = req.get('host');
        const protocol = req.headers['x-forwarded-proto'] ?? req.protocol;
        const coverUrl = `${protocol}://${host}/covers/${file.filename}`;
        return this.songsService.updateCoverUrl(id, coverUrl);
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
    (0, common_1.Post)(':id/cover'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('cover', {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => {
                const dest = (0, node_path_2.join)(process.cwd(), 'public', 'covers');
                (0, node_fs_1.mkdirSync)(dest, { recursive: true });
                cb(null, dest);
            },
            filename: (req, file, cb) => {
                const ext = (0, node_path_1.extname)(file.originalname);
                cb(null, `${req.params.id}${ext}`);
            },
        }),
        fileFilter: (_req, file, cb) => {
            if (!file.mimetype.match(/image\/(jpg|jpeg|png|gif|webp)/)) {
                return cb(new common_1.BadRequestException('Solo se permiten imágenes (jpg, png, gif, webp)'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SongsController.prototype, "uploadCover", null);
exports.SongsController = SongsController = __decorate([
    (0, common_1.Controller)('songs'),
    __metadata("design:paramtypes", [songs_service_1.SongsService])
], SongsController);
//# sourceMappingURL=songs.controller.js.map