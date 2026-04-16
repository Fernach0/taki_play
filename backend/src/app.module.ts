import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { TablesModule } from './tables/tables.module';
import { SongsModule } from './songs/songs.module';
import { QueueModule } from './queue/queue.module';
import { SessionsModule } from './sessions/sessions.module';
import { WebsocketsModule } from './websockets/websockets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AdminModule,
    TablesModule,
    SongsModule,
    QueueModule,
    SessionsModule,
    WebsocketsModule,
  ],
})
export class AppModule {}
