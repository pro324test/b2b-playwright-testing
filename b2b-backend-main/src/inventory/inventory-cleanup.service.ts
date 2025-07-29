// src/inventory/inventory-cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from './inventory.service';
import { ProductVariantService } from '../product/product-variant.service';
import * as OrderInventory from '../order/helpers/order-inventory-operations';

@Injectable()
export class InventoryCleanupService {
  private readonly logger = new Logger(InventoryCleanupService.name);

  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
    private productVariantService: ProductVariantService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredReservations() {
    this.logger.log('Running expired inventory reservation cleanup job');
    
    try {
      const count = await OrderInventory.cleanupExpiredReservations(
        this.prisma,
        this.inventoryService,
        this.productVariantService
      );
      
      if (count > 0) {
        this.logger.log(`Released ${count} expired inventory reservations`);
      } else {
        this.logger.debug('No expired inventory reservations found');
      }
    } catch (error) {
      this.logger.error('Error cleaning up expired reservations', error.stack);
    }
  }
}