import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { SmsModule } from '../sms/sms.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [SmsModule, PrismaModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}