import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
  
  /**
   * Cleans the database for testing
   * Only works in test environment to prevent accidental data loss
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'test') {
      // Models ordered to respect foreign key constraints
      const models = [
        'CouponUsage',
        'InventoryReservation',
        'OrderItem',
        'Payment',
        'Order',
        'CartItem',
        'Cart',
        'ShopCity',
        'ProductCity',
        'UserAddress',
        'ShopAddress',
        'ProductReview',
        'ShopReview',
        'ReviewReply',
        'Message',
        'Chat',
        'ProductImage',
        'ProductVariant',
        'Inventory',
        'Coupon',
        'BogoRule',
        'Promotion',
        'Product',
        'Banner',
        'Shop',
        'MoamalatCredential',
        'VendorRequest',
        'Vendor',
        'PriceRule',
        'Admin',
        'User'
      ];

      for (const model of models) {
        try {
          await this.$executeRawUnsafe(`TRUNCATE TABLE "${model}" CASCADE;`);
        } catch (error) {
          console.error(`Failed to truncate ${model}:`, error);
        }
      }
    }
  }
}