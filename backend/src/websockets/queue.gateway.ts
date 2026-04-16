import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(QueueGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('join-table')
  handleJoinTable(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tableId: string },
  ) {
    client.join(data.tableId);
    this.logger.log(`Socket ${client.id} unido a mesa: ${data.tableId}`);
    return { event: 'joined', tableId: data.tableId };
  }

  @SubscribeMessage('leave-table')
  handleLeaveTable(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tableId: string },
  ) {
    client.leave(data.tableId);
    this.logger.log(`Socket ${client.id} salió de mesa: ${data.tableId}`);
  }

  emitQueueUpdate(tableId: string, queue: any[]) {
    this.server.to(tableId).emit('queue:updated', { tableId, queue });
  }

  emitNowPlaying(tableId: string, song: any) {
    this.server.to(tableId).emit('queue:now-playing', { tableId, currentSong: song });
  }
}
