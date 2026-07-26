import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly mailerService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, mailerService: MailerService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        admin: {
            id: string;
            name: string;
            email: string;
        };
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
