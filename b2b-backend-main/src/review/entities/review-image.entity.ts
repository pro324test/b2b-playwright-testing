// src/review/entities/review-image.entity.ts
import { ProductReview, ShopReview } from '@prisma/client';

export class ReviewImage {
  id: number;
  imageUrl: string;
  createdAt: Date;
  
  // Relations - one of these will be set
  productReview?: ProductReview;
  productReviewId?: number;
  shopReview?: ShopReview;
  shopReviewId?: number;
}
