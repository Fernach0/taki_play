import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
export declare class SessionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    join(createSessionDto: CreateSessionDto): Promise<{
        sessionId: string;
        tableId: string;
        tableNumber: number;
        clientName: string;
        createdAt: Date;
    }>;
    findOne(id: string): Promise<{
        sessionId: string;
        tableId: string;
        tableNumber: number;
        clientName: string;
        createdAt: Date;
    }>;
}
