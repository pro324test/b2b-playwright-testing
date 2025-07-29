import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromotionDto, PromotionType } from '../dto/create-promotion.dto';

/**
 * Create a new promotion with BOGO rule
 * With validation to ensure: 
 * - One promotion per simple product
 * - One general promotion per product with variants 
 * - One promotion per specific variant
 */
export async function createPromotion(prisma: PrismaService, createPromotionDto: CreatePromotionDto) {
  try {
    const { bogoRule, ...promotionData } = createPromotionDto;

    // Default the discount to 100% if not specified (completely free item)
    if (bogoRule && !bogoRule.discountPercent) {
      bogoRule.discountPercent = 100;
    }

    // Verify freeProductId is provided when sameProduct is false
    if (bogoRule?.sameProduct === false && !bogoRule.freeProductId) {
      throw new BadRequestException('freeProductId is required when sameProduct is false');
    }

    // Validate shop exists
    const shop = await prisma.shop.findUnique({
      where: { id: promotionData.shopId }
    });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${promotionData.shopId} not found`);
    }

    // Validation for BOGO_DIFFERENT type
    if (promotionData.type === PromotionType.BOGO_DIFFERENT) {
      if (!bogoRule?.freeProductId) {
        throw new BadRequestException('freeProductId is required for BOGO_DIFFERENT promotions');
      }

      // Validate the free product exists
      const freeProduct = await prisma.product.findUnique({
        where: { id: bogoRule.freeProductId }
      });

      if (!freeProduct) {
        throw new NotFoundException(`Free product with ID ${bogoRule.freeProductId} not found`);
      }

      // Ensure the product belongs to the shop
      if (freeProduct.shopId !== promotionData.shopId) {
        throw new BadRequestException('Free product must belong to the same shop as the promotion');
      }
    }

    // Validate all applicable products exist
    // Fix: explicitly type the array as number[]
    const productIdsToCheck: number[] = [];
    if (bogoRule?.applicableProductIds && Array.isArray(bogoRule.applicableProductIds)) {
      for (const id of bogoRule.applicableProductIds) {
        productIdsToCheck.push(id);
      }
    }
    
    if (productIdsToCheck.length > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: productIdsToCheck } },
        select: { 
          id: true, 
          shopId: true,
          variants: { 
            take: 1 // Just check if variants exist, no need to get all
          }
        }
      });

      if (products.length !== productIdsToCheck.length) {
        throw new NotFoundException('One or more products not found');
      }

      // Ensure all products belong to the shop
      const invalidProducts = products.filter(p => p.shopId !== promotionData.shopId);
      if (invalidProducts.length > 0) {
        throw new BadRequestException('All products must belong to the specified shop');
      }

      // Rest of your code remains unchanged
      // Check for existing promotions on these products
      for (const product of products) {
        const hasVariants = product.variants && product.variants.length > 0;
        
        // Find existing active promotions for this product
        const existingPromotions = await prisma.promotion.findMany({
          where: {
            status: 'enabled',
            bogoRule: {
              applicableProducts: {
                some: { id: product.id }
              }
            },
            // Active time range check
            OR: [
              // No date limitations
              { startDate: null, endDate: null },
              // Within date range
              {
                startDate: { lte: new Date() },
                endDate: { gte: new Date() }
              },
              // Started but no end
              {
                startDate: { lte: new Date() },
                endDate: null
              },
              // Not started but has end
              {
                startDate: null,
                endDate: { gte: new Date() }
              }
            ]
          },
          include: {
            bogoRule: true
          }
        });

        // For products without variants, only one promotion is allowed
        if (!hasVariants && existingPromotions.length > 0) {
          throw new BadRequestException(
            `Product with ID ${product.id} already has an active promotion. Only one promotion per product is allowed.`
          );
        } 
        
        // For products with variants, check if this is a general (apply to all) promotion
        if (hasVariants && bogoRule.applyToAllVariants === true) {
          // Check if there's already a general promotion for this product
          const existingGeneralPromotion = existingPromotions.find(p => 
            p.bogoRule && p.bogoRule.applyToAllVariants === true
          );
          
          if (existingGeneralPromotion) {
            throw new BadRequestException(
              `Product with ID ${product.id} already has an active promotion that applies to all variants. Only one general promotion per product is allowed.`
            );
          }
        }
      }
    }

    // The rest of your code remains unchanged
    // Validate all applicable variants exist and ensure one promotion per variant
    if (bogoRule?.applicableVariantIds && bogoRule.applicableVariantIds.length > 0 && bogoRule.applyToAllVariants === false) {
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: bogoRule.applicableVariantIds } },
        include: { product: true }
      });

      if (variants.length !== bogoRule.applicableVariantIds.length) {
        throw new NotFoundException('One or more variants not found');
      }

      // Ensure all variants belong to products in the shop
      const invalidVariants = variants.filter(v => v.product.shopId !== promotionData.shopId);
      if (invalidVariants.length > 0) {
        throw new BadRequestException('All variants must belong to products in the specified shop');
      }

      // Check for existing promotions on these specific variants
      for (const variant of variants) {
        const existingVariantPromotion = await prisma.promotion.findFirst({
          where: {
            status: 'enabled',
            bogoRule: {
              applicableVariants: {
                some: { id: variant.id }
              }
            },
            // Active time range check
            OR: [
              // No date limitations
              { startDate: null, endDate: null },
              // Within date range
              {
                startDate: { lte: new Date() },
                endDate: { gte: new Date() }
              },
              // Started but no end
              {
                startDate: { lte: new Date() },
                endDate: null
              },
              // Not started but has end
              {
                startDate: null,
                endDate: { gte: new Date() }
              }
            ]
          }
        });

        if (existingVariantPromotion) {
          throw new BadRequestException(
            `Variant with ID ${variant.id} already has an active promotion. Only one promotion per variant is allowed.`
          );
        }
      }
    }

    // Validate all applicable categories exist
    if (bogoRule?.applicableCategoryIds && bogoRule.applicableCategoryIds.length > 0) {
      const categories = await prisma.category.findMany({
        where: { id: { in: bogoRule.applicableCategoryIds } }
      });

      if (categories.length !== bogoRule.applicableCategoryIds.length) {
        throw new NotFoundException('One or more categories not found');
      }
    }

    // Create the promotion with nested bogoRule in a transaction
    return await prisma.$transaction(async (tx) => {
      // 1. Create the base promotion
      const promotion = await tx.promotion.create({
        data: {
          name: promotionData.name,
          description: promotionData.description,
          type: promotionData.type,
          status: promotionData.status || 'enabled',
          startDate: promotionData.startDate ? new Date(promotionData.startDate) : null,
          endDate: promotionData.endDate ? new Date(promotionData.endDate) : null,
          shop: {
            connect: { id: promotionData.shopId }
          },
          // Create bogoRule
          bogoRule: {
            create: {
              buyQuantity: bogoRule.buyQuantity,
              getQuantity: bogoRule.getQuantity,
              discountPercent: bogoRule.discountPercent,
              sameProduct: bogoRule.sameProduct,
              freeProductId: (!bogoRule.sameProduct && bogoRule.freeProductId) ? bogoRule.freeProductId : null,
              applyToAllVariants: bogoRule.applyToAllVariants ?? true,
              maxRedemptionsPerOrder: bogoRule.maxRedemptionsPerOrder
            }
          }
        },
        include: {
          bogoRule: true
        }
      });

      // 2. Connect applicable products, categories, and variants to the bogoRule
      if (promotion.bogoRule) {
        if (bogoRule.applicableProductIds && bogoRule.applicableProductIds.length > 0) {
          await tx.bogoRule.update({
            where: { id: promotion.bogoRule.id },
            data: {
              applicableProducts: {
                connect: bogoRule.applicableProductIds.map(id => ({ id }))
              }
            }
          });
        }

        if (bogoRule.applicableCategoryIds && bogoRule.applicableCategoryIds.length > 0) {
          await tx.bogoRule.update({
            where: { id: promotion.bogoRule.id },
            data: {
              applicableCategories: {
                connect: bogoRule.applicableCategoryIds.map(id => ({ id }))
              }
            }
          });
        }
        
        // Add this block to handle variant IDs
        if (bogoRule.applicableVariantIds && bogoRule.applicableVariantIds.length > 0) {
          await tx.bogoRule.update({
            where: { id: promotion.bogoRule.id },
            data: {
              applicableVariants: {
                connect: bogoRule.applicableVariantIds.map(id => ({ id }))
              }
            }
          });
        }
      }

      // Return the created promotion with all relations
      return await tx.promotion.findUnique({
        where: { id: promotion.id },
        include: {
          shop: true,
          bogoRule: {
            include: {
              applicableProducts: true,
              applicableCategories: true,
              applicableVariants: true,
              freeProduct: true
            }
          }
        }
      });
    });
  } catch (error) {
    throw error;
  }
}