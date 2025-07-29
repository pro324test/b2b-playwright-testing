import { Module } from '@nestjs/common';
import { PriceRuleService } from './price-rule.service';
import { PriceRuleController } from './price-rule.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],
  providers: [PriceRuleService],
  controllers: [PriceRuleController],
  exports: [PriceRuleService],
})
export class PriceRuleModule {}