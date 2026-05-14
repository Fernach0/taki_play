import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
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
