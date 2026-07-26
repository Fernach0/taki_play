import { ConfigService } from '@nestjs/config';
export declare class MailerService {
    private readonly configService;
    private readonly logger;
    private readonly user;
    private readonly pass;
    private readonly from;
    private cachedIp;
    constructor(configService: ConfigService);
    private resolveIp;
    private buildTransporter;
    sendPasswordResetEmail(to: string, resetLink: string): Promise<void>;
}
