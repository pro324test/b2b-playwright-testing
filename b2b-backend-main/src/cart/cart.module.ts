import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { InventoryModule } from '../inventory/inventory.module';
import { OrderModule } from '../order/order.module';
import { ProductModule } from '../product/product.module';
import { PriceRuleModule } from '../price-rule/price-rule.module';
import { CouponModule } from '../coupon/coupon.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    InventoryModule,
    OrderModule,
    ProductModule,
    PriceRuleModule,
    CouponModule,
  ],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}