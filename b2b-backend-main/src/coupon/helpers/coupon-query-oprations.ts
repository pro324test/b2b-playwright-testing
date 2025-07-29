import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto, SortDirection } from '../../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

/**
 * Helper class for coupon query operations
 * Handles all database retrieval operations for coupons
 */
export class CouponQueryHelper {
  /**
   * Find all coupons with pagination and filtering
   */
  static async findAll(
    prisma: PrismaService | Prisma.TransactionClient,
    shopId?: number, 
    vendorId?: number, 
    paginationDto?: PaginationDto
  ) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.DESC, 
      sortBy = 'createdAt' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Validate sortBy field to prevent SQL injection
    const validSortFields = ['id', 'code', 'type', 'value', 'createdAt', 'status', 'startDate', 'endDate'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    // Build where clauses
    const whereConditions: Prisma.CouponWhereInput = {};

    // Filter by shop if shopId is provided
    if (shopId) {
      whereConditions.OR = [
        // Direct shopId field (legacy)
        { shopId },
        // Many-to-many relationship through shops
        { shops: { some: { id: shopId } } }
      ];
    }

    // Filter by vendor if vendorId is provided
    if (vendorId) {
      whereConditions.vendorId = vendorId;
    }

    // Execute query with pagination
    const [coupons, totalCount] = await Promise.all([
      prisma.coupon.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          applicableProducts: {
            select: {
              id: true,
              name: true
            }
          },
          applicableCategories: {
            select: {
              id: true,
              name: true
            }
          },
          shops: {
            select: {
              id: true,
              name: true
            }
          },
          vendor: {
            include: {
              user: {
                select: {
                  username: true
                }
              }
            }
          }
        }
      }),
      prisma.coupon.count({ where: whereConditions })
    ]);

    // Format response with pagination metadata
    return {
      data: coupons,
      meta: {
        totalItems: totalCount,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1,
        sortBy: actualSortBy,
        sortDirection
      }
    };
  }

  /**
   * Find a specific coupon by ID
   */
  static async findOne(
    prisma: PrismaService | Prisma.TransactionClient,
    id: number
  ) {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        shop: true,
        vendor: true,
        applicableProducts: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            images: {
              where: { imageType: 'main' },
              take: 1
            }
          }
        },
        applicableCategories: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    return coupon;
  }

  /**
   * Find a coupon by code
   */
  static async findByCode(
    prisma: PrismaService | Prisma.TransactionClient,
    code: string
  ) {
    const coupon = await prisma.coupon.findUnique({
      where: { code },
      include: {
        shop: true,
        applicableProducts: true,
        applicableCategories: true
      }
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with code ${code} not found`);
    }

    return coupon;
  }

  /**
   * Find active coupons for a specific shop
   */
  static async findActiveShopCoupons(
    prisma: PrismaService | Prisma.TransactionClient,
    shopId: number
  ) {
    const now = new Date();
    
    return prisma.coupon.findMany({
      where: {
        shopId,
        status: 'enabled',
        OR: [
          // No date limitations
          { startDate: null, endDate: null },
          // Within date range
          {
            startDate: { lte: now },
            endDate: { gte: now }
          },
          // Started but no end
          {
            startDate: { lte: now },
            endDate: null
          },
          // Not started but has end
          {
            startDate: null,
            endDate: { gte: now }
          }
        ]
      },
      include: {
        applicableProducts: true,
        applicableCategories: true
      }
    });
  }

  /**
   * Check if a coupon code already exists
   */
  static async codeExists(
    prisma: PrismaService | Prisma.TransactionClient,
    code: string, 
    excludeId?: number
  ) {
    const where: Prisma.CouponWhereInput = { code };
    
    // If excludeId is provided, exclude that coupon from the check
    // (useful for updates where we don't want to match the current coupon)
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const coupon = await prisma.coupon.findFirst({ where });
    return !!coupon;
  }
  
  /**
   * Find user coupon usage
   */
  static async findUserCouponUsage(
    prisma: PrismaService | Prisma.TransactionClient,
    userId: number, 
    couponId: number
  ) {
    return prisma.couponUsage.count({
      where: {
        userId,
        couponId
      }
    });
  }

  /**
   * Find coupons applicable to a user's cart
   * Takes into account shop, product, and category restrictions
   */
  static async findApplicableCoupons(
    prisma: PrismaService, 
    userId: number, 
    cartId: number
  ) {
    // Get the cart with items
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: {
              include: {
                shop: true,
                categories: true
              }
            }
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return [];
    }

    // Extract shop, product, and category IDs from cart items
    const shopIds = [...new Set(cart.items.map(item => item.product.shopId))];
    const productIds = cart.items.map(item => item.product.id);
    const categoryIds = Array.from(
      new Set(
        cart.items.flatMap(item => 
          item.product.categories.map(category => category.id)
        )
      )
    );

    const now = new Date();
    const cartTotal = cart.items.reduce((sum, item) => 
      sum + Number(item.finalPrice) * item.quantity, 0);

    // Find active coupons that could apply to this cart
    const coupons = await prisma.coupon.findMany({
      where: {
        status: 'enabled',
        OR: [
          // Time validity
          { startDate: null, endDate: null },
          {
            startDate: { lte: now },
            endDate: { gte: now }
          },
          {
            startDate: { lte: now },
            endDate: null
          },
          {
            startDate: null,
            endDate: { gte: now }
          }
        ],
        AND: [
          // Minimum order amount
          {
            OR: [
              { minOrderAmount: null },
              { minOrderAmount: { lte: cartTotal } }
            ]
          },
          // Shop specificity
          {
            OR: [
              { shopId: null }, // Global coupon
              { shopId: { in: shopIds } } // Shop-specific coupon
            ]
          }
        ]
      },
      include: {
        applicableProducts: true,
        applicableCategories: true,
        usages: {
          where: { userId }
        }
      }
    });

    // Filter out coupons that have reached usage limits
    return coupons.filter(coupon => {
      // Check global usage limit
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return false;
      }
      
      // Check per-user usage limit
      if (coupon.perUserLimit && coupon.usages.length >= coupon.perUserLimit) {
        return false;
      }
      
      // Check product specificity
      if (coupon.applicableProducts.length > 0) {
        const applicableProductIds = coupon.applicableProducts.map(p => p.id);
        // Check if cart contains at least one applicable product
        const hasApplicableProduct = productIds.some(id => applicableProductIds.includes(id));
        if (!hasApplicableProduct) return false;
      }
      
      // Check category specificity
      if (coupon.applicableCategories.length > 0) {
        const applicableCategoryIds = coupon.applicableCategories.map(c => c.id);
        // Check if cart contains at least one product from an applicable category
        const hasApplicableCategory = categoryIds.some(id => applicableCategoryIds.includes(id));
        if (!hasApplicableCategory) return false;
      }
      
      return true;
    });
  }

  /**
   * Find all coupons applicable to a specific product
   * Similar to findActiveRulesForProduct in price-rules
   */
  static async findApplicableCouponsForProduct(
    prisma: PrismaService | Prisma.TransactionClient,
    productId: number,
    paginationDto?: PaginationDto,
    currentUserId?: number,
    currentUserRole?: string
  ) {
    const paginationParams = this.preparePaginationParams(
      'createdAt',
      ['id', 'code', 'type', 'value', 'createdAt'],
      paginationDto
    );
    
    const { skip, limit, sortOrder, actualSortBy } = paginationParams;
    
    // Get product with its shop and categories
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        shop: {
          include: {
            vendor: true
          }
        },
        categories: true
      }
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    
    // Base date conditions for active coupons
    const now = new Date();
    const activeDateConditions = {
      OR: [
        // No date limitations
        { startDate: null, endDate: null },
        // Within date range
        {
          startDate: { lte: now },
          endDate: { gte: now }
        },
        // Started but no end
        {
          startDate: { lte: now },
          endDate: null
        },
        // Not started but has end
        {
          startDate: null,
          endDate: { gte: now }
        }
      ]
    };

    // Base conditions for all queries
    let whereConditions: Prisma.CouponWhereInput = {
      status: 'enabled',
      ...activeDateConditions
    };

    // For admins, show all applicable coupons
    if (currentUserRole === 'admin' || currentUserRole === 'superadmin') {
      whereConditions = {
        ...whereConditions,
        OR: [
          // Product-specific coupons
          {
            applicableProducts: {
              some: { id: productId }
            }
          },
          // Category-specific coupons matching product categories
          {
            applicableCategories: {
              some: {
                id: { in: product.categories.map(c => c.id) }
              }
            }
          },
          // Shop-specific coupons
          {
            shopId: product.shopId
          },
          // Vendor-specific coupons
          {
            vendorId: product.shop.vendorId
          },
          // Global coupons (no shop, no product, no category constraints)
          {
            shopId: null,
            vendorId: null,
            applicableProducts: { none: {} },
            applicableCategories: { none: {} }
          }
        ]
      };
    }
    // For vendors, show only their coupons and admin coupons
    else if (currentUserRole === 'vendor' && currentUserId) {
      // Check if the vendor owns this product
      const vendorUser = await prisma.vendor.findFirst({
        where: { userId: currentUserId },
        select: { id: true }
      });
      
      const isProductOwner = vendorUser && product.shop.vendorId === vendorUser.id;
      
      if (isProductOwner) {
        whereConditions = {
          ...whereConditions,
          OR: [
            // Product-specific coupons
            {
              applicableProducts: {
                some: { id: productId }
              }
            },
            // Category-specific coupons matching product categories
            {
              applicableCategories: {
                some: {
                  id: { in: product.categories.map(c => c.id) }
                }
              }
            },
            // Shop-specific coupons
            {
              shopId: product.shopId
            },
            // Vendor-specific coupons
            {
              vendorId: product.shop.vendorId
            },
            // Admin global coupons
            {
              shopId: null,
              vendorId: null,
              creatorType: 'admin',
              applicableProducts: { none: {} },
              applicableCategories: { none: {} }
            }
          ]
        };
      } else {
        // If not product owner, only show coupons created by this vendor or admin
        whereConditions = {
          ...whereConditions,
          OR: [
            // Admin coupons specifically for this product
            {
              applicableProducts: {
                some: { id: productId }
              },
              creatorType: 'admin'
            },
            // Admin category-specific coupons
            {
              applicableCategories: {
                some: {
                  id: { in: product.categories.map(c => c.id) }
                }
              },
              creatorType: 'admin'
            },
            // Admin shop-specific coupons
            {
              shopId: product.shopId,
              creatorType: 'admin'
            },
            // Admin global coupons
            {
              shopId: null,
              vendorId: null,
              creatorType: 'admin',
              applicableProducts: { none: {} },
              applicableCategories: { none: {} }
            },
            // Coupons created by this vendor
            {
              creatorType: 'vendor',
              creatorId: currentUserId
            }
          ]
        };
      }
    }
    // For regular users, show only active public coupons
    else {
      whereConditions = {
        ...whereConditions,
        OR: [
          // Product-specific coupons
          {
            applicableProducts: {
              some: { id: productId }
            }
          },
          // Category-specific coupons matching product categories
          {
            applicableCategories: {
              some: {
                id: { in: product.categories.map(c => c.id) }
              }
            }
          },
          // Shop-specific coupons
          {
            shopId: product.shopId
          },
          // Vendor-specific coupons
          {
            vendorId: product.shop.vendorId
          },
          // Global coupons
          {
            shopId: null,
            vendorId: null,
            applicableProducts: { none: {} },
            applicableCategories: { none: {} }
          }
        ]
      };
    }

    // Execute query with pagination
    const [coupons, totalCount] = await Promise.all([
      prisma.coupon.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          shop: true,
          vendor: true,
          applicableProducts: {
            select: { id: true, name: true }
          },
          applicableCategories: {
            select: { id: true, name: true }
          }
        }
      }),
      prisma.coupon.count({
        where: whereConditions
      })
    ]);

    // Add source information to each coupon
    const couponsWithSource = coupons.map(coupon => {
      let source = 'global'; // Default
      
      // Check if product-specific
      if (coupon.applicableProducts?.some(p => p.id === productId)) {
        source = 'product';
      }
      // Check if category-specific
      else if (coupon.applicableCategories?.some(cat => 
        product.categories.some(pCat => pCat.id === cat.id))) {
        source = 'category';
      }
      // Check if shop-specific
      else if (coupon.shopId === product.shopId) {
        source = 'shop';
      }
      // Check if vendor-specific
      else if (coupon.vendorId === product.shop.vendorId) {
        source = 'vendor';
      }
      
      return {
        ...coupon,
        couponSource: source
      };
    });

    return this.createPaginatedResponse(couponsWithSource, totalCount, paginationParams);
  }

  /**
   * Helper method to prepare pagination parameters
   */
  private static preparePaginationParams(
    defaultSortBy: string,
    allowedSortFields: string[],
    paginationDto?: PaginationDto
  ) {
    // Default values
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;
    const sortDirection = paginationDto?.sortDirection || 'asc';
    const sortOrder = sortDirection === 'asc' ? 'asc' : 'desc';
    const sortBy = paginationDto?.sortBy || defaultSortBy;
    
    // Ensure sortBy is a valid field
    const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : defaultSortBy;
    
    return {
      page,
      limit,
      skip,
      sortOrder,
      actualSortBy,
      sortDirection
    };
  }

  /**
   * Create paginated response object
   */
  private static createPaginatedResponse(data: any[], totalCount: number, params: any) {
    const totalPages = Math.ceil(totalCount / params.limit);
    
    return {
      data,
      meta: {
        totalItems: totalCount,
        itemsPerPage: params.limit,
        totalPages,
        currentPage: params.page,
        hasNextPage: params.page < totalPages,
        hasPreviousPage: params.page > 1,
        sortBy: params.actualSortBy,
        sortDirection: params.sortDirection
      }
    };
  }

  /**
   * Determine the source/level of a coupon (similar to determineRuleSource in price-rules)
   */
  static determineCouponSource(coupon: any, product?: any): string {
    // Check if this coupon specifically targets this product
    if (product && coupon.applicableProducts?.some(p => p.id === product.id)) {
      return 'product';
    }
    
    // Check if product belongs to any applicable categories
    if (product && product.categories && coupon.applicableCategories?.some(category => 
      product.categories.some(prodCat => prodCat.id === category.id))) {
      return 'category';
    }
    
    // Check if this is a shop-specific coupon
    if (coupon.shopId) {
      return 'shop';
    }
    
    // Check if this is a vendor-specific coupon
    if (coupon.vendorId) {
      return 'vendor';
    }
    
    // If none of the above, it's a global coupon
    return 'global';
  }
}