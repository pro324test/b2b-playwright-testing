// import { Module } from '@nestjs/common';
// import { PromotionService } from './promotion.service';
// import { PromotionController } from './promotion.controller';
// import { PrismaModule } from '../prisma/prisma.module';
// import { AuthModule } from '../auth/auth.module';

// @Module({
//   imports: [PrismaModule, AuthModule], // Import PrismaModule for database access and AuthModule for authentication
//   controllers: [PromotionController],
//   providers: [PromotionService],
//   exports: [PromotionService] // Export the service so it can be used by other modules like CartModule
// })
// export class PromotionModule {}