// src/banner/banner.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerTypeDto } from './dto/create-banner-type.dto';
import { UpdateBannerTypeDto } from './dto/update-banner-type.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { PaginationDto, SortDirection } from '../common/dto/pagination.dto';

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}

  // Banner Type operations (Admin only)
  async createBannerType(createBannerTypeDto: CreateBannerTypeDto) {
    return this.prisma.bannerType.create({
      data: createBannerTypeDto,
    });
  }

  async findAllBannerTypes(paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.DESC, 
      sortBy = 'createdAt' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;

    // Validate sortBy field to prevent SQL injection
    const validSortFields = ['id', 'name', 'createdAt', 'width', 'height', 'status'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [bannerTypes, totalCount] = await Promise.all([
      this.prisma.bannerType.findMany({
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortDirection.toLowerCase() },
        include: {
          _count: {
            select: { banners: true }
          }
        }
      }),
      this.prisma.bannerType.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: bannerTypes,
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

  async findOneBannerType(id: number) {
    const bannerType = await this.prisma.bannerType.findUnique({
      where: { id },
      include: {
        banners: true,
        _count: {
          select: { banners: true }
        }
      }
    });
    
    if (!bannerType) {
      throw new NotFoundException(`Banner type with ID ${id} not found`);
    }
    
    return bannerType;
  }

  async updateBannerType(id: number, updateBannerTypeDto: UpdateBannerTypeDto) {
    await this.findOneBannerType(id);
    
    return this.prisma.bannerType.update({
      where: { id },
      data: updateBannerTypeDto,
    });
  }

  async removeBannerType(id: number) {
    const bannerType = await this.findOneBannerType(id);
    
    // Check if there are banners using this type
    if (bannerType._count.banners > 0) {
      throw new ForbiddenException('Cannot delete banner type that has banners');
    }
    
    return this.prisma.bannerType.delete({
      where: { id },
    });
  }

  // Banner operations (Shop owners)
  async createBanner(createBannerDto: CreateBannerDto) {
    // Check if banner type exists
    const bannerType = await this.prisma.bannerType.findUnique({
      where: { id: createBannerDto.bannerTypeId },
    });
    
    if (!bannerType) {
      throw new NotFoundException(`Banner type with ID ${createBannerDto.bannerTypeId} not found`);
    }
    
    // Check if shop exists
    const shop = await this.prisma.shop.findUnique({
      where: { id: createBannerDto.shopId },
    });
    
    if (!shop) {
      throw new NotFoundException(`Shop with ID ${createBannerDto.shopId} not found`);
    }
    
    // Create a properly typed data object for Prisma
    const bannerData = {
      title: createBannerDto.title,
      description: createBannerDto.description,
      imageUrl: createBannerDto.imageUrl!, // Using non-null assertion since this will be set by controller
      link: createBannerDto.link,
      startDate: createBannerDto.startDate ? new Date(createBannerDto.startDate) : null,
      endDate: createBannerDto.endDate ? new Date(createBannerDto.endDate) : null,
      bannerTypeId: createBannerDto.bannerTypeId,
      shopId: createBannerDto.shopId,
      status: 'active' // Default status
    };
    
    return this.prisma.banner.create({
      data: bannerData,
      include: {
        bannerType: true,
        shop: true
      }
    });
  }

  async findAllShopBanners(shopId: number, paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.DESC, 
      sortBy = 'createdAt' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;

    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId }
    });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${shopId} not found`);
    }

    // Validate sortBy field to prevent SQL injection
    const validSortFields = ['id', 'title', 'createdAt', 'startDate', 'endDate', 'status'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [banners, totalCount] = await Promise.all([
      this.prisma.banner.findMany({
        where: { shopId },
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortDirection.toLowerCase() },
        include: {
          bannerType: true,
        },
      }),
      this.prisma.banner.count({
        where: { shopId }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: banners,
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

  async findOneBanner(id: number) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
      include: {
        bannerType: true,
        shop: true,
      },
    });
    
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    
    return banner;
  }

  async updateBanner(id: number, updateBannerDto: UpdateBannerDto) {
    await this.findOneBanner(id);
    
    return this.prisma.banner.update({
      where: { id },
      data: updateBannerDto,
      include: {
        bannerType: true,
      },
    });
  }

  async removeBanner(id: number) {
    await this.findOneBanner(id);
    
    return this.prisma.banner.delete({
      where: { id },
    });
  }
  
  // Active banners for public access
  async getActiveBanners(shopId?: number, paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.DESC, 
      sortBy = 'createdAt' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const today = new Date();
    
    const whereClause: any = {
      status: 'active',
      OR: [
        {
          startDate: { lte: today },
          endDate: { gte: today },
        },
        {
          startDate: null,
          endDate: null,
        },
        {
          startDate: null,
          endDate: { gte: today },
        },
        {
          startDate: { lte: today },
          endDate: null,
        },
      ],
    };
    
    if (shopId) {
      whereClause.shopId = shopId;
    }

    // Validate sortBy field to prevent SQL injection
    const validSortFields = ['id', 'title', 'createdAt', 'startDate', 'endDate'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    const [banners, totalCount] = await Promise.all([
      this.prisma.banner.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          bannerType: true,
          shop: {
            select: {
              id: true,
              name: true,
              status: true,
              logoUrl: true
            }
          }
        },
        orderBy: {
          [actualSortBy]: sortDirection.toLowerCase(),
        },
      }),
      this.prisma.banner.count({
        where: whereClause
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: banners,
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