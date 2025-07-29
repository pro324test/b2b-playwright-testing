import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { Prisma } from '@prisma/client';
import { CouponQueryHelper } from './coupon-query-oprations';

/**
 * Helper class for coupon creation operations
 * Handles database operations for creating and updating coupons
 */
export class CouponCreationHelper {
  /**
   * Create a new coupon
   */
  static async createCoupon(
    prisma: PrismaService | Prisma.TransactionClient,
    createCouponDto: CreateCouponDto,
    creatorId: number,
    creatorRole: string,
    vendorId?: number
  ) {
    const { 
      // Change this line to match the property name in your DTO
      applicableCategoryIds = [],
      applicableProductIds = [], // This might need to be renamed to match your DTO
      shopIds = [], // New field for multiple shops
      onBehalfOfVendorId,
      ...couponData 
    } = createCouponDto;

    // Use transaction to create coupon with relationships
    if ('$transaction' in prisma) {
      // If prisma is a PrismaService instance (not in transaction)
      return prisma.$transaction(async (tx) => {
        return this.createCouponWithRelations(
          tx, 
          couponData, 
          applicableProductIds, 
          applicableCategoryIds,
          creatorId,
          creatorRole,
          vendorId
        );
      });
    } else {
      // If prisma is already a transaction client
      return this.createCouponWithRelations(
        prisma, 
        couponData, 
        applicableProductIds, 
        applicableCategoryIds,
        creatorId,
        creatorRole,
        vendorId
      );
    }
  }

  /**
   * Update an existing coupon
   */
  static async updateCoupon(
    prisma: PrismaService | Prisma.TransactionClient,
    id: number,
    updateCouponDto: UpdateCouponDto,
    existingCoupon: any
  ) {
    const { 
      applicableProductIds, 
      applicableCategoryIds, 
      ...couponData 
    } = updateCouponDto;

    // Use transaction to update coupon with relationships
    if ('$transaction' in prisma) {
      // If prisma is a PrismaService instance (not in transaction)
      return prisma.$transaction(async (tx) => {
        return this.updateCouponWithRelations(
          tx, 
          id, 
          couponData, 
          applicableProductIds, 
          applicableCategoryIds
        );
      });
    } else {
      // If prisma is already a transaction client
      return this.updateCouponWithRelations(
        prisma, 
        id, 
        couponData, 
        applicableProductIds, 
        applicableCategoryIds
      );
    }
  }

  /**
   * Internal helper to create coupon with relations
   * @private
   */
  private static async createCouponWithRelations(
    tx: Prisma.TransactionClient,
    couponData: any,
    applicableProductIds: number[],
    applicableCategoryIds: number[],
    creatorId: number,
    creatorRole: string,
    vendorId?: number
  ) {
    // Create base coupon
    const coupon = await tx.coupon.create({
      data: {
        code: couponData.code,
        type: couponData.type,
        value: couponData.value,
        minOrderAmount: couponData.minOrderAmount,
        maxDiscountAmount: couponData.maxDiscountAmount,
        startDate: couponData.startDate,
        endDate: couponData.endDate,
        usageLimit: couponData.usageLimit,
        perUserLimit: couponData.perUserLimit,
        status: couponData.status || 'enabled',
        description: couponData.description,
        creatorId, // Store who created the coupon
        creatorType: creatorRole, // Store creator role (admin/vendor)
        // Properly use Prisma relations for vendor
        ...(vendorId ? {
          vendor: {
            connect: { id: vendorId }
          }
        } : {}),
        // Use relation for shop connection if provided
        ...(couponData.shopId ? {
          shop: {
            connect: { id: couponData.shopId }
          }
        } : {})
      }
    });

    // Connect applicable products if any
    if (applicableProductIds.length > 0) {
      await tx.coupon.update({
        where: { id: coupon.id },
        data: {
          applicableProducts: {
            connect: applicableProductIds.map(id => ({ id }))
          }
        }
      });
    }

    // Connect applicable categories if any
    if (applicableCategoryIds.length > 0) {
      await tx.coupon.update({
        where: { id: coupon.id },
        data: {
          applicableCategories: {
            connect: applicableCategoryIds.map(id => ({ id }))
          }
        }
      });
    }

    // Return the created coupon with relations
    return CouponQueryHelper.findOne(tx as any, coupon.id);
  }

  /**
   * Internal helper to update coupon with relations
   * @private
   */
  private static async updateCouponWithRelations(
    tx: Prisma.TransactionClient,
    id: number,
    couponData: any,
    applicableProductIds?: number[],
    applicableCategoryIds?: number[]
  ) {
    // Update base coupon properties
    let updatedCoupon = await tx.coupon.update({
      where: { id },
      data: {
        ...(couponData.code !== undefined && { code: couponData.code }),
        ...(couponData.type !== undefined && { type: couponData.type }),
        ...(couponData.value !== undefined && { value: couponData.value }),
        ...(couponData.minOrderAmount !== undefined && { minOrderAmount: couponData.minOrderAmount }),
        ...(couponData.maxDiscountAmount !== undefined && { maxDiscountAmount: couponData.maxDiscountAmount }),
        ...(couponData.startDate !== undefined && { startDate: couponData.startDate }),
        ...(couponData.endDate !== undefined && { endDate: couponData.endDate }),
        ...(couponData.usageLimit !== undefined && { usageLimit: couponData.usageLimit }),
        ...(couponData.perUserLimit !== undefined && { perUserLimit: couponData.perUserLimit }),
        ...(couponData.status !== undefined && { status: couponData.status }),
        ...(couponData.description !== undefined && { description: couponData.description }),
        // Use relation for shop connection
        ...(couponData.shopId ? {
          shop: {
            connect: { id: couponData.shopId }
          }
        } : {})
      }
    });

    // Update applicable products if provided
    if (applicableProductIds !== undefined) {
      await tx.coupon.update({
        where: { id },
        data: {
          applicableProducts: {
            set: applicableProductIds.map(id => ({ id }))
          }
        }
      });
    }

    // Update applicable categories if provided
    if (applicableCategoryIds !== undefined) {
      await tx.coupon.update({
        where: { id },
        data: {
          applicableCategories: {
            set: applicableCategoryIds.map(id => ({ id }))
          }
        }
      });
    }

    // Return the updated coupon with relations
    return CouponQueryHelper.findOne(tx as any, id);
  }
}