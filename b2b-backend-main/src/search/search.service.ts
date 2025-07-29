import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchQueryDto, SearchType } from './dto/search.dto';
import { Prisma } from '@prisma/client';
import { SortDirection } from '../common/dto/pagination.dto';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(searchDto: SearchQueryDto) {
    const { query, type, category, brand, page = 1, limit = 10, sortBy = 'relevance', sortDirection = SortDirection.DESC } = searchDto;

    // Pass sortDirection as SortDirection enum, not string
    switch (type) {
      case SearchType.PRODUCTS:
        return this.searchProducts(query, { page, limit, sortBy, sortDirection }, category, brand);
      case SearchType.SHOPS:
        return this.searchShops(query, { page, limit, sortBy, sortDirection });
      case SearchType.VENDORS:
        return this.searchVendors(query, { page, limit, sortBy, sortDirection });
      case SearchType.ALL:
      default:
        return this.searchAll(query, { page, limit, sortBy, sortDirection }, category, brand);
    }
  }

  private async searchProducts(
    query: string, 
    pagination: { page: number; limit: number; sortBy: string; sortDirection: SortDirection },
    category?: string, 
    brand?: string
  ) {
    const { page, limit, sortBy, sortDirection } = pagination;
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Define where clause with proper typing for Prisma
    const whereClause: Prisma.ProductWhereInput = {
      AND: [
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        ...(category ? [{
          categories: {
            some: {
              id: parseInt(category)
            }
          }
        }] : []),
        ...(brand ? [{ brandId: parseInt(brand) }] : []),
        { status: 'enabled' } // Only return enabled products
      ],
    };

    // Define dynamic orderBy
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    const validSortFields = ['name', 'basePrice', 'createdAt'];
    
    if (sortBy === 'relevance') {
      // For relevance, we'll use name similarity as proxy
      orderBy = { name: sortOrder };
    } else if (validSortFields.includes(sortBy)) {
      orderBy = { [sortBy]: sortOrder };
    } else {
      orderBy = { createdAt: sortOrder };
    }

    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy,
        include: {
          categories: true,
          brand: true,
          shop: {
            include: {
              vendor: true,
            },
          },
          images: {
            where: { imageType: 'main' },
            take: 1
          },
          inventory: true
        },
      }),
      this.prisma.product.count({
        where: whereClause
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: products,
      meta: {
        totalItems: totalCount,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        sortBy: sortBy,
        sortDirection
      }
    };
  }

  private async searchShops(
    query: string,
    pagination: { page: number; limit: number; sortBy: string; sortDirection: SortDirection }
  ) {
    const { page, limit, sortBy, sortDirection } = pagination;
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Fix typing for Prisma shop queries
    const whereClause: Prisma.ShopWhereInput = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
      status: 'enabled',
    };

    // Define dynamic orderBy
    let orderBy: Prisma.ShopOrderByWithRelationInput = {};
    const validSortFields = ['name', 'createdAt'];
    
    if (sortBy === 'relevance') {
      // For relevance, use name similarity
      orderBy = { name: sortOrder };
    } else if (validSortFields.includes(sortBy)) {
      orderBy = { [sortBy]: sortOrder };
    } else {
      orderBy = { createdAt: sortOrder };
    }

    const [shops, totalCount] = await Promise.all([
      this.prisma.shop.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy,
        include: {
          vendor: {
            include: {
              user: {
                select: {
                  username: true
                }
              }
            }
          },
        },
      }),
      this.prisma.shop.count({
        where: whereClause
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
        sortBy: sortBy,
        sortDirection
      }
    };
  }

  private async searchVendors(
    query: string,
    pagination: { page: number; limit: number; sortBy: string; sortDirection: SortDirection }
  ) {
    const { page, limit, sortBy, sortDirection } = pagination;
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Fix typing for Prisma vendor queries
    const whereClause: Prisma.VendorWhereInput = {
      OR: [
        { user: { username: { contains: query, mode: 'insensitive' } } },
        { shops: { some: { name: { contains: query, mode: 'insensitive' } } } }
      ],
      isDisabled: false,
    };

    // Define dynamic orderBy based on user relationship
    let orderBy: Prisma.VendorOrderByWithRelationInput = {};
    
    if (sortBy === 'relevance' || sortBy === 'username') {
      // For relevance or username, sort by user's username
      orderBy = { user: { username: sortOrder } };
    } else {
      orderBy = { id: sortOrder }; // Default ordering
    }

    const [vendors, totalCount] = await Promise.all([
      this.prisma.vendor.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              username: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          shops: {
            take: 5 // Limit to 5 shops per vendor
          },
        },
      }),
      this.prisma.vendor.count({
        where: whereClause
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: vendors,
      meta: {
        totalItems: totalCount,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        sortBy: sortBy,
        sortDirection
      }
    };
  }

  private async searchAll(
    query: string,
    pagination: { page: number; limit: number; sortBy: string; sortDirection: SortDirection },
    category?: string,
    brand?: string
  ) {
    // For "ALL" search, we need to split the pagination across different entities
    // Adjust limits for each entity type to fit within the overall pagination
    const adjustedLimit = Math.max(Math.floor(pagination.limit / 3), 1);
    
    const [products, shops, vendors] = await Promise.all([
      this.searchProducts(query, {...pagination, limit: adjustedLimit}, category, brand),
      this.searchShops(query, {...pagination, limit: adjustedLimit}),
      this.searchVendors(query, {...pagination, limit: adjustedLimit}),
    ]);

    // Calculate combined total items and pages
    const totalItems = products.meta.totalItems + shops.meta.totalItems + vendors.meta.totalItems;
    const totalPages = Math.ceil(totalItems / pagination.limit);

    return {
      products: products.data,
      shops: shops.data,
      vendors: vendors.data,
      meta: {
        totalItems,
        itemsPerPage: pagination.limit,
        currentPage: pagination.page,
        totalPages,
        hasNextPage: pagination.page < totalPages,
        hasPreviousPage: pagination.page > 1,
        productCount: products.meta.totalItems,
        shopCount: shops.meta.totalItems,
        vendorCount: vendors.meta.totalItems,
        sortBy: pagination.sortBy,
        sortDirection: pagination.sortDirection
      }
    };
  }
}