import { ConfigService } from '@nestjs/config';
export declare class MailerService {
    private readonly configService;
    private readonly logger;
    private readonly transporter;
    private readonly from;
    constructor(configService: ConfigService);
    sendPasswordResetEmail(to: string, resetLink: string): Promise<void>;
}
