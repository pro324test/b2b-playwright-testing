import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { VendorModule } from './vendor/vendor.module';
import { ShopModule } from './shop/shop.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { AttributeModule } from './attribute/attribute.module';
import { BrandModule } from './brand/brand.module';
import { CartModule } from './cart/cart.module';
import { InventoryModule } from './inventory/inventory.module';
import { PrismaModule } from './prisma/prisma.module';
import { PriceRuleModule } from './price-rule/price-rule.module';
import { SearchModule } from './search/search.module';
import { ChatModule } from './chat/chat.module';
import { BannerModule } from './banner/banner.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { CityModule } from './city/city.module';
import { AddressModule } from './address/address.module';
import { ReviewModule } from './review/review.module';
import { ContentModule } from './content/content.module';
//import { PromotionModule } from './promotion/promotion.module';
import { CouponModule } from './coupon/coupon.module';
import { SliderModule } from './slider/slider.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
      envFilePath: ['.env', '.env.development', '.env.test'], // Priority from left to right
      cache: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    AdminModule,
    VendorModule,
    ShopModule,
    ProductModule,
    CategoryModule,
    AttributeModule,
    BrandModule,
    CartModule,
    InventoryModule,
    PriceRuleModule,
    SearchModule,
    ChatModule,
    BannerModule,
    OrderModule,
    PaymentModule,
    CityModule,
    AddressModule,
    ReviewModule,
    //PromotionModule,
    CouponModule,
    ContentModule,
    SliderModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}