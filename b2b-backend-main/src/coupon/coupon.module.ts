// src/coupon/coupon.module.ts
import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService]
})
export class CouponModule {}