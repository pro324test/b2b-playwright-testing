import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { PaginationDto, SortDirection } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CityService {
  constructor(private prisma: PrismaService) {}

  async create(createCityDto: CreateCityDto) {
    // Check if city with the same name already exists
    const existingCity = await this.prisma.city.findFirst({
      where: { name: createCityDto.name }
    });
    
    if (existingCity) {
      throw new ConflictException(`City with name '${createCityDto.name}' already exists`);
    }

    return this.prisma.city.create({
      data: createCityDto,
    });
  }

  async findAll(paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.ASC, 
      sortBy = 'name' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Validate sortBy field to prevent SQL injection
    const validSortFields = ['id', 'name', 'isActive', 'createdAt', 'updatedAt'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';

    const [cities, totalCount] = await Promise.all([
      this.prisma.city.findMany({
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
      }),
      this.prisma.city.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: cities,
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
    const city = await this.prisma.city.findUnique({
      where: { id },
    });

    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }

    return city;
  }

  async update(id: number, updateCityDto: UpdateCityDto) {
    // Check if city exists
    await this.findOne(id);

    // Check if name is being updated and if it conflicts with an existing city
    if (updateCityDto.name) {
      const existingCity = await this.prisma.city.findFirst({
        where: {
          name: updateCityDto.name,
          NOT: { id }
        }
      });

      if (existingCity) {
        throw new ConflictException(`City with name '${updateCityDto.name}' already exists`);
      }
    }

    return this.prisma.city.update({
      where: { id },
      data: updateCityDto,
    });
  }

  async enable(id: number) {
    // Check if city exists
    await this.findOne(id);

    return this.prisma.city.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async disable(id: number) {
    // Check if city exists
    await this.findOne(id);

    return this.prisma.city.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async remove(id: number) {
    // Check if city exists
    await this.findOne(id);
    
    // Here you would add checks if this city is referenced by other entities
    // For example, if user addresses or shops reference cities

    try {
      return await this.prisma.city.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle foreign key constraint violations
        if (error.code === 'P2003') {
          throw new ConflictException(
            `Cannot delete city with ID ${id} as it is referenced by other records`
          );
        }
      }
      throw error;
    }
  }
}