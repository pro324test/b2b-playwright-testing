import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto, SortDirection } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    let level = 0;
    if (createCategoryDto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: createCategoryDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
      level = parent.level + 1;
    }

    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        description: createCategoryDto.description,
        parentId: createCategoryDto.parentId,
        level,
        status: 'enabled',
      },
    });
  }

  // Update findAll to support pagination
  async findAll(paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.DESC, 
      sortBy = 'name' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Validate sortBy field to prevent SQL injection
    const validSortFields = ['id', 'name', 'level', 'status']; // Remove createdAt if it doesn't exist
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';
    
    // For hierarchical data, we often want to sort by level first, then by the chosen field
    let orderBy: Prisma.CategoryOrderByWithRelationInput | Prisma.CategoryOrderByWithRelationInput[];
    
    if (actualSortBy === 'level') {
      orderBy = { level: sortOrder };
    } else {
      orderBy = [
        { level: 'asc' as Prisma.SortOrder }, // Always sort by level ascending first
        { [actualSortBy]: sortOrder }
      ];
    }

    const [categories, totalCount] = await Promise.all([
      this.prisma.category.findMany({
        skip,
        take: limit,
        orderBy,
        include: {
          parent: true,
          children: {
            take: 5 // Limit the number of children to prevent huge responses
          },
          _count: {
            select: { products: true, children: true }
          }
        },
      }),
      this.prisma.category.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: categories,
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
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  // Fix the same issue in getRootCategories
  async getRootCategories(paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.DESC, 
      sortBy = 'name' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Validate sortBy field - remove createdAt if it doesn't exist in your schema
    const validSortFields = ['id', 'name', 'status', 'level'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';

    const [rootCategories, totalCount] = await Promise.all([
      this.prisma.category.findMany({
        where: { parentId: null },
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          children: {
            take: 5 // Limit children to prevent large responses
          },
          _count: {
            select: { products: true, children: true }
          }
        },
      }),
      this.prisma.category.count({ where: { parentId: null } })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: rootCategories,
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

  // Fix the same issue in getSubcategories
  async getSubcategories(parentId: number, paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.DESC, 
      sortBy = 'name' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Check if parent category exists
    const parentExists = await this.prisma.category.findUnique({
      where: { id: parentId }
    });

    if (!parentExists) {
      throw new NotFoundException('Parent category not found');
    }

    // Validate sortBy field
    const validSortFields = ['id', 'name', 'level', 'status']; // Remove createdAt if it doesn't exist
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';

    const [subcategories, totalCount] = await Promise.all([
      this.prisma.category.findMany({
        where: { parentId },
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          children: {
            take: 5
          },
          _count: {
            select: { products: true, children: true }
          }
        },
      }),
      this.prisma.category.count({ where: { parentId } })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: subcategories,
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

  // Other methods remain unchanged
  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    // Existing update functionality
    const category = await this.findOne(id);

    if (updateCategoryDto.parentId) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const descendants = await this.getAllDescendants(id);
      if (descendants.some(desc => desc.id === updateCategoryDto.parentId)) {
        throw new BadRequestException('Cannot set a descendant as parent');
      }

      const newParent = await this.prisma.category.findUnique({
        where: { id: updateCategoryDto.parentId },
      });

      if (!newParent) {
        throw new NotFoundException('Parent category not found');
      }

      await this.prisma.category.update({
        where: { id },
        data: {
          parentId: newParent.id,
          level: newParent.level + 1,
        },
      });

      await this.updateDescendantLevels(category);
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: updateCategoryDto.name,
        description: updateCategoryDto.description,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  private async getAllDescendants(categoryId: number) {
    const children = await this.prisma.category.findMany({
      where: { parentId: categoryId },
    });

    let descendants = [...children];
    for (const child of children) {
      const childDescendants = await this.getAllDescendants(child.id);
      descendants = [...descendants, ...childDescendants];
    }

    return descendants;
  }

  private async updateDescendantLevels(category: any) {
    const children = await this.prisma.category.findMany({
      where: { parentId: category.id },
    });

    for (const child of children) {
      await this.prisma.category.update({
        where: { id: child.id },
        data: { level: category.level + 1 },
      });
      await this.updateDescendantLevels(child);
    }
  }

  async enable(id: number) {
    return this.prisma.category.update({
      where: { id },
      data: { status: 'enabled' },
    });
  }

  async disable(id: number) {
    return this.prisma.category.update({
      where: { id },
      data: { status: 'disabled' },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.category.delete({
      where: { id },
    });
  }

  /**
   * Get a category by ID with its full children hierarchy
   */
  async getCategoryWithChildren(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          include: {
            children: {
              include: {
                children: {
                  include: {
                    _count: {
                      select: { products: true, children: true }
                    }
                  }
                },
                _count: {
                  select: { products: true, children: true }
                }
              }
            },
            _count: {
              select: { products: true, children: true }
            }
          }
        },
        _count: {
          select: { products: true, children: true }
        }
      }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }
}