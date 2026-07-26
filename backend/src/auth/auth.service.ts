import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
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

  async forgotPassword(dto: ForgotPasswordDto) {
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

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const resetLink = `${frontendUrl}/dj/reset-password?token=${rawToken}`;

    await this.mailerService.sendPasswordResetEmail(admin.email, resetLink);

    return genericResponse;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const hashedToken = crypto.createHash('sha256').update(dto.token).digest('hex');

    const admin = await this.prisma.admin.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!admin) {
      throw new BadRequestException('El enlace es inválido o ha expirado');
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
}
