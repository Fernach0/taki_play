import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createAdminDto: CreateAdminDto): Promise<{
        id: string;
        email: string;
        resetPasswordToken: string | null;
        name: string;
        resetPasswordExpires: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        email: string;
        resetPasswordToken: string | null;
        name: string;
        resetPasswordExpires: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
