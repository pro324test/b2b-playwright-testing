import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { RespondShopRequestDto } from './dto/respond-shop-request.dto';
import { PaginationDto, SortDirection } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  // Update the createShop method to include logoUrl
  async createShop(userId: number, createShopDto: CreateShopDto) {
    // First find the vendor record
    const vendor = await this.prisma.vendor.findFirst({
      where: {
        userId: userId
      }
    });

    if (!vendor) {
      throw new NotFoundException('Vendor profile not found. Please complete vendor registration first.');
    }

    try {
      // Create shop in a transaction
      return await this.prisma.$transaction(async (tx) => {
        // Create the shop
        const shop = await tx.shop.create({
          data: {
            name: createShopDto.name,
            description: createShopDto.description,
            logoUrl: createShopDto.logoUrl,
            vendor: { 
              connect: { 
                id: vendor.id 
              } 
            },
            status: 'pending'
          },
          include: {
            vendor: {
              include: { 
                user: true 
              }
            }
          }
        });

        // If city IDs are provided, create shop-city relationships
        if (createShopDto.cityIds && createShopDto.cityIds.length > 0) {
          // Create shop-city relationships
          await tx.shopCity.createMany({
            data: createShopDto.cityIds.map(cityId => ({
              shopId: shop.id,
              cityId
            }))
          });
        }

        return shop;
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new BadRequestException('Failed to create shop: Vendor not found');
      }
      throw error;
    }
  }

  async respondShopRequest(shopId: number, respondShopRequestDto: RespondShopRequestDto) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      include: { vendor: true }
    });

    if (!shop) {
      throw new NotFoundException('Shop request not found');
    }

    if (shop.status !== 'pending') {
      throw new BadRequestException('Can only respond to pending shop requests');
    }

    return this.prisma.shop.update({
      where: { id: shopId },
      data: {
        status: respondShopRequestDto.response === 'accept' ? 'enabled' : 'rejected',
        respondedAt: new Date()
      }
    });
  }

  // Add pagination to getAllShopRequests
  async getAllShopRequests(paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.DESC, 
      sortBy = 'createdAt' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Validate sortBy field to prevent SQL injection
    const validSortFields = ['id', 'name', 'createdAt'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [shopRequests, totalCount] = await Promise.all([
      this.prisma.shop.findMany({
        where: { status: 'pending' },
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          vendor: {
            include: { user: true }
          }
        }
      }),
      this.prisma.shop.count({
        where: { status: 'pending' }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: shopRequests,
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

  // Add pagination to getAllShopsPublic
  async getAllShopsPublic(paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.ASC, 
      sortBy = 'name' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Validate sortBy field
    const validSortFields = ['id', 'name'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';

    const [shops, totalCount] = await Promise.all([
      this.prisma.shop.findMany({
        where: { status: 'enabled' },
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          description: true,
          logoUrl: true,
          status: true, // Ensure status is included
          vendor: {
            select: {
              id: true,
              user: {
                select: {
                  username: true
                }
              }
            }
          }
        }
      }),
      this.prisma.shop.count({
        where: { status: 'enabled' }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: shops,
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

  // Add pagination and state filtering to getAllShopsAdmin
  async getAllShopsAdmin(paginationDto?: PaginationDto, state?: string) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.ASC, 
      sortBy = 'status' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Validate sortBy field
    const validSortFields = ['id', 'name', 'status', 'createdAt'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'status';

    // Build where clause based on state filter
    const whereClause: Prisma.ShopWhereInput = {};
    if (state) {
      whereClause.status = state.toLowerCase();
    }

    const [shops, totalCount] = await Promise.all([
      this.prisma.shop.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          vendor: {
            include: { 
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  role: true
                }
              } 
            }
          }
        }
      }),
      this.prisma.shop.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: shops,
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

  async findOneShop(id: number) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        vendor: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true
              }
            }
          }
        },
        products: {
          include: {
            images: {
              where: { imageType: 'main' },
              take: 1
            },
            inventory: true
          },
          take: 10 // Limit to recent products
        }
      }
    });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${id} not found`);
    }

    return shop;
  }

  async updateShop(id: number, updateShopDto: UpdateShopDto, userId: number, isAdminUser = false) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: { vendor: true }
    });
  
    if (!shop) {
      throw new NotFoundException(`Shop with ID ${id} not found`);
    }
  
    // If it's an admin user, allow the update without checking ownership
    if (!isAdminUser) {
      // For regular users, check if they own the shop (vendor check)
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId }
      });
  
      if (!vendor || shop.vendorId !== vendor.id) {
        throw new ForbiddenException('You can only update your own shops');
      }
    }
  
    // Update shop and city relationships in a transaction
    return await this.prisma.$transaction(async (tx) => {
      // Update shop data
      const updatedShop = await tx.shop.update({
        where: { id },
        data: {
          name: updateShopDto.name,
          description: updateShopDto.description,
          logoUrl: updateShopDto.logoUrl
        },
        include: {
          vendor: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  role: true
                }
              }
            }
          }
        }
      });
  
      // If cityIds are provided, update the shop-city relationships
      if (updateShopDto.cityIds !== undefined) {
        await this.updateShopCities(id, updateShopDto.cityIds);
      }
  
      return updatedShop;
    });
  }

  async enableShop(id: number, userId?: number) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: { vendor: true }
    });
  
    if (!shop) {
      throw new NotFoundException(`Shop with ID ${id} not found`);
    }
  
    // Only admins can enable shops in 'pending' state or 'rejected' state
    if ((shop.status === 'pending' || shop.status === 'rejected') && userId) {
      throw new ForbiddenException('Cannot enable shops in pending or rejected state. Shop must be reviewed and accepted by admin first.');
    }
  
    // If userId is provided (vendor request), verify ownership
    if (userId) {
      if (shop.vendor.userId !== userId) {
        throw new ForbiddenException('You can only enable your own shops');
      }
      
      // Vendors can only enable shops that were previously 'disabled'
      if (shop.status !== 'disabled') {
        throw new ForbiddenException('You can only enable shops that were previously disabled');
      }
    }
  
    // Check if vendor is not disabled
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: shop.vendorId }
    });
  
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
  
    if (vendor.isDisabled) {
      throw new BadRequestException('Cannot enable shop when vendor is disabled');
    }
  
    return this.prisma.shop.update({
      where: { id },
      data: { status: 'enabled' }
    });
  }
  
  async disableShop(id: number, userId?: number) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: { vendor: true }
    });
  
    if (!shop) {
      throw new NotFoundException(`Shop with ID ${id} not found`);
    }
  
    // If userId is provided (vendor request), verify ownership
    if (userId) {
      if (shop.vendor.userId !== userId) {
        throw new ForbiddenException('You can only disable your own shops');
      }
    }
  
    return this.prisma.shop.update({
      where: { id },
      data: { status: 'disabled' }
    });
  }

  async deleteShop(id: number, userId: number) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        vendor: true,
        products: { select: { id: true } }
      }
    });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${id} not found`);
    }

    // Check if user is owner or admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (shop.vendor.userId !== userId && !['admin', 'superadmin'].includes(user.role)) {
      throw new ForbiddenException('You can only delete your own shops');
    }

    // Check if shop has products
    if (shop.products.length > 0) {
      throw new BadRequestException('Cannot delete shop with products. Delete all products first or disable the shop instead.');
    }

    await this.prisma.shop.delete({
      where: { id }
    });
  }

  // Add pagination to getVendorShops
  async getVendorShops(vendorId: number, userId?: number, paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.ASC, 
      sortBy = 'name' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Validate sortBy field
    const validSortFields = ['id', 'name', 'status', 'createdAt'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';

    // First, check if the vendor exists
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    // Check if user is requesting their own shops
    const isOwnRequest = vendor.userId === userId;
    
    // If not own request, only return enabled shops (unless admin)
    const statusFilter = isOwnRequest ? {} : { status: 'enabled' };

    const [shops, totalCount] = await Promise.all([
      this.prisma.shop.findMany({
        where: {
          vendorId,
          ...statusFilter
        },
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          vendor: {
            include: {
              user: {
                select: {
                  username: true,
                  email: true
                }
              }
            }
          },
          products: {
            select: {
              id: true
            }
          }
        }
      }),
      this.prisma.shop.count({
        where: {
          vendorId,
          ...statusFilter
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: shops,
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

  async checkPendingShopRequest(userId: number) {
    // First, find the vendor ID for this user
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId }
    });
    
    if (!vendor) {
      return {
        hasPendingRequest: false,
        message: 'User is not a vendor'
      };
    }
    
    // Check if the vendor has any pending shop requests
    const pendingShop = await this.prisma.shop.findFirst({
      where: {
        vendorId: vendor.id,
        status: 'pending'
      },
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });
    
    if (!pendingShop) {
      return {
        hasPendingRequest: false,
        message: 'No pending shop requests found'
      };
    }
    
    return {
      hasPendingRequest: true,
      message: 'Pending shop request found',
      requestDetails: pendingShop
    };
  }

  /**
   * Update the cities where a shop delivers to
   */
  private async updateShopCities(shopId: number, cityIds: number[]) {
    // First verify that all city IDs are valid
    const cities = await this.prisma.city.findMany({
      where: {
        id: { in: cityIds },
        isActive: true
      },
      select: { id: true }
    });

    if (cities.length !== cityIds.length) {
      throw new BadRequestException('One or more city IDs are invalid or inactive');
    }

    // Delete existing relationships
    await this.prisma.shopCity.deleteMany({
      where: { shopId }
    });

    // Create new relationships
    if (cityIds.length > 0) {
      await this.prisma.shopCity.createMany({
        data: cityIds.map(cityId => ({ shopId, cityId }))
      });
    }
  }

  /**
   * Get the cities where a shop delivers to
   */
  async getShopCities(shopId: number) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        cities: {
          include: {
            city: {
              select: {
                id: true,
                name: true,
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${shopId} not found`);
    }

    return shop.cities.map(sc => sc.city);
  }

  /**
   * Find all shops that deliver to a specific city
   */
  async getShopsInCity(cityId: number, paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.ASC, 
      sortBy = 'name' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Validate sortBy field to prevent SQL injection
    const validSortFields = ['id', 'name', 'createdAt'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';

    // First check if the city exists and is active
    const city = await this.prisma.city.findUnique({
      where: { 
        id: cityId,
        isActive: true
      }
    });

    if (!city) {
      throw new NotFoundException(`City with ID ${cityId} not found or is inactive`);
    }

    const [shops, totalCount] = await Promise.all([
      this.prisma.shop.findMany({
        where: { 
          status: 'enabled',
          cities: {
            some: {
              cityId
            }
          }
        },
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          vendor: {
            select: {
              id: true,
              user: {
                select: {
                  username: true
                }
              }
            }
          }
        }
      }),
      this.prisma.shop.count({
        where: { 
          status: 'enabled',
          cities: {
            some: {
              cityId
            }
          }
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: shops,
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
}