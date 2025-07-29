// filepath: src/auth/auth.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { AdminModule } from '../admin/admin.module'; 
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { PassportSerializer } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { OtpModule } from '../otp/otp.module'; // Add this
import { SmsModule } from '../sms/sms.module'; // Add this

@Module({
  imports: [
    UserModule,
    forwardRef(() => AdminModule),
    PassportModule,
    OtpModule, // Add OTP module
    SmsModule, // Add SMS module
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    TokenBlacklistService,
    {
      provide: 'PassportSerializer',
      useFactory: (userService: UserService) => {
        return new (class extends PassportSerializer {
          serializeUser(user: any, done: Function) {
            done(null, user.id);
          }

          async deserializeUser(id: any, done: Function) {
            const user = await userService.findOneById(id);
            done(null, user);
          }
        })();
      },
      inject: [UserService],
    },
  ],
  controllers: [AuthController],
  exports: [AuthService, TokenBlacklistService],
})
export class AuthModule {}