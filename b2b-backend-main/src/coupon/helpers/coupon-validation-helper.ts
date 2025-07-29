import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCouponDto, CouponType } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { CouponQueryHelper } from './coupon-query-oprations';

/**
 * Helper class for coupon validation operations
 * Handles all validation logic for coupons
 */
export class CouponValidationHelper {
  /**
   * Validate input for creating a new coupon
   */
  static async validateCreateCouponInput(
    prisma: PrismaService | Prisma.TransactionClient,
    createCouponDto: CreateCouponDto,
    vendorId?: number
  ): Promise<void> {
    const { 
      code, 
      shopIds = [], 
      applicableProductIds = [], 
      applicableCategoryIds = []
    } = createCouponDto;
    
    // Check if coupon code already exists
    const codeExists = await CouponQueryHelper.codeExists(prisma, code);
    if (codeExists) {
      throw new ConflictException(`Coupon with code ${code} already exists`);
    }

    // Validate shop existence and ownership if provided
    if (shopIds.length > 0) {
      for (const shopId of shopIds) {
        await CouponValidationHelper.validateShopOwnership(prisma, shopId, vendorId);
      }
    }

    // Validate products if provided
    if (applicableProductIds.length > 0) {
      await CouponValidationHelper.validateProducts(
        prisma, 
        applicableProductIds, 
        shopIds[0], // Use the first shop ID for validation if available
        vendorId
      );
    }

    // Validate categories if provided
    if (applicableCategoryIds.length > 0) {
      await CouponValidationHelper.validateCategories(prisma, applicableCategoryIds);
    }
  }

  /**
   * Validate input for updating an existing coupon
   */
  static async validateUpdateCouponInput(
    prisma: PrismaService | Prisma.TransactionClient,
    updateCouponDto: UpdateCouponDto,
    existingCoupon: any
  ): Promise<void> {
    const { 
      code, 
      shopIds = [], 
      applicableProductIds, 
      applicableCategoryIds 
    } = updateCouponDto;

    // If code is being updated, check it doesn't conflict
    if (code && code !== existingCoupon.code) {
      const codeExists = await CouponQueryHelper.codeExists(prisma, code, existingCoupon.id);
      if (codeExists) {
        throw new ConflictException(`Coupon with code ${code} already exists`);
      }
    }

    // Validate shops if being updated
    if (shopIds && shopIds.length > 0) {
      for (const shopId of shopIds) {
        const shop = await prisma.shop.findUnique({
          where: { id: shopId }
        });

        if (!shop) {
          throw new NotFoundException(`Shop with ID ${shopId} not found`);
        }

        // If vendor ID is available on existing coupon, check ownership
        if (existingCoupon.vendorId) {
          await CouponValidationHelper.validateShopOwnership(prisma, shopId, existingCoupon.vendorId);
        }
      }
    }

    // Validate products if provided
    if (applicableProductIds && applicableProductIds.length > 0) {
      await CouponValidationHelper.validateProducts(
        prisma,
        applicableProductIds,
        shopIds[0] || (existingCoupon.shop?.id || null),
        existingCoupon.vendorId
      );
    }

    // Validate categories if provided
    if (applicableCategoryIds && applicableCategoryIds.length > 0) {
      await CouponValidationHelper.validateCategories(prisma, applicableCategoryIds);
    }
  }

