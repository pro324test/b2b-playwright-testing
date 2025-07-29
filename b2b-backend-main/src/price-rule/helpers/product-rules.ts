import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { preparePaginationParams, createPaginatedResponse } from './pagination-helpers';

/**
 * Common date filter conditions for active rules
 */
const activeDateConditions = [
  { startDate: null, endDate: null },
  { startDate: { lte: new Date() }, endDate: { gte: new Date() } },
  { startDate: { lte: new Date() }, endDate: null },
  { startDate: null, endDate: { gte: new Date() } }
];

/**
 * Find active price rules for a specific product
 * @param prisma The Prisma service instance
 * @param productId ID of the product to find rules for
 * @param paginationDto Optional pagination parameters
 * @param currentUserId Optional ID of the current user for filtering
 * @param currentUserType Optional type of the current user ('admin' or 'user') for filtering
 * @param currentUserRole Optional role of the current user for additional permission checks
 * @returns Paginated list of price rules that apply to the product
 */
export async function findActiveRulesForProduct(
  prisma: PrismaService, 
  productId: number, 
  paginationDto?: PaginationDto,
  currentUserId?: number,
  currentUserType?: string,
  currentUserRole?: string
) {
  const paginationParams = preparePaginationParams(
    paginationDto,
    'createdAt',
    ['id', 'name', 'type', 'value', 'minQuantity', 'createdAt']
  );
    
  const { skip, limit, sortOrder, actualSortBy } = paginationParams;

  // For admins, show all rules
  if (currentUserType === 'admin' || currentUserRole === 'admin' || currentUserRole === 'superadmin') {
    const whereConditions = {
      status: 'enabled',
      OR: activeDateConditions
    };

    const [rules, totalCount] = await Promise.all([
      prisma.priceRule.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          vendorGroup: true,
          vendor: true,
          products: {
            include: {
              shop: true
            }
          },
          variants: {
            include: {
              attributeValues: {
                include: {
                  attribute: true
                }
              }
            }
          },
          shops: true
        }
      }),
      prisma.priceRule.count({
        where: whereConditions
      })
    ]);

    return createPaginatedResponse(rules, totalCount, paginationParams);
  }
  
  // If this is a vendor request, we need special handling
  if (currentUserId && currentUserType === 'user' && currentUserRole === 'vendor') {
    // First, get the product to check ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        shop: {
          include: {
            vendor: true
          }
        }
      }
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    
    // Check if the vendor owns this product
    const vendorUser = await prisma.vendor.findFirst({
      where: { userId: currentUserId },
      select: { id: true }
    });
    
    const isProductOwner = vendorUser && product.shop.vendorId === vendorUser.id;
    
    // Updated logic to properly show rules
    let whereConditions: any = {
      status: 'enabled',
      OR: [
        // Product-specific rules with valid dates
        {
          products: {
            some: {
              id: productId
            }
          },
          AND: {
            OR: activeDateConditions
          }
        },
        // All rules created by this vendor
        { 
          creatorType: 'user',
          creatorId: currentUserId,
          AND: {
            OR: activeDateConditions
          }
        },
        // Admin created rules
        { 
          creatorType: 'admin',
          AND: {
            OR: activeDateConditions 
          }
        },
        // Include rules associated with the vendor of the product
        {
          vendorId: product.shop.vendorId,
          status: 'enabled',
          OR: activeDateConditions
        },
        // Include rules associated with the shop of the product
        {
          shops: {
            some: {
              id: product.shopId
            }
          },
          status: 'enabled',
          OR: activeDateConditions
        }
      ]
    };

    // If not the product owner, limit to only show admin and own rules
    if (!isProductOwner) {
      whereConditions.OR = [
        // Admin created rules for this product
        {
          products: {
            some: {
              id: productId
            }
          },
          creatorType: 'admin',
          AND: {
            OR: activeDateConditions
          }
        },
        // Rules created by this vendor
        { 
          creatorType: 'user',
          creatorId: currentUserId,
          AND: {
            OR: activeDateConditions
          }
        },
        // Include rules associated with the vendor of the product
        {
          vendorId: product.shop.vendorId,
          status: 'enabled',
          OR: activeDateConditions
        },
        // Include rules associated with the shop of the product
        {
          shops: {
            some: {
              id: product.shopId
            }
          },
          status: 'enabled',
          OR: activeDateConditions
        }
      ];
    }

    const [rules, totalCount] = await Promise.all([
      prisma.priceRule.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          vendorGroup: true,
          vendor: true,
          products: {
            include: {
              shop: true
            }
          },
          variants: {
            include: {
              attributeValues: {
                include: {
                  attribute: true
                }
              }
            }
          },
          shops: true
        }
      }),
      prisma.priceRule.count({
        where: whereConditions
      })
    ]);

    return createPaginatedResponse(rules, totalCount, paginationParams);
  }

  // Default query for public access
  const whereConditions = {
    status: 'enabled',
    products: {
      some: {
        id: productId
      }
    },
    OR: activeDateConditions
  };

  const [rules, totalCount] = await Promise.all([
    prisma.priceRule.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [actualSortBy]: sortOrder },
      include: {
        vendorGroup: true,
        vendor: true,
        products: {
          include: {
            shop: true
          }
        },
        variants: {
          include: {
            attributeValues: {
              include: {
                attribute: true
              }
            }
          }
        },
        shops: true
      }
    }),
    prisma.priceRule.count({
      where: whereConditions
    })
  ]);

  return createPaginatedResponse(rules, totalCount, paginationParams);
}

