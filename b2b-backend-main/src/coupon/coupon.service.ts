import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto, CouponType } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

// Import helper classes
import { CouponQueryHelper } from './helpers/coupon-query-oprations';
import { CouponValidationHelper } from './helpers/coupon-validation-helper';
import { CouponCreationHelper } from './helpers/coupon-creation-helper';
import { CouponCartOperations } from './helpers/coupon-cart-operations';
import { CouponUsageTracker } from './helpers/coupon-usage-tracker';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new coupon
   */
  async create(
    createCouponDto: CreateCouponDto,
    creatorId: number,
    creatorRole: string,
    vendorId?: number
  ) {
    try {
      // Destructure to separate onBehalfOfVendorId and other relationships from the DTO
      const { 
        onBehalfOfVendorId, // Extract this but don't pass it to Prisma directly
        shopIds, 
        applicableProductIds, 
        applicableCategoryIds, 
        ...couponData 
      } = createCouponDto;
      
      // First validate all input data
      await CouponValidationHelper.validateCreateCouponInput(
        this.prisma,
        createCouponDto,
        vendorId
      );
      
      // Begin transaction
      return await this.prisma.$transaction(async (tx) => {
        // Create the coupon record first - WITHOUT onBehalfOfVendorId
        const coupon = await tx.coupon.create({
          data: {
            ...couponData,
            creatorId: creatorId,
            creatorType: creatorRole,
            vendorId: vendorId  // This is the correct field from your schema
          }
        });
        
        // Connect shops if shopIds are provided
        if (shopIds && shopIds.length > 0) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: {
              shops: {
                connect: shopIds.map(id => ({ id }))
              }
            }
          });
        }
        
        // Connect applicable products if provided
        if (applicableProductIds && applicableProductIds.length > 0) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: {
              applicableProducts: {
                connect: applicableProductIds.map(id => ({ id }))
              }
            }
          });
        }
        
        // Connect applicable categories if provided
        if (applicableCategoryIds && applicableCategoryIds.length > 0) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: {
              applicableCategories: {
                connect: applicableCategoryIds.map(id => ({ id }))
              }
            }
          });
        }
        
        // Return the created coupon with all relations
        return tx.coupon.findUnique({
          where: { id: coupon.id },
          include: {
            shops: true,
            applicableProducts: true,
            applicableCategories: true,
            vendor: true
          }
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A coupon with this code already exists');
        }
      }
      throw error;
    }
  }

  /**
   * Get all coupons with pagination
   */
  async findAll(shopId?: number, vendorId?: number, paginationDto?: PaginationDto) {
    return CouponQueryHelper.findAll(this.prisma, shopId, vendorId, paginationDto);
  }

  /**
   * Get a specific coupon by ID
   */
  async findOne(id: number) {
    return CouponQueryHelper.findOne(this.prisma, id);
  }

  /**
   * Get a coupon by its code
   */
  async findByCode(code: string) {
    return CouponQueryHelper.findByCode(this.prisma, code);
  }

  /**
   * Update an existing coupon
   */
  async update(id: number, updateCouponDto: UpdateCouponDto) {
    try {
      // First get the existing coupon
      const existingCoupon = await this.findOne(id);
      
      // Destructure the DTO to get relationship fields separately
      const { shopIds, applicableProductIds, applicableCategoryIds, ...couponData } = updateCouponDto;
      
      // Validate update inputs
      await CouponValidationHelper.validateUpdateCouponInput(
        this.prisma,
        updateCouponDto,
        existingCoupon
      );
      
      // Update the coupon in a transaction
      return await this.prisma.$transaction(async (tx) => {
        // Update base coupon data
        const updatedCoupon = await tx.coupon.update({
          where: { id },
          data: couponData
        });
        
        // Update shop relations if provided
        if (shopIds !== undefined) {
          await tx.coupon.update({
            where: { id },
            data: {
              shops: {
                set: shopIds?.map(id => ({ id })) || []
              }
            }
          });
        }
        
        // Update product relations if provided
        if (applicableProductIds !== undefined) {
          await tx.coupon.update({
            where: { id },
            data: {
              applicableProducts: {
                set: applicableProductIds?.map(id => ({ id })) || []
              }
            }
          });
        }
        
        // Update category relations if provided
        if (applicableCategoryIds !== undefined) {
          await tx.coupon.update({
            where: { id },
            data: {
              applicableCategories: {
                set: applicableCategoryIds?.map(id => ({ id })) || []
              }
            }
          });
        }
        
        // Return the updated coupon with all relations
        return tx.coupon.findUnique({
          where: { id },
          include: {
            shops: true,
            applicableProducts: true,
            applicableCategories: true,
            vendor: true
          }
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A coupon with this code already exists');
        }
      }
      throw error;
    }
  }

  /**
   * Remove a coupon
   */
  async remove(id: number) {
    // Check if coupon exists
    await this.findOne(id);
    
    await this.prisma.coupon.delete({ where: { id } });
    
    return { message: 'Coupon deleted successfully' };
  }

  /**
   * Enable a coupon
   */
  async enable(id: number) {
    // Check if coupon exists
    await this.findOne(id);
    
    return this.prisma.coupon.update({
      where: { id },
      data: { status: 'enabled' }
    });
  }

  /**
   * Disable a coupon
   */
  async disable(id: number) {
    // Check if coupon exists
    await this.findOne(id);
    
    return this.prisma.coupon.update({
      where: { id },
      data: { status: 'disabled' }
    });
  }

  /**
   * Find active coupons for a shop
   */
  async findActiveShopCoupons(shopId: number) {
    return CouponQueryHelper.findActiveShopCoupons(this.prisma, shopId);
  }

  /**
   * Determine the source of a coupon (similar to determineRuleSource in price-rules)
   * Returns whether it's a product-specific, shop-wide, or vendor-wide coupon
   */
  determineCouponSource(coupon: any, product?: any): string {
    return CouponQueryHelper.determineCouponSource(coupon, product);
  }

  /**
   * Find coupons applicable to a user's cart
   */
  async findApplicableCouponsForCart(userId: number, cartId: number) {
    return CouponQueryHelper.findApplicableCoupons(this.prisma, userId, cartId);
  }

  /**
   * Find all coupons applicable to a specific product
   * Similar to findActiveRulesForProduct in price-rules
   */
  async findApplicableCouponsForProduct(
    productId: number,
    paginationDto?: PaginationDto,
    currentUserId?: number,
    currentUserRole?: string
  ) {
    return CouponQueryHelper.findApplicableCouponsForProduct(
      this.prisma,
      productId,
      paginationDto,
      currentUserId,
      currentUserRole
    );
  }

  /**
   * Validate a coupon for a specific cart
   */
  async validateCoupon(code: string, userId: number, cartTotal: number, shopId?: number) {
    return CouponValidationHelper.validateCouponForCart(
      this.prisma,
      code,
      userId,
      cartTotal,
      shopId
    );
  }

  /**
   * Apply a coupon to a cart
   */
  async applyCouponToCart(cartId: number, userId: number, code: string) {
    return CouponCartOperations.applyCouponToCart(
      this.prisma,
      this,
      cartId,
      userId,
      code
    );
  }

  /**
   * Remove a coupon from a cart
   */
  async removeCouponFromCart(cartId: number, userId: number) {
    return CouponCartOperations.removeCouponFromCart(
      this.prisma,
      cartId,
      userId
    );
  }

  /**
   * Record coupon usage when order is created
   */
  async recordCouponUsage(couponCode: string, userId: number, orderId: number) {
    return CouponUsageTracker.recordCouponUsage(
      this.prisma,
      couponCode,
      userId,
      orderId
    );
  }
  
  /**
   * Get coupon usage statistics
   */
  async getCouponUsageStats(couponId: number) {
    return CouponUsageTracker.getCouponUsageStats(
      this.prisma,
      couponId
    );
  }

  /**
   * Get coupon usage history with pagination
   */
  async getCouponUsageHistory(couponId: number, page: number = 1, limit: number = 10) {
    return CouponUsageTracker.getCouponUsageHistory(
      this.prisma,
      couponId,
      page,
      limit
    );
  }

  /**
   * Check if a user has reached their usage limit for a coupon
   */
  async hasUserReachedCouponLimit(couponId: number, userId: number) {
    return CouponUsageTracker.hasUserReachedCouponLimit(
      this.prisma,
      couponId,
      userId
    );
  }

  /**
   * Verify if a coupon is valid for a specific shop's products in a cart
   * Used during order creation process
   */
  async verifyCouponValidityForOrder(cart: any, shopId: number) {
    return CouponCartOperations.verifyCouponValidityForOrder(
      this.prisma,
      this,
      cart,
      shopId
    );
  }

  /**
   * Calculate coupon discount for a cart during checkout
   */
  async calculateCouponDiscount(cart: any) {
    return CouponCartOperations.calculateCouponDiscount(
      this.prisma,
      this,
      cart
    );
  }
}