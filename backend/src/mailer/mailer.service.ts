import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    this.from = this.configService.get<string>('SMTP_FROM') || user || 'noreply@takiplay.com';

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
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

    await this.transporter.sendMail({
      from: `"Taki Play" <${this.from}>`,
      to,
      subject: 'Recupera tu contraseña — Taki Play',
      html,
    });

    this.logger.log(`Correo de recuperación enviado a ${to}`);
  }
}
