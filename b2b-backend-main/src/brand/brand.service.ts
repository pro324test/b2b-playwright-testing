import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginationDto, SortDirection } from '../common/dto/pagination.dto';

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) {}

  async create(createBrandDto: any) {
    const existingBrand = await this.prisma.brand.findUnique({
      where: { name: createBrandDto.name }
    });

    if (existingBrand) {
      throw new ConflictException(`Brand with name '${createBrandDto.name}' already exists`);
    }

    return this.prisma.brand.create({
      data: {
        name: createBrandDto.name,
        description: createBrandDto.description,
        website: createBrandDto.website,
        logo: createBrandDto.logoUrl,  // Store the logo URL
        status: 'enabled',
      },
    });
  }

  async findAll(paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.DESC, 
      sortBy = 'createdAt' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;

    // Validate sortBy field to prevent SQL injection
    const validSortFields = ['id', 'name', 'createdAt', 'status'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [brands, totalCount] = await Promise.all([
      this.prisma.brand.findMany({
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortDirection.toLowerCase() },
        include: {
          _count: {
            select: { products: true }
          }
        }
      }),
      this.prisma.brand.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: brands,
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

  async findOne(id: number) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    return brand;
  }

  async update(id: number, updateData: any) {
    await this.findOne(id);

    const data: any = { 
      name: updateData.name, 
      description: updateData.description,
      website: updateData.website
    };

    // Handle logo update options:
    // 1. If logoUrl is provided, update the logo
    if (updateData.logoUrl) {
      data.logo = updateData.logoUrl;
    }
    // 2. If removeLogo is true, set logo to null
    else if (updateData.removeLogo) {
      data.logo = null;
    }
    // 3. Otherwise, leave the logo unchanged

    return this.prisma.brand.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.brand.delete({
      where: { id },
    });
  }
}