/**
 * Find active price rules for a specific product variant
 * @param prisma The Prisma service instance
 * @param variantId ID of the variant to find rules for
 * @param paginationDto Optional pagination parameters
 * @param currentUserId Optional ID of the current user for filtering
 * @param currentUserType Optional type of the current user ('admin' or 'user') for filtering
 * @param currentUserRole Optional role of the current user for additional permission checks
 * @returns Paginated list of price rules that apply to the variant
 */
export async function findActiveRulesForVariant(
  prisma: PrismaService, 
  variantId: number, 
  paginationDto?: PaginationDto,
  currentUserId?: number,
  currentUserType?: string,
  currentUserRole?: string
) {
  const paginationParams = preparePaginationParams(
    paginationDto,
    'createdAt',
    ['id', 'name', 'type', 'value', 'minQuantity', 'createdAt']
  );
    
  const { skip, limit, sortOrder, actualSortBy } = paginationParams;

  // First verify the variant exists
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: {
      product: {
        include: {
          shop: {
            select: {
              id: true,
              vendorId: true
            }
          }
        }
      }
    }
  });

  if (!variant) {
    throw new NotFoundException(`Variant with ID ${variantId} not found`);
  }

  // For admins, show all applicable rules
  if (currentUserType === 'admin' || currentUserRole === 'admin' || currentUserRole === 'superadmin') {
    const whereConditions = {
      status: 'enabled',
      OR: [
        // Variant-specific rules
        {
          variants: {
            some: {
              id: variantId
            }
          }
        },
        // Product-level rules
        {
          products: {
            some: {
              id: variant.product.id
            }
          }
        }
      ],
      AND: {
        OR: activeDateConditions
      }
    };

    const [rules, totalCount] = await Promise.all([
      prisma.priceRule.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          vendorGroup: true,
          vendor: true,
          products: {
            include: {
              shop: true
            }
          },
          variants: {
            include: {
              attributeValues: {
                include: {
                  attribute: true
                }
              },
              product: true
            }
          },
          shops: true
        }
      }),
      prisma.priceRule.count({
        where: whereConditions
      })
    ]);

    return createPaginatedResponse(rules, totalCount, paginationParams);
  }
  
  // If this is a vendor request
  if (currentUserType === 'user' && currentUserRole === 'vendor' && currentUserId) {
    // Check if the vendor owns this variant's product
    const vendor = await prisma.vendor.findFirst({
      where: { userId: currentUserId },
      select: { id: true }
    });
    
    const isProductOwner = vendor && variant.product.shop.vendorId === vendor.id;
    
    const whereConditions = {
      status: 'enabled',
      OR: [
        // Variant-specific rules
        {
          variants: {
            some: {
              id: variantId
            }
          }
        },
        // Product-level rules
        {
          products: {
            some: {
              id: variant.product.id
            }
          }
        },
        // Own rules if owner
        ...(isProductOwner ? [
          { 
            creatorType: 'user',
            creatorId: currentUserId
          }
        ] : []),
        // Admin rules are always visible
        { creatorType: 'admin' }
      ],
      AND: {
        OR: activeDateConditions
      }
    };

    const [rules, totalCount] = await Promise.all([
      prisma.priceRule.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          vendorGroup: true,
          vendor: true,
          products: {
            include: {
              shop: true
            }
          },
          variants: {
            include: {
              attributeValues: {
                include: {
                  attribute: true
                }
              },
              product: true
            }
          },
          shops: true
        }
      }),
      prisma.priceRule.count({
        where: whereConditions
      })
    ]);

    return createPaginatedResponse(rules, totalCount, paginationParams);
  }

  // Default public access - simplified query
  const whereConditions = {
    status: 'enabled',
    OR: [
      // Variant-specific rules
      {
        variants: {
          some: {
            id: variantId
          }
        }
      },
      // Product-level rules
      {
        products: {
          some: {
            id: variant.product.id
          }
        }
      }
    ],
    AND: {
      OR: activeDateConditions
    }
  };

  const [rules, totalCount] = await Promise.all([
    prisma.priceRule.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [actualSortBy]: sortOrder },
      include: {
        vendorGroup: true,
        vendor: true,
        products: {
          include: {
            shop: true
          }
        },
        variants: {
          include: {
            attributeValues: {
              include: {
                attribute: true
              }
            },
            product: true
          }
        },
        shops: true
      }
    }),
    prisma.priceRule.count({
      where: whereConditions
    })
  ]);

  return createPaginatedResponse(rules, totalCount, paginationParams);
}