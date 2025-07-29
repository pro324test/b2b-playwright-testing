import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { WsJwtAuthGuard } from '../common/guards/ws-jwt-auth.guard';
import { TokenBlacklistService } from '../auth/token-blacklist.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ChatController],
  providers: [
    ChatService, 
    ChatGateway, 
    PrismaService,
    WsJwtAuthGuard,
    TokenBlacklistService
  ],
  exports: [ChatService]
})
export class ChatModule {}