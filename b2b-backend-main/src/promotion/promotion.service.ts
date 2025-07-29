import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto, PromotionType } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PaginationDto, SortDirection } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';
import { createPromotion } from './helpers/promotion-creation.helpers';
import * as PromotionQueryHelper from './helpers/promotion-query.helper';
import * as PromotionCartHelper from './helpers/promotion-cart.helper';


@Injectable()
export class PromotionService {
  
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new promotion with BOGO rule
   */
  async create(createPromotionDto: CreatePromotionDto) {
    return createPromotion(this.prisma, createPromotionDto);
  }

  /**
   * Get all promotions with pagination
   */
  async findAll(shopId?: number, paginationDto?: PaginationDto) {
    return PromotionQueryHelper.findAllPromotions(this.prisma, shopId, paginationDto);
  }

  /**
   * Get a single promotion by ID
   */
  async findOne(id: number) {
    return PromotionQueryHelper.findPromotionById(this.prisma, id);
  }

  /**
   * Update an existing promotion
   */
  async update(id: number, updatePromotionDto: UpdatePromotionDto) {
    // Check if promotion exists
    const existingPromotion = await this.findOne(id);
    
    // Extract data
    const { bogoRule, ...promotionData } = updatePromotionDto;
    
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Update the base promotion data
        if (Object.keys(promotionData).length > 0) {
          await tx.promotion.update({
            where: { id },
            data: {
              ...(promotionData.name && { name: promotionData.name }),
              ...(promotionData.description !== undefined && { 
                description: promotionData.description 
              }),
              ...(promotionData.type && { type: promotionData.type }),
              ...(promotionData.status && { status: promotionData.status }),
              ...(promotionData.startDate && { 
                startDate: new Date(promotionData.startDate) 
              }),
              ...(promotionData.endDate && { 
                endDate: new Date(promotionData.endDate) 
              })
            }
          });
        }
  
        // 2. Update BOGO rule if provided
        if (bogoRule && existingPromotion.bogoRule) {
          // Basic rule updates
          const bogoRuleUpdates: any = {};
          
          if (bogoRule.buyQuantity !== undefined) {
            bogoRuleUpdates.buyQuantity = bogoRule.buyQuantity;
          }
          
          if (bogoRule.getQuantity !== undefined) {
            bogoRuleUpdates.getQuantity = bogoRule.getQuantity;
          }
          
          if (bogoRule.discountPercent !== undefined) {
            bogoRuleUpdates.discountPercent = bogoRule.discountPercent;
          }
          
          if (bogoRule.sameProduct !== undefined) {
            bogoRuleUpdates.sameProduct = bogoRule.sameProduct;
            
            // If switching to same product mode, clear the free product
            if (bogoRule.sameProduct) {
              bogoRuleUpdates.freeProductId = null;
            }
          }
          
          if (bogoRule.freeProductId !== undefined && !bogoRule.sameProduct) {
            // Validate the free product exists
            const freeProduct = await tx.product.findUnique({
              where: { id: bogoRule.freeProductId }
            });
            
            if (!freeProduct) {
              throw new NotFoundException(`Free product with ID ${bogoRule.freeProductId} not found`);
            }
            
            bogoRuleUpdates.freeProductId = bogoRule.freeProductId;
          }
  
          if (bogoRule.applyToAllVariants !== undefined) {
            bogoRuleUpdates.applyToAllVariants = bogoRule.applyToAllVariants;
          }
  
          if (bogoRule.maxRedemptionsPerOrder !== undefined) {
            bogoRuleUpdates.maxRedemptionsPerOrder = bogoRule.maxRedemptionsPerOrder;
          }
          
          // Update the basic properties
          if (Object.keys(bogoRuleUpdates).length > 0) {
            await tx.bogoRule.update({
              where: { id: existingPromotion.bogoRule.id },
              data: bogoRuleUpdates
            });
          }
  
          // Handle related product updates if provided
          if (bogoRule.applicableProductIds !== undefined) {
            // Validate all products exist and belong to the shop
            if (bogoRule.applicableProductIds.length > 0) {
              const products = await tx.product.findMany({
                where: { id: { in: bogoRule.applicableProductIds } },
                select: { id: true, shopId: true }
              });
  
              if (products.length !== bogoRule.applicableProductIds.length) {
                throw new NotFoundException('One or more products not found');
              }
  
              // Check if all products belong to the same shop
              const invalidProducts = products.filter(p => p.shopId !== existingPromotion.shopId);
              if (invalidProducts.length > 0) {
                throw new BadRequestException('All products must belong to the promotion\'s shop');
              }
            }
            
            // Update the applicable products (replacing existing ones)
            await tx.bogoRule.update({
              where: { id: existingPromotion.bogoRule.id },
              data: {
                applicableProducts: {
                  set: bogoRule.applicableProductIds.map(id => ({ id }))
                }
              }
            });
          }
  
          // Handle related category updates if provided
          if (bogoRule.applicableCategoryIds !== undefined) {
            // Validate all categories exist
            if (bogoRule.applicableCategoryIds.length > 0) {
              const categories = await tx.category.findMany({
                where: { id: { in: bogoRule.applicableCategoryIds } }
              });
  
              if (categories.length !== bogoRule.applicableCategoryIds.length) {
                throw new NotFoundException('One or more categories not found');
              }
            }
            
            // Update the applicable categories (replacing existing ones)
            await tx.bogoRule.update({
              where: { id: existingPromotion.bogoRule.id },
              data: {
                applicableCategories: {
                  set: bogoRule.applicableCategoryIds.map(id => ({ id }))
                }
              }
            });
          }

          // Add this block to handle variant updates
          if (bogoRule.applicableVariantIds !== undefined) {
            // Validate all variants exist
            if (bogoRule.applicableVariantIds.length > 0) {
              const variants = await tx.productVariant.findMany({
                where: { id: { in: bogoRule.applicableVariantIds } },
                include: { product: true }
              });

              if (variants.length !== bogoRule.applicableVariantIds.length) {
                throw new NotFoundException('One or more variants not found');
              }

              // Check if all variants belong to products in the same shop
              const invalidVariants = variants.filter(v => v.product.shopId !== existingPromotion.shopId);
              if (invalidVariants.length > 0) {
                throw new BadRequestException('All variants must belong to products in the promotion\'s shop');
              }
            }
            
            // Update the applicable variants (replacing existing ones)
            await tx.bogoRule.update({
              where: { id: existingPromotion.bogoRule.id },
              data: {
                applicableVariants: {
                  set: bogoRule.applicableVariantIds.map(id => ({ id }))
                }
              }
            });
          }
        }
  
        // Return the updated promotion with all relations
        return tx.promotion.findUnique({
          where: { id },
          include: {
            shop: true,
            bogoRule: {
              include: {
                freeProduct: true,
                applicableProducts: true,
                applicableCategories: true,
                applicableVariants: true  // Add this to include variants in response
              }
            }
          }
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('A promotion with this name already exists');
        }
      }
      throw error;
    }
  }

  /**
   * Delete a promotion
   */
  async remove(id: number) {
    // Check if promotion exists
    await this.findOne(id);
    
    // Delete the promotion (cascades to bogoRule via relation)
    await this.prisma.promotion.delete({ where: { id } });
    
    return { message: 'Promotion deleted successfully' };
  }

  /**
   * Enable a promotion
   */
  async enable(id: number) {
    await this.findOne(id);
    
    return this.prisma.promotion.update({
      where: { id },
      data: { status: 'enabled' }
    });
  }

  /**
   * Disable a promotion
   */
  async disable(id: number) {
    await this.findOne(id);
    
    return this.prisma.promotion.update({
      where: { id },
      data: { status: 'disabled' }
    });
  }

  /**
   * Verify promotion ownership by shop vendor
   */
  async checkPromotionOwnership(promotionId: number, vendorId: number) {
    const promotion = await PromotionQueryHelper.checkPromotionOwnership(
      this.prisma, 
      promotionId, 
      vendorId
    );

    if (!promotion) {
      throw new ForbiddenException('You do not have permission to manage this promotion');
    }

    return promotion;
  }

  /**
   * Find active promotions for a shop
   */
  async findActiveShopPromotions(shopId: number) {
    return PromotionQueryHelper.findActiveShopPromotions(this.prisma, shopId);
  }
  
  /**
   * Apply promotions to cart items
   * This method will check all active promotions and apply eligible discounts to cart items
   * Implements the variant-level application logic where each variant gets at most one promotion
   * with variant-specific promotions taking priority over general ones
   */
  async applyPromotionsToCart(cartItems: any[], shopId: number) {
    return PromotionCartHelper.applyPromotionsToCart(this, cartItems, shopId);
  }
}