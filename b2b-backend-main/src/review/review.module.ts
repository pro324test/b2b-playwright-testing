import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { ProductReviewService } from './product-review.service';
import { ShopReviewService } from './shop-review.service';
import { ReviewAdminService } from './review-admin.service';
import { ReviewSettingsService } from './review-settings.service';
import { ReviewController } from './review.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CommonModule,
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads', 'reviews');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = file.originalname.split('.').pop();
          cb(null, `review-${uniqueSuffix}.${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
      },
    }),
  ],
  controllers: [
    ReviewController,
  ],
  providers: [
    ProductReviewService,
    ShopReviewService,
    ReviewAdminService,
    ReviewSettingsService,
  ],
  exports: [
    ProductReviewService,
    ShopReviewService,
    ReviewAdminService,
    ReviewSettingsService,
  ],
})
export class ReviewModule {}