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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const mailer_service_1 = require("../mailer/mailer.service");
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService, mailerService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailerService = mailerService;
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const admin = await this.prisma.admin.findUnique({ where: { email } });
        if (!admin) {
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        }
        const passwordValid = await bcrypt.compare(password, admin.passwordHash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        }
        const payload = { sub: admin.id, email: admin.email };
        const access_token = this.jwtService.sign(payload);
        return {
            access_token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
            },
        };
    }
    async forgotPassword(dto) {
        const genericResponse = {
            message: 'Si el correo existe, te enviamos un enlace para restablecer tu contraseña.',
        };
        const admin = await this.prisma.admin.findUnique({ where: { email: dto.email } });
        if (!admin) {
            return genericResponse;
        }
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        await this.prisma.admin.update({
            where: { id: admin.id },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
            },
        });
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3001';
        const resetLink = `${frontendUrl}/dj/reset-password?token=${rawToken}`;
        this.mailerService.sendPasswordResetEmail(admin.email, resetLink).catch((err) => {
            console.error(`Error enviando correo de recuperación a ${admin.email}:`, err.message);
        });
        return genericResponse;
    }
    async resetPassword(dto) {
        const hashedToken = crypto.createHash('sha256').update(dto.token).digest('hex');
        const admin = await this.prisma.admin.findFirst({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { gt: new Date() },
            },
        });
        if (!admin) {
            throw new common_1.BadRequestException('El enlace es inválido o ha expirado');
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.admin.update({
            where: { id: admin.id },
            data: {
                passwordHash,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });
        return { message: 'Contraseña actualizada correctamente' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mailer_service_1.MailerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map