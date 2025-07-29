// src/review/review-admin.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewSettingsService } from './review-settings.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateReviewSettingsDto } from './dto/review-settings.dto';

@Injectable()
export class ReviewAdminService {
  constructor(
    private prisma: PrismaService,
    private settingsService: ReviewSettingsService,
  ) {}

  // Review Settings Management
  async getReviewSettings() {
    return this.settingsService.getSettings();
  }

  async updateReviewSettings(adminUserId: number, updateDto: UpdateReviewSettingsDto) {
    // Verify admin status
    await this.verifyAdmin(adminUserId);
    return this.settingsService.updateSettings(updateDto);
  }

  // Combined Review Moderation
  async getPendingReviews(adminUserId: number, options?: PaginationDto, reviewType?: 'product' | 'shop') {
    // Verify admin status
    await this.verifyAdmin(adminUserId);

    // Default pagination values
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    if (reviewType === 'product') {
      return this.getPendingProductReviews(skip, limit);
    } else if (reviewType === 'shop') {
      return this.getPendingShopReviews(skip, limit);
    } else {
      // Get both types with pagination split evenly between them
      const halfLimit = Math.ceil(limit / 2);
      
      const [productResult, shopResult] = await Promise.all([
        this.getPendingProductReviews(skip, halfLimit),
        this.getPendingShopReviews(skip, halfLimit),
      ]);
      
      // Combine results
      return {
        data: {
          productReviews: productResult.reviews,
          shopReviews: shopResult.reviews,
        },
        meta: {
          productReviews: productResult.meta,
          shopReviews: shopResult.meta,
          totalReviews: productResult.meta.totalCount + shopResult.meta.totalCount,
        }
      };
    }
  }

