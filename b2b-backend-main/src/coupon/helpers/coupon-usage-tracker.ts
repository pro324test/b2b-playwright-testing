import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CouponQueryHelper } from './coupon-query-oprations';

/**
 * Helper class for coupon usage tracking
 * Handles all operations related to tracking coupon usage statistics
 */
export class CouponUsageTracker {
  /**
   * Record usage of a coupon in an order
   * Updates coupon usage count and creates usage record
   */
  static async recordCouponUsage(
    prisma: PrismaService | Prisma.TransactionClient,
    couponCode: string,
    userId: number,
    orderId: number
  ) {
    try {
      // Find the coupon by code
      const coupon = await CouponQueryHelper.findByCode(prisma, couponCode);

      // Check if this coupon has already been used for this order
      const existingUsage = await prisma.couponUsage.findFirst({
        where: {
          couponId: coupon.id,
          orderId: orderId
        }
      });

      if (existingUsage) {
        throw new BadRequestException('Coupon has already been recorded for this order');
      }

      // Use transaction to ensure atomicity if not already in a transaction
      if ('$transaction' in prisma) {
        return prisma.$transaction([
          prisma.coupon.update({
            where: { id: coupon.id },
            data: {
              usageCount: { increment: 1 }
            }
          }),
          prisma.couponUsage.create({
            data: {
              couponId: coupon.id,
              userId,
              orderId
            }
          })
        ]);
      } else {
        // Already in a transaction, just perform the operations
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: {
            usageCount: { increment: 1 }
          }
        });
        
        return prisma.couponUsage.create({
          data: {
            couponId: coupon.id,
            userId,
            orderId
          }
        });
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(`Invalid coupon code: ${couponCode}`);
      }
      throw error;
    }
  }

  /**
   * Check how many times a user has used a specific coupon
   */
  static async getUserCouponUsageCount(
    prisma: PrismaService | Prisma.TransactionClient,
    couponId: number,
    userId: number
  ) {
    return prisma.couponUsage.count({
      where: {
        couponId,
        userId
      }
    });
  }

  /**
   * Get coupon usage statistics for a specific coupon
   */
  static async getCouponUsageStats(
    prisma: PrismaService | Prisma.TransactionClient,
    couponId: number
  ) {
    const [coupon, usageByUser, totalUsers] = await Promise.all([
      // Get the coupon details
      prisma.coupon.findUnique({
        where: { id: couponId }
      }),
      
      // Get usage count per user
      prisma.couponUsage.groupBy({
        by: ['userId'],
        where: { couponId },
        _count: {
          userId: true
        }
      }),
      
      // Get count of unique users who used this coupon
      prisma.couponUsage.groupBy({
        by: ['couponId'],
        where: { couponId },
        _count: {
          userId: true
        }
      })
    ]);

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${couponId} not found`);
    }

    // Calculate statistics
    const userCount = totalUsers.length > 0 ? totalUsers[0]._count.userId : 0;
    
    // Find user with maximum usage
    let maxUsageByUser = 0;
    if (usageByUser.length > 0) {
      maxUsageByUser = Math.max(...usageByUser.map(u => u._count.userId));
    }

    return {
      couponId,
      code: coupon.code,
      totalUsage: coupon.usageCount,
      usageLimit: coupon.usageLimit,
      uniqueUserCount: userCount,
      maxUsageByUser,
      usagePercentage: coupon.usageLimit 
        ? Math.round((coupon.usageCount / coupon.usageLimit) * 100) 
        : 0
    };
  }

  /**
   * Check if a coupon has reached its usage limit
   */
  static async hasCouponReachedLimit(
    prisma: PrismaService | Prisma.TransactionClient,
    couponId: number
  ) {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      select: {
        usageLimit: true,
        usageCount: true
      }
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${couponId} not found`);
    }

    // If no usage limit set, return false
    if (!coupon.usageLimit) {
      return false;
    }

    return coupon.usageCount >= coupon.usageLimit;
  }

  /**
   * Check if a user has reached their usage limit for a coupon
   */
  static async hasUserReachedCouponLimit(
    prisma: PrismaService | Prisma.TransactionClient,
    couponId: number,
    userId: number
  ) {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      select: {
        perUserLimit: true
      }
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${couponId} not found`);
    }

    // If no per-user limit set, return false
    if (!coupon.perUserLimit) {
      return false;
    }

    const userUsageCount = await this.getUserCouponUsageCount(prisma, couponId, userId);
    return userUsageCount >= coupon.perUserLimit;
  }
  
  /**
   * Get usage history for a specific coupon
   * Returns list of orders where coupon was used with user info
   */
  static async getCouponUsageHistory(
    prisma: PrismaService | Prisma.TransactionClient,
    couponId: number,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;
    
    const [usageRecords, totalCount] = await Promise.all([
      prisma.couponUsage.findMany({
        where: { couponId },
        skip,
        take: limit,
        orderBy: { usedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,  // Changed from total to totalAmount
              createdAt: true
            }
          }
        }
      }),
      prisma.couponUsage.count({
        where: { couponId }
      })
    ]);

    return {
      data: usageRecords,
      meta: {
        totalItems: totalCount,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }
}