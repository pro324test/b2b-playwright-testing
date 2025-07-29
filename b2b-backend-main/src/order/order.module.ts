// src/order/order.module.ts
import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { InventoryModule } from '../inventory/inventory.module';
import { ProductModule } from '../product/product.module';
import { CouponModule } from '../coupon/coupon.module'; // Add this import
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    InventoryModule,
    ProductModule,
    CouponModule, // Add this module
    AuthModule, // Ensure AuthModule is imported if needed for authentication
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}