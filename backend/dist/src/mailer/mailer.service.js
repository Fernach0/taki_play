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
var MailerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const dns_1 = require("dns");
const GMAIL_HOST = 'smtp.gmail.com';
const GMAIL_PORT = 465;
let MailerService = MailerService_1 = class MailerService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MailerService_1.name);
        this.cachedIp = null;
        this.user = this.configService.get('SMTP_USER') || '';
        this.pass = this.configService.get('SMTP_PASS') || '';
        this.from = this.configService.get('SMTP_FROM') || this.user || 'noreply@takiplay.com';
    }
    async resolveIp(forceRefresh = false) {
        if (this.cachedIp && !forceRefresh)
            return this.cachedIp;
        const { address } = await dns_1.promises.lookup(GMAIL_HOST, { family: 4 });
        this.cachedIp = address;
        this.logger.log(`Resuelto ${GMAIL_HOST} -> ${address} (IPv4)`);
        return address;
    }
    buildTransporter(host) {
        return nodemailer.createTransport({
            host,
            port: GMAIL_PORT,
            secure: true,
            auth: { user: this.user, pass: this.pass },
            tls: { servername: GMAIL_HOST },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 20000,
        });
    }
    async sendPasswordResetEmail(to, resetLink) {
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #2b2b2b;">
        <h2 style="color: #b8860b;">Taki Play — Recuperación de contraseña</h2>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de DJ.</p>
        <p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 20px; background: #b8860b; color: #fff; text-decoration: none; border-radius: 8px;">
            Restablecer contraseña
          </a>
        </p>
        <p>Este enlace expira en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo.</p>
      </div>
    `;
        const mail = {
            from: `"Taki Play" <${this.from}>`,
            to,
            subject: 'Recupera tu contraseña — Taki Play',
            html,
        };
        try {
            const ip = await this.resolveIp();
            await this.buildTransporter(ip).sendMail(mail);
        }
        catch (err) {
            this.logger.warn(`Primer intento de envío falló (${err.message}), reintentando con IP fresca`);
            const freshIp = await this.resolveIp(true);
            await this.buildTransporter(freshIp).sendMail(mail);
        }
        this.logger.log(`Correo de recuperación enviado a ${to}`);
    }
};
exports.MailerService = MailerService;
exports.MailerService = MailerService = MailerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailerService);
//# sourceMappingURL=mailer.service.js.map