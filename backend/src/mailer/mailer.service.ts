import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { promises as dns } from 'dns';

const GMAIL_HOST = 'smtp.gmail.com';
// 587 (STARTTLS) en vez de 465 (TLS implícito): algunos hostings gratuitos
// (Render incluido) bloquean/filtran 465 mientras dejan pasar 587.
const GMAIL_PORT = 587;

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly user: string;
  private readonly pass: string;
  private readonly from: string;
  private cachedIp: string | null = null;

  constructor(private readonly configService: ConfigService) {
    this.user = this.configService.get<string>('SMTP_USER') || '';
    this.pass = this.configService.get<string>('SMTP_PASS') || '';
    this.from = this.configService.get<string>('SMTP_FROM') || this.user || 'noreply@takiplay.com';
  }

  // nodemailer NO reenvía la opción `family` al socket subyacente (confirmado en su
  // código fuente: smtp-connection/index.js solo copia host/port/localAddress/tls).
  // Por eso resolvemos la IPv4 nosotros mismos y se la pasamos como `host` literal:
  // así el socket nunca intenta la ruta IPv6 que Render no puede alcanzar (ENETUNREACH).
  private async resolveIp(forceRefresh = false): Promise<string> {
    if (this.cachedIp && !forceRefresh) return this.cachedIp;
    const { address } = await dns.lookup(GMAIL_HOST, { family: 4 });
    this.cachedIp = address;
    this.logger.log(`Resuelto ${GMAIL_HOST} -> ${address} (IPv4)`);
    return address;
  }

  private buildTransporter(host: string): nodemailer.Transporter {
    return nodemailer.createTransport({
      host,
      port: GMAIL_PORT,
      secure: false, // STARTTLS: empieza en texto plano y sube a TLS con el comando STARTTLS
      requireTLS: true, // nunca enviar credenciales si el STARTTLS falla
      auth: { user: this.user, pass: this.pass },
      tls: { servername: GMAIL_HOST },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
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
    } catch (err) {
      // La IP cacheada pudo quedar obsoleta (Google rota IPs de smtp.gmail.com);
      // reintentar una vez con una resolución fresca antes de darnos por vencidos.
      this.logger.warn(`Primer intento de envío falló (${err.message}), reintentando con IP fresca`);
      const freshIp = await this.resolveIp(true);
      await this.buildTransporter(freshIp).sendMail(mail);
    }

    this.logger.log(`Correo de recuperación enviado a ${to}`);
  }
}
