// src/review/shop-review.service.ts
import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewSettingsService } from './review-settings.service';
import { CreateShopReviewDto } from './dto/shop-review.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ShopReviewService {
  constructor(
    private prisma: PrismaService,
    private settingsService: ReviewSettingsService,
  ) {}

  async create(userId: number, createDto: CreateShopReviewDto) {
    const settings = await this.settingsService.getSettings();
    
    if (!settings) {
      throw new Error('Review settings not found');
    }

    // Validate based on settings
    if (settings.requireRating && !createDto.rating) {
      throw new BadRequestException('Rating is required');
    }

    if (settings.requireText && !createDto.content) {
      throw new BadRequestException('Review content is required');
    }

    // If both rating and content are missing, we can't create a review
    if (!createDto.rating && !createDto.content) {
      throw new BadRequestException('Either rating or review content is required');
    }

    // Check if media is enabled
    if (!settings.mediaEnabled && createDto.mediaUrls && createDto.mediaUrls.length > 0) {
      throw new BadRequestException('Media uploads are not enabled');
    }

    // Check media count limit
    if (createDto.mediaUrls && createDto.mediaUrls.length > settings.maxImagesPerReview) {
      throw new BadRequestException(`Maximum of ${settings.maxImagesPerReview} images allowed`);
    }

    // Check if shop exists
    const shop = await this.prisma.shop.findUnique({
      where: { id: createDto.shopId },
    });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${createDto.shopId} not found`);
    }

    // Check if shop is enabled
    if (shop.status !== 'enabled') {
      throw new BadRequestException('Can only review active shops');
    }

    // Check for purchase verification if required
    let isVerifiedPurchase = false;
    let orderData = {};

    if (settings.requirePurchaseVerification) {
      const order = await this.prisma.order.findFirst({
        where: {
          userId,
          status: 'delivered', // Only count completed orders
          shopId: createDto.shopId,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!order) {
        throw new BadRequestException(
          'You must make a purchase from this shop before reviewing it'
        );
      }

      isVerifiedPurchase = true;
      if (order.id) {
        orderData = { order: { connect: { id: order.id } } };
      }
    } else {
      // Even if not required, check if they did purchase for the badge
      const order = await this.prisma.order.findFirst({
        where: {
          userId,
          status: 'delivered',
          shopId: createDto.shopId,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (order && order.id) {
        isVerifiedPurchase = true;
        orderData = { order: { connect: { id: order.id } } };
      }
    }

    // Determine review status based on settings
    let status = settings.defaultStatus;

    if (settings.moderationEnabled) {
      if (settings.autoApproveVerifiedOnly && isVerifiedPurchase) {
        status = 'approved';
      } else if (settings.moderateNegativeOnly && createDto.rating) {
        // Only moderate negative reviews
        status = createDto.rating >= settings.negativeBelowRating ? 'approved' : 'pending';
      } else {
        status = 'pending';
      }
    }
    
    // Prepare images data if provided
    const imagesData = createDto.mediaUrls && createDto.mediaUrls.length > 0
      ? {
          images: {
            create: createDto.mediaUrls.map(url => ({
              imageUrl: url,
            }))
          }
        }
      : {};

    // Create the review
    return this.prisma.shopReview.create({
      data: {
        shop: { connect: { id: createDto.shopId } },
        user: { connect: { id: userId } },
        ...orderData,
        rating: createDto.rating,
        title: createDto.title,
        content: createDto.content,
        isVerifiedPurchase,
        status,
        ...imagesData,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        images: true,
      },
    });
  }

  async findAll(shopId: number, options?: PaginationDto) {
    // Default pagination values
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    // Only show approved reviews to regular users
    const [reviews, totalCount] = await Promise.all([
      this.prisma.shopReview.findMany({
        where: {
          shopId,
          status: 'approved',
        },
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
          images: true, // Include review images in the response
        },
      }),
      this.prisma.shopReview.count({
        where: {
          shopId,
          status: 'approved',
        },
      }),
    ]);

    // Calculate average rating
    const allRatings = await this.prisma.shopReview.findMany({
      where: {
        shopId,
        status: 'approved',
        rating: { not: null },
      },
      select: { rating: true },
    });
    
    const avgRating = allRatings.length > 0
      ? allRatings.reduce((sum, item) => sum + (item.rating || 0), 0) / allRatings.length
      : 0;

    // Rating distribution
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    allRatings.forEach(r => {
      const rating = r.rating;
      if (rating !== null && rating >= 1 && rating <= 5) {
        distribution[rating as 1 | 2 | 3 | 4 | 5]++;
      }
    });

    return {
      reviews,
      meta: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        avgRating,
        ratingCount: allRatings.length,
        distribution,
      },
    };
  }

  async findOne(id: number, userId?: number) {    const review = await this.prisma.shopReview.findUnique({
      where: { id },
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
                userId: true,
              }
            }
          }
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
        images: true, // Include images in the response
      },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // For public access (no userId provided), only show approved reviews
    if (!userId && review.status !== 'approved') {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // If userId is provided, check if this user has access to this review
    // (user's own review, admin, or the vendor of this shop)
    if (
      userId && 
      review.status !== 'approved' && 
      review.userId !== userId
    ) {
      // Check if user is admin or vendor owner
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      
      const isVendor = review.shop?.vendor?.userId === userId;
      const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

      if (!isVendor && !isAdmin) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }
    }

    return review;
  }

  async update(id: number, userId: number, content: string, imageUrls: string[] = [], deleteImageIds?: number[]) {
    const review = await this.prisma.shopReview.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // Only allow the original author to update the review
    if (review.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this review');
    }

    // Check if we should update media URLs
    const settings = await this.settingsService.getSettings();
    let status = review.status;

    // If review was approved, updating it should set it back to pending
    // depending on moderation settings
    if (settings && settings.moderationEnabled && status === 'approved') {
      status = 'pending';
    }
    
    // Delete specified images if any
    if (deleteImageIds && deleteImageIds.length > 0) {
      await this.prisma.reviewImage.deleteMany({
        where: {
          id: { in: deleteImageIds },
          shopReviewId: id
        }
      });
    }

    // Check if media is enabled if images are being uploaded
    if (imageUrls && imageUrls.length > 0) {
      if (!settings.mediaEnabled) {
        throw new BadRequestException('Media uploads are not enabled');
      }
      
      // Check media count limit
      const currentImageCount = await this.prisma.reviewImage.count({
        where: { shopReviewId: id }
      });
      
      if (currentImageCount + imageUrls.length > settings.maxImagesPerReview) {
        throw new BadRequestException(`Maximum of ${settings.maxImagesPerReview} images allowed. You currently have ${currentImageCount} images.`);
      }
      
      // Add new images
      await Promise.all(imageUrls.map(imageUrl => 
        this.prisma.reviewImage.create({
          data: {
            imageUrl,
            shopReview: { connect: { id } }
          }
        })
      ));
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    // Only update content if provided
    if (content !== undefined) {
      updateData.content = content;
    }

    return this.prisma.shopReview.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        images: true,
      },
    });
  }

  async addReply(reviewId: number, userId: number, content: string) {
    // Check if review exists
    const review = await this.prisma.shopReview.findUnique({
      where: { id: reviewId },
      include: {
        shop: {
          select: {
            vendor: {
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // Check user permissions - user can be the original reviewer, admin, or vendor
    const user = await this.prisma.user.findUnique({ 
      where: { id: userId },
      select: { role: true }
    });

    const isVendor = review.shop?.vendor?.userId === userId;
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const isOriginalReviewer = review.userId === userId;

    if (!isVendor && !isAdmin && !isOriginalReviewer) {
      throw new ForbiddenException('You do not have permission to reply to this review');
    }

    // Create the reply - removing explicit null setting
    return this.prisma.reviewReply.create({
      data: {
        shopReview: { connect: { id: reviewId } },
        user: { connect: { id: userId } },
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });
  }

  async markAsHelpful(id: number, userId: number) {
    // Check if review exists and is approved
    const review = await this.prisma.shopReview.findFirst({
      where: { 
        id,
        status: 'approved',
      },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    
    // Simple implementation - just increment the helpful count
    // In a more complex system, you would track which users marked which reviews as helpful
    return this.prisma.shopReview.update({
      where: { id },
      data: {
        helpfulVotes: {
          increment: 1,
        },
      },
    });
  }

  async delete(id: number, userId: number) {
    const review = await this.prisma.shopReview.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            vendor: {
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // Check permissions - only the original reviewer, admin, or shop vendor can delete
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isVendor = review.shop?.vendor?.userId === userId;
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const isOriginalReviewer = review.userId === userId;

    if (!isOriginalReviewer && !isAdmin && !isVendor) {
      throw new ForbiddenException('You do not have permission to delete this review');
    }

    await this.prisma.shopReview.delete({
      where: { id },
    });

    return { success: true, message: 'Shop review deleted successfully' };
  }

  // Admin methods
  async findAllForModeration(options?: PaginationDto) {
    // Default pagination values
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [reviews, totalCount] = await Promise.all([
      this.prisma.shopReview.findMany({
        where: {
          status: 'pending',
        },
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
                    select: {
                      username: true
                    }
                  }
                }
              }
            },
          },
        },
      }),
      this.prisma.shopReview.count({
        where: {
          status: 'pending',
        },
      }),
    ]);

    return {
      reviews,
      meta: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async approveReview(id: number, adminUserId: number) {
    // Verify admin status
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });

    if (admin?.role !== 'admin' && admin?.role !== 'superadmin') {
      throw new ForbiddenException('Only admins can approve reviews');
    }

    const review = await this.prisma.shopReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return this.prisma.shopReview.update({
      where: { id },
      data: {
        status: 'approved',
      },
    });
  }

  async rejectReview(id: number, adminUserId: number) {
    // Verify admin status
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });

    if (admin?.role !== 'admin' && admin?.role !== 'superadmin') {
      throw new ForbiddenException('Only admins can reject reviews');
    }

    const review = await this.prisma.shopReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return this.prisma.shopReview.update({
      where: { id },
      data: {
        status: 'rejected',
      },
    });
  }

  // Shop statistics
  async getShopReviewStats(shopId: number) {
    // Verify shop exists
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${shopId} not found`);
    }

    // Get all approved ratings
    const ratings = await this.prisma.shopReview.findMany({
      where: {
        shopId,
        status: 'approved',
        rating: { not: null }, // This already filters out null ratings
      },
      select: { rating: true },
    });

    // Calculate stats
    const totalReviews = ratings.length;
    
    const avgRating = totalReviews > 0
      ? ratings.reduce((sum, item) => sum + (item.rating || 0), 0) / totalReviews
      : 0;

    // Distribution
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    ratings.forEach(r => {
      const rating = r.rating;
      if (rating !== null && rating >= 1 && rating <= 5) {
        distribution[rating as 1 | 2 | 3 | 4 | 5]++;
      }
    });

    return {
      shopId,
      totalReviews,
      avgRating,
      distribution,
    };
  }
}