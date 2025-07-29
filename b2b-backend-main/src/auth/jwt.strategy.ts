// filepath: src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AdminService } from '../admin/admin.service';
import { UserService } from '../user/user.service';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private adminService: AdminService,
    private userService: UserService,
    private tokenBlacklistService: TokenBlacklistService,
    private configService: ConfigService,
  ) {
    // Provide a fallback value to ensure secretOrKey is never undefined
    const secretKey = configService.get<string>('JWT_SECRET') || 'fallback_secret_for_development_only';
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
  }

  async validate(payload: any) {
    // Check for admin first
    const admin = await this.adminService.findOne(payload.username);
    if (admin) {
      return {
        userId: admin.id,
        adminId: admin.id,
        username: admin.username,
        role: admin.role
      };
    }

    // Then check for regular user
    const user = await this.userService.findOne(payload.username);
    if (user) {
      return {
        userId: user.id,
        username: user.username,
        role: user.role
      };
    }

    throw new UnauthorizedException('User not found');
  }
}