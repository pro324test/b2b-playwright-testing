import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { PaginationDto, SortDirection } from '../common/dto/pagination.dto';

@Injectable()
export class AttributeService {
  constructor(private prisma: PrismaService) {}

  async create(createAttributeDto: CreateAttributeDto) {
    const existingAttribute = await this.prisma.attribute.findUnique({
      where: { name: createAttributeDto.name },
    });

    if (existingAttribute) {
      throw new ConflictException(`Attribute with name '${createAttributeDto.name}' already exists`);
    }

    return this.prisma.attribute.create({
      data: createAttributeDto,
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
    const validSortFields = ['id', 'name', 'createdAt', 'isEnabled'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [attributes, totalCount] = await Promise.all([
      this.prisma.attribute.findMany({
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortDirection.toLowerCase() },
        include: {
          values: true,
        },
      }),
      this.prisma.attribute.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: attributes,
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
    const attribute = await this.prisma.attribute.findUnique({
      where: { id },
      include: {
        values: true,
      },
    });

    if (!attribute) {
      throw new NotFoundException('Attribute not found');
    }

    return attribute;
  }

  async update(id: number, updateAttributeDto: UpdateAttributeDto) {
    await this.findOne(id);

    return this.prisma.attribute.update({
      where: { id },
      data: updateAttributeDto,
      include: {
        values: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.attribute.delete({
      where: { id },
    });
  }

  async enable(id: number) {
    await this.findOne(id);
    return this.prisma.attribute.update({
      where: { id },
      data: { isEnabled: true },
    });
  }

  async disable(id: number) {
    await this.findOne(id);
    return this.prisma.attribute.update({
      where: { id },
      data: { isEnabled: false },
    });
  }

  async addAttributeValue(createAttributeValueDto: CreateAttributeValueDto) {
    const attribute = await this.findOne(createAttributeValueDto.attributeId);
    
    const existingValue = await this.prisma.attributeValue.findFirst({
      where: {
        attributeId: createAttributeValueDto.attributeId,
        value: createAttributeValueDto.value,
      },
    });

    if (existingValue) {
      throw new ConflictException(
        `Value '${createAttributeValueDto.value}' already exists for this attribute`
      );
    }

    return this.prisma.attributeValue.create({
      data: {
        value: createAttributeValueDto.value,
        hexValue: createAttributeValueDto.hexValue,
        attribute: {
          connect: { id: attribute.id },
        },
      },
    });
  }
}