  private async getPendingProductReviews(skip: number, limit: number) {
    const [reviews, totalCount] = await Promise.all([
      this.prisma.productReview.findMany({
        where: { status: 'pending' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              shop: {
                select: {
                  id: true,
                  name: true,
                  vendor: {
                    select: {
                      id: true,
                      user: {
                        select: { username: true }
                      }
                    }
                  }
                },
              },
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  role: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      this.prisma.productReview.count({
        where: { status: 'pending' },
      }),
    ]);

    return {
      reviews,
      meta: {
        totalCount,
        skip,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  private async getPendingShopReviews(skip: number, limit: number) {
    const [reviews, totalCount] = await Promise.all([
      this.prisma.shopReview.findMany({
        where: { status: 'pending' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          shop: {
            select: {
              id: true,
              name: true,
              vendor: {
                select: {
                  id: true,
                  user: {
                    select: { username: true }
                  }
                }
              }
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  role: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      this.prisma.shopReview.count({
        where: { status: 'pending' },
      }),
    ]);

    return {
      reviews,
      meta: {
        totalCount,
        skip,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async approveProductReview(adminUserId: number, reviewId: number) {
    await this.verifyAdmin(adminUserId);
    
    const review = await this.prisma.productReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Product review with ID ${reviewId} not found`);
    }

    return this.prisma.productReview.update({
      where: { id: reviewId },
      data: { status: 'approved' },
    });
  }

  async approveShopReview(adminUserId: number, reviewId: number) {
    await this.verifyAdmin(adminUserId);
    
    const review = await this.prisma.shopReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Shop review with ID ${reviewId} not found`);
    }

    return this.prisma.shopReview.update({
      where: { id: reviewId },
      data: { status: 'approved' },
    });
  }

  async rejectProductReview(adminUserId: number, reviewId: number) {
    await this.verifyAdmin(adminUserId);
    
    const review = await this.prisma.productReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Product review with ID ${reviewId} not found`);
    }

    return this.prisma.productReview.update({
      where: { id: reviewId },
      data: { status: 'rejected' },
    });
  }

  async rejectShopReview(adminUserId: number, reviewId: number) {
    await this.verifyAdmin(adminUserId);
    
    const review = await this.prisma.shopReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Shop review with ID ${reviewId} not found`);
    }

    return this.prisma.shopReview.update({
      where: { id: reviewId },
      data: { status: 'rejected' },
    });
  }

  async deleteProductReview(adminUserId: number, reviewId: number) {
    await this.verifyAdmin(adminUserId);
    
    const review = await this.prisma.productReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Product review with ID ${reviewId} not found`);
    }

    await this.prisma.productReview.delete({
      where: { id: reviewId },
    });

    return { success: true, message: 'Product review deleted successfully' };
  }

  async deleteShopReview(adminUserId: number, reviewId: number) {
    await this.verifyAdmin(adminUserId);
    
    const review = await this.prisma.shopReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Shop review with ID ${reviewId} not found`);
    }

    await this.prisma.shopReview.delete({
      where: { id: reviewId },
    });

    return { success: true, message: 'Shop review deleted successfully' };
  }

  // Review Analytics
  async getReviewStatistics(adminUserId: number) {
    await this.verifyAdmin(adminUserId);

    // Get counts for various review states
    const [
      pendingProductReviews,
      approvedProductReviews,
      rejectedProductReviews,
      pendingShopReviews,
      approvedShopReviews,
      rejectedShopReviews
    ] = await Promise.all([
      this.prisma.productReview.count({ where: { status: 'pending' } }),
      this.prisma.productReview.count({ where: { status: 'approved' } }),
      this.prisma.productReview.count({ where: { status: 'rejected' } }),
      this.prisma.shopReview.count({ where: { status: 'pending' } }),
      this.prisma.shopReview.count({ where: { status: 'approved' } }),
      this.prisma.shopReview.count({ where: { status: 'rejected' } })
    ]);

    // Calculate average ratings
    const [productRatings, shopRatings] = await Promise.all([
      this.prisma.productReview.findMany({
        where: {
          status: 'approved',
          rating: { not: null },
        },
        select: { rating: true },
      }),
      this.prisma.shopReview.findMany({
        where: {
          status: 'approved',
          rating: { not: null },
        },
        select: { rating: true },
      })
    ]);

    // Fix for TS18047 errors - handle potentially null ratings
    const productAvgRating = productRatings.length > 0
      ? productRatings.reduce((sum, item) => sum + (item.rating || 0), 0) / productRatings.length
      : 0;

    const shopAvgRating = shopRatings.length > 0
      ? shopRatings.reduce((sum, item) => sum + (item.rating || 0), 0) / shopRatings.length
      : 0;

    // Get total counts
    const totalProductReviews = pendingProductReviews + approvedProductReviews + rejectedProductReviews;
    const totalShopReviews = pendingShopReviews + approvedShopReviews + rejectedShopReviews;
    const totalReviews = totalProductReviews + totalShopReviews;

    // Calculate distributions - Fix for TS2345 errors using type assertion
    const productDistribution = this.calculateRatingDistribution(
      productRatings as unknown as { rating: number }[]
    );
    const shopDistribution = this.calculateRatingDistribution(
      shopRatings as unknown as { rating: number }[]
    );

    return {
      totalReviews,
      productReviews: {
        total: totalProductReviews,
        pending: pendingProductReviews,
        approved: approvedProductReviews,
        rejected: rejectedProductReviews,
        averageRating: productAvgRating,
        ratingDistribution: productDistribution
      },
      shopReviews: {
        total: totalShopReviews,
        pending: pendingShopReviews,
        approved: approvedShopReviews,
        rejected: rejectedShopReviews,
        averageRating: shopAvgRating,
        ratingDistribution: shopDistribution
      }
    };
  }

  // Update the calculateRatingDistribution method to handle null values
  private calculateRatingDistribution(ratings: { rating: number }[]) {
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    ratings.forEach(r => {
      const rating = r.rating;
      if (rating && rating >= 1 && rating <= 5) {
        distribution[rating as 1 | 2 | 3 | 4 | 5]++;
      }
    });

    return distribution;
  }

  // Featured Reviews Management
  async getFeaturedReviews(options?: PaginationDto) {
    // Implementation for fetching featured reviews would go here
    // This would require adding a "featured" field to the review models
  }

  // Helper method to verify admin permissions
  private async verifyAdmin(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      throw new ForbiddenException('Only admins can perform this action');
    }

    return true;
  }
}