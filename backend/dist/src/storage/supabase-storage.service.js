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
exports.SupabaseStorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let SupabaseStorageService = class SupabaseStorageService {
    constructor(config) {
        this.config = config;
        this.bucket = 'covers';
        this.supabase = (0, supabase_js_1.createClient)(config.getOrThrow('SUPABASE_URL'), config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'));
    }
    async uploadCover(songId, buffer, mimetype) {
        const ext = mimetype.split('/')[1].replace('jpeg', 'jpg');
        const filename = `${songId}.${ext}`;
        const { error } = await this.supabase.storage
            .from(this.bucket)
            .upload(filename, buffer, { contentType: mimetype, upsert: true });
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al subir imagen: ${error.message}`);
        }
        const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(filename);
        return data.publicUrl;
    }
    async deleteCover(songId) {
        const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        const files = extensions.map((ext) => `${songId}.${ext}`);
        await this.supabase.storage.from(this.bucket).remove(files);
    }
};
exports.SupabaseStorageService = SupabaseStorageService;
exports.SupabaseStorageService = SupabaseStorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SupabaseStorageService);
//# sourceMappingURL=supabase-storage.service.js.map