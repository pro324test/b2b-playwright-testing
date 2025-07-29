import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { TokenBlacklistService } from '../../auth/token-blacklist.service';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private tokenBlacklistService: TokenBlacklistService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = client.handshake.auth.token;

    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      if (this.tokenBlacklistService.has(token)) {
        throw new WsException('Token has been revoked');
      }

      const payload = this.jwtService.verify(token);
      client.handshake.auth.userId = payload.sub;
      return true;
    } catch (error) {
      throw new WsException('Invalid token');
    }
  }
}