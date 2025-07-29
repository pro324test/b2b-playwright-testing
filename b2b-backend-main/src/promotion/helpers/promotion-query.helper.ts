import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SortDirection, PaginationDto } from '../../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

/**
 * Find a single promotion by ID with all relations
 */
export async function findPromotionById(prisma: PrismaService, id: number) {
  const promotion = await prisma.promotion.findUnique({
    where: { id },
    include: {
      shop: true,
      bogoRule: {
        include: {
          freeProduct: true,
          applicableProducts: true,
          applicableCategories: true,
          applicableVariants: true
        }
      }
    }
  });

  if (!promotion) {
    throw new NotFoundException(`Promotion with ID ${id} not found`);
  }

  return promotion;
}

/**
 * Get all promotions with pagination
 */
export async function findAllPromotions(
  prisma: PrismaService,
  shopId?: number,
  paginationDto?: PaginationDto
) {
  const { 
    page = 1, 
    limit = 10, 
    sortDirection = SortDirection.DESC, 
    sortBy = 'createdAt' 
  } = paginationDto || {};
  
  const skip = (page - 1) * limit;

  // Validate sortBy field to prevent SQL injection
  const validSortFields = ['id', 'name', 'createdAt', 'startDate', 'endDate', 'status', 'type'];
  const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  
  // Build where clause conditionally
  const where: Prisma.PromotionWhereInput = {};
  
  if (shopId) {
    where.shopId = shopId;
  }

  const [promotions, totalCount] = await Promise.all([
    prisma.promotion.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [actualSortBy]: sortDirection.toLowerCase() },
      include: {
        shop: true,
        bogoRule: {
          include: {
            freeProduct: true,
            applicableProducts: {
              select: {
                id: true,
                name: true,
                basePrice: true,
                images: {
                  where: {
                    imageType: 'main'
                  },
                  take: 1
                }
              }
            },
            applicableCategories: {
              select: {
                id: true,
                name: true
              }
            },
            applicableVariants: {
              select: {
                id: true,
                sku: true,
                price: true,
                attributeValues: {
                  include: {
                    attribute: true
                  }
                },
                product: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    }),
    prisma.promotion.count({ where })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: promotions,
    meta: {
      totalItems: totalCount,
      itemsPerPage: limit,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      sortBy: actualSortBy,
      sortDirection
    }
  };
}

/**
 * Find active promotions for a shop
 */
export async function findActiveShopPromotions(prisma: PrismaService, shopId: number) {
  const now = new Date();
  
  return prisma.promotion.findMany({
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
      bogoRule: {
        include: {
          freeProduct: true,
          applicableProducts: true,
          applicableCategories: true,
          applicableVariants: true
        }
      }
    }
  });
}

/**
 * Verify promotion ownership by shop vendor
 */
export async function checkPromotionOwnership(
  prisma: PrismaService, 
  promotionId: number, 
  vendorId: number
) {
  return prisma.promotion.findFirst({
    where: {
      id: promotionId,
      shop: {
        vendor: {
          id: vendorId
        }
      }
    }
  });
}