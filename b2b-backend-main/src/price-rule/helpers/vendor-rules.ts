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
 * Find active price rules for a specific vendor group
 * @param prisma The Prisma service instance
 * @param vendorGroupId ID of the vendor group to find rules for
 * @param paginationDto Optional pagination parameters
 * @param currentUserId Optional ID of the current user for filtering
 * @param currentUserType Optional type of the current user ('admin' or 'user')
 * @param currentUserRole Optional role of the current user 
 * @returns Paginated list of price rules that apply to the vendor group
 */
export async function findActiveRulesForVendorGroup(
  prisma: PrismaService, 
  vendorGroupId: number, 
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

  // Admins can see all rules
  if (currentUserType === 'admin' || currentUserRole === 'admin' || currentUserRole === 'superadmin') {
    // Base query conditions with just status and date filters
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
  
  // If user is a vendor, they should see rules in separate conditions
  if (currentUserType === 'user' && currentUserRole === 'vendor' && currentUserId) {
    const whereConditions = {
      status: 'enabled',
      OR: [
        // Group-specific rules with active dates
        {
          vendorGroupId,
          OR: activeDateConditions
        },
        // Admin-created rules
        { 
          creatorType: 'admin',
          OR: activeDateConditions 
        },
        // Rules created by this vendor
        { 
          creatorType: 'user',
          creatorId: currentUserId,
          OR: activeDateConditions 
        }
      ]
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

  // Default conditions for non-specific users (public access)
  const whereConditions = {
    status: 'enabled',
    vendorGroupId,
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

/**
 * Find active price rules for a specific vendor
 * @param prisma The Prisma service instance
 * @param vendorId ID of the vendor to find rules for
 * @param paginationDto Optional pagination parameters
 * @param currentUserId Optional ID of the current user for filtering
 * @param currentUserType Optional type of the current user ('admin' or 'user')
 * @param currentUserRole Optional role of the current user
 * @returns Paginated list of price rules that apply to the vendor
 */
export async function findActiveRulesForVendor(
  prisma: PrismaService, 
  vendorId: number, 
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

  // Verify vendor exists
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { id: true, userId: true }
  });

  if (!vendor) {
    throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
  }

  // Get shops for this vendor
  const shops = await prisma.shop.findMany({
    where: { vendorId },
    select: { id: true }
  });
  
  // Get shop IDs
  const shopIds = shops.map(shop => shop.id);

  // If vendor has no shops, return empty array
  if (shopIds.length === 0) {
    return createPaginatedResponse([], 0, paginationParams);
  }

  // Admins can see all rules
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

  // If this is the vendor viewing their own rules
  if (currentUserType === 'user' && currentUserRole === 'vendor' && currentUserId && vendor.userId === currentUserId) {
    const whereConditions = {
      status: 'enabled',
      OR: [
        // Rules for this vendor's products
        {
          products: {
            some: {
              shop: {
                id: {
                  in: shopIds
                }
              }
            }
          },
          OR: activeDateConditions
        },
        // Rules explicitly associated with this vendor
        {
          vendorId: vendorId,
          OR: activeDateConditions
        },
        // Admin-created rules
        { 
          creatorType: 'admin',
          OR: activeDateConditions 
        },
        // Rules created by this vendor
        { 
          creatorType: 'user',
          creatorId: currentUserId,
          OR: activeDateConditions 
        }
      ]
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
  
  // Different vendor viewing another vendor's rules
  if (currentUserType === 'user' && currentUserRole === 'vendor' && currentUserId) {
    const whereConditions = {
      status: 'enabled',
      OR: [
        // Admin-created rules
        { 
          creatorType: 'admin',
          OR: activeDateConditions 
        },
        // Rules created by this vendor
        { 
          creatorType: 'user',
          creatorId: currentUserId,
          OR: activeDateConditions 
        },
        // Public rules for this vendor's products
        {
          products: {
            some: {
              shop: {
                id: {
                  in: shopIds
                }
              }
            }
          },
          creatorType: 'admin', // Only admin created rules for other vendors' products
          OR: activeDateConditions
        }
      ]
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

  // Default public access
  const whereConditions = {
    status: 'enabled',
    OR: [
      // Product-specific rules for this vendor
      {
        products: {
          some: {
            shop: {
              id: {
                in: shopIds
              }
            }
          }
        },
        OR: activeDateConditions
      },
      // Vendor-specific rules
      {
        vendorId,
        OR: activeDateConditions
      }
    ]
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

/**
 * Find active price rules for a specific shop
 * @param prisma The Prisma service instance
 * @param shopId ID of the shop to find rules for
 * @param paginationDto Optional pagination parameters
 * @param currentUserId Optional ID of the current user for filtering
 * @param currentUserType Optional type of the current user ('admin' or 'user')
 * @param currentUserRole Optional role of the current user
 * @returns Paginated list of price rules that apply to the shop
 */
export async function findActiveRulesForShop(
  prisma: PrismaService, 
  shopId: number, 
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

  // Verify shop exists and get owner info
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      vendor: true
    }
  });

  if (!shop) {
    throw new NotFoundException(`Shop with ID ${shopId} not found`);
  }

  // Admins can see all rules
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

  // If this is the shop owner viewing rules
  if (currentUserType === 'user' && 
      currentUserRole === 'vendor' && 
      currentUserId && 
      shop.vendor.userId === currentUserId) {
    const whereConditions = {
      status: 'enabled',
      OR: [
        // Rules for this shop's products
        {
          products: {
            some: {
              shopId
            }
          },
          OR: activeDateConditions
        },
        // Admin-created rules
        { 
          creatorType: 'admin',
          OR: activeDateConditions 
        },
        // Rules created by this vendor
        { 
          creatorType: 'user',
          creatorId: currentUserId,
          OR: activeDateConditions 
        },
        // Public rules for this shop's products
        {
          products: {
            some: {
              shopId
            }
          },
          creatorType: 'admin', // Only admin created rules for other shops
          OR: activeDateConditions
        }
      ]
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
  
  // Another vendor viewing this shop's rules
  if (currentUserType === 'user' && 
      currentUserRole === 'vendor' && 
      currentUserId) {
    const whereConditions = {
      status: 'enabled',
      OR: [
        // Admin-created rules
        { 
          creatorType: 'admin',
          OR: activeDateConditions 
        },
        // Rules created by this vendor
        { 
          creatorType: 'user',
          creatorId: currentUserId,
          OR: activeDateConditions 
        },
        // Public rules for this shop's products
        {
          products: {
            some: {
              shopId
            }
          },
          creatorType: 'admin', // Only admin created rules for other shops
          OR: activeDateConditions
        }
      ]
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

  // Default public access
  const whereConditions = {
    status: 'enabled',
    OR: [
      // Rules for products in this shop
      {
        products: {
          some: {
            shopId
          }
        },
        OR: activeDateConditions
      },
      // Rules explicitly associated with this shop
      {
        shops: {
          some: {
            id: shopId
          }
        },
        OR: activeDateConditions
      },
      // Rules that apply to all shops of the vendor
      {
        vendorId: shop.vendorId,
        shops: { none: {} }, // No specific shop associations
        OR: activeDateConditions
      }
    ]
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

/**
 * Fetch all price rules with optional inactive rule inclusion
 * @param prisma The Prisma service instance
 * @param includeInactive Whether to include inactive rules
 * @param paginationDto Optional pagination parameters
 * @param currentUserId Optional ID of the current user for filtering
 * @param currentUserType Optional type of the current user ('admin' or 'user') 
 * @param currentUserRole Optional role of the current user
 * @returns Paginated list of price rules
 */
export async function findAll(
  prisma: PrismaService, 
  includeInactive = false, 
  paginationDto?: PaginationDto,
  currentUserId?: number,
  currentUserType?: string,
  currentUserRole?: string
) {
  const paginationParams = preparePaginationParams(
    paginationDto,
    'createdAt',
    ['id', 'name', 'type', 'value', 'minQuantity', 'createdAt', 'status']
  );
  
  const { skip, limit, sortOrder, actualSortBy } = paginationParams;
  
  // Admins can see all rules
  if (currentUserType === 'admin' || currentUserRole === 'admin' || currentUserRole === 'superadmin') {
    const whereConditions = includeInactive ? {} : { status: 'enabled' };

    const [priceRules, totalCount] = await Promise.all([
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
      prisma.priceRule.count({ where: whereConditions })
    ]);

    return createPaginatedResponse(priceRules, totalCount, paginationParams);
  }
  
  // If user is a vendor, they should see rules with revised structure
  if (currentUserType === 'user' && currentUserRole === 'vendor' && currentUserId) {
    // First get this vendor's information
    const vendor = await prisma.vendor.findFirst({
      where: { userId: currentUserId },
      include: {
        shops: {
          select: { id: true }
        }
      }
    });
    
    if (vendor) {
      const shopIds = vendor.shops.map(shop => shop.id);
      
      const whereConditions = {
        ...(includeInactive ? {} : { status: 'enabled' }),
        OR: [
          // Rules created by this vendor
          { 
            creatorType: 'user',
            creatorId: currentUserId
          },
          // Admin-created rules
          { 
            creatorType: 'admin'
          },
          // Rules for this vendor's products
          {
            products: {
              some: {
                shop: {
                  id: {
                    in: shopIds
                  }
                }
              }
            }
          }
        ]
      };

      const [priceRules, totalCount] = await Promise.all([
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
        prisma.priceRule.count({ where: whereConditions })
      ]);

      return createPaginatedResponse(priceRules, totalCount, paginationParams);
    }
  }

  // Default public access
  const whereConditions = includeInactive ? {} : { status: 'enabled' };

  const [priceRules, totalCount] = await Promise.all([
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
    prisma.priceRule.count({ where: whereConditions })
  ]);

  return createPaginatedResponse(priceRules, totalCount, paginationParams);
}

/**
 * Find price rules specifically for the authenticated vendor
 */
export async function findMyRules(
  prisma: PrismaService, 
  vendorId: number, 
  paginationDto?: PaginationDto,
  userId?: number
) {
  const paginationParams = preparePaginationParams(
    paginationDto,
    'createdAt',
    ['id', 'name', 'type', 'value', 'minQuantity', 'createdAt']
  );
    
  const { skip, limit, sortOrder, actualSortBy } = paginationParams;

  // Get shops for this vendor
  const shops = await prisma.shop.findMany({
    where: { vendorId },
    select: { id: true }
  });
  
  // Get shop IDs
  const shopIds = shops.map(shop => shop.id);

  // If vendor has no shops, return empty array
  if (shopIds.length === 0) {
    return createPaginatedResponse([], 0, paginationParams);
  }

  // Custom condition specifically for "My Rules" endpoint
  const whereConditions = {
    status: 'enabled',
    OR: [
      // Rules created by this vendor
      { 
        creatorType: 'user',
        creatorId: userId
      },
      // Rules specifically targeting this vendor
      {
        vendorId: vendorId
      },
      // Rules for this vendor's shops
      {
        shops: {
          some: {
            id: {
              in: shopIds
            }
          }
        }
      },
      // Rules for this vendor's products
      {
        products: {
          some: {
            shop: {
              id: {
                in: shopIds
              }
            }
          }
        }
      }
    ]
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