import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinTable(client: Socket, data: {
        tableId: string;
    }): {
        event: string;
        tableId: string;
    };
    handleLeaveTable(client: Socket, data: {
        tableId: string;
    }): void;
    emitQueueUpdate(tableId: string, queue: any[]): void;
    emitNowPlaying(tableId: string, song: any): void;
}
