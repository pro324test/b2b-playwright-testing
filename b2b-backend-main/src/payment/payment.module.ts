import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { MoamalatController } from './moamalat.controller';
import { MoamalatService } from './moamalat.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PaymentController, MoamalatController],
  providers: [PaymentService, MoamalatService],
  exports: [PaymentService, MoamalatService],
})
export class PaymentModule {}