  /**
   * Validate shop ownership by vendor
   */
  static async validateShopOwnership(
    prisma: PrismaService | Prisma.TransactionClient,
    shopId: number,
    vendorId?: number
  ): Promise<void> {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: { vendor: true }
    });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${shopId} not found`);
    }

    // If vendor ID is provided, ensure shop belongs to the vendor
    if (vendorId && shop.vendorId !== vendorId) {
      throw new BadRequestException('Shop does not belong to the specified vendor');
    }
  }

  /**
   * Validate products existence and ownership
   */
  static async validateProducts(
    prisma: PrismaService | Prisma.TransactionClient,
    productIds: number[],
    shopId?: number,
    vendorId?: number
  ): Promise<void> {
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { shop: true }
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found');
    }

    // If shop-specific, ensure all products belong to that shop
    if (shopId) {
      const invalidProducts = products.filter(p => p.shopId !== shopId);
      if (invalidProducts.length > 0) {
        throw new BadRequestException('All products must belong to the specified shop');
      }
    }

    // If vendor-specific, ensure all products belong to the vendor's shops
    if (vendorId) {
      const vendorShops = await prisma.shop.findMany({
        where: { vendorId },
        select: { id: true }
      });
      
      const shopIds = vendorShops.map(shop => shop.id);
      const invalidProducts = products.filter(p => !shopIds.includes(p.shopId));
      
      if (invalidProducts.length > 0) {
        throw new BadRequestException('All products must belong to the vendor\'s shops');
      }
    }
  }

  /**
   * Validate categories existence
   */
  static async validateCategories(
    prisma: PrismaService | Prisma.TransactionClient,
    categoryIds: number[]
  ): Promise<void> {
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } }
    });

    if (categories.length !== categoryIds.length) {
      throw new NotFoundException('One or more categories not found');
    }
  }

  /**
   * Validate a coupon for a specific cart
   * Checks all eligibility criteria like expiry, minimum order, usage limits, etc.
   */
  static async validateCouponForCart(
    prisma: PrismaService | Prisma.TransactionClient,
    code: string,
    userId: number,
    cartTotal: number,
    shopId?: number
  ) {
    try {
      // Find coupon by code
      const coupon = await CouponQueryHelper.findByCode(prisma, code);
      
      // Check if coupon is enabled
      if (coupon.status !== 'enabled') {
        throw new BadRequestException('This coupon is not active');
      }

      // Check shop specificity if applicable
      // First check direct shopId relation
      if (coupon.shopId && shopId && coupon.shopId !== shopId) {
        // Then check the many-to-many shops relation with a separate query
        // that explicitly includes the shops relation
        const couponWithShops = await prisma.coupon.findUnique({
          where: { id: coupon.id },
          include: { shop: true }
        });

        // Add null check to prevent TypeScript error
        if (!couponWithShops) {
          throw new NotFoundException(`Coupon with ID ${coupon.id} not found`);
        }

        // If no match in either shopId or shop relation, coupon isn't valid for this shop
        if (!couponWithShops.shop || couponWithShops.shop.id !== shopId) {
          throw new BadRequestException('This coupon is not valid for this shop');
        }
      }

      // Check date validity
      const now = new Date();
      if (coupon.startDate && new Date(coupon.startDate) > now) {
        throw new BadRequestException('This coupon is not valid yet');
      }
      if (coupon.endDate && new Date(coupon.endDate) < now) {
        throw new BadRequestException('This coupon has expired');
      }

      // Check minimum order amount
      if (coupon.minOrderAmount && cartTotal < Number(coupon.minOrderAmount)) {
        throw new BadRequestException(`This coupon requires a minimum order of ${coupon.minOrderAmount}`);
      }

      // Check global usage limit
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        throw new BadRequestException('This coupon has reached its usage limit');
      }

      // Check per-user usage limit
      if (coupon.perUserLimit) {
        const userUsageCount = await CouponQueryHelper.findUserCouponUsage(prisma, userId, coupon.id);
        if (userUsageCount >= coupon.perUserLimit) {
          throw new BadRequestException('You have already used this coupon the maximum number of times');
        }
      }

      // Calculate discount amount
      let discountAmount = 0;
      switch (coupon.type) {
        case CouponType.PERCENTAGE:
          discountAmount = cartTotal * (Number(coupon.value) / 100);
          // Apply max discount cap if set
          if (coupon.maxDiscountAmount && discountAmount > Number(coupon.maxDiscountAmount)) {
            discountAmount = Number(coupon.maxDiscountAmount);
          }
          break;
        case CouponType.FIXED_AMOUNT:
          discountAmount = Number(coupon.value);
          // Ensure discount doesn't exceed cart total
          if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
          }
          break;
        case CouponType.FREE_SHIPPING:
          // Assuming shipping is calculated elsewhere
          discountAmount = 0;
          break;
      }

      // Return validation result with applicable discount
      return {
        valid: true,
        coupon,
        discountAmount,
        message: 'Coupon is valid'
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        return {
          valid: false,
          message: error.message
        };
      }
      throw error;
    }
  }
}