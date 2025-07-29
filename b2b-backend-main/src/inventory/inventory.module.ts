import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryCleanupService } from './inventory-cleanup.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductModule } from '../product/product.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ProductModule,
    ScheduleModule.forRoot(),
  ],
  providers: [InventoryService, InventoryCleanupService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}