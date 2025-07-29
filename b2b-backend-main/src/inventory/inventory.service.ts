import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PaginationDto, SortDirection } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(createInventoryDto: CreateInventoryDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: createInventoryDto.productId },
      include: { inventory: true }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.inventory) {
      throw new BadRequestException('Inventory already exists for this product');
    }

    return this.prisma.inventory.create({
      data: {
        product: { connect: { id: createInventoryDto.productId } },
        quantity: createInventoryDto.quantity,
        lowStockThreshold: createInventoryDto.lowStockThreshold || 10,
        isLowStock: createInventoryDto.quantity <= (createInventoryDto.lowStockThreshold || 10)
      }
    });
  }

  async findOne(productId: number) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productId },
      include: { product: true }
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    return inventory;
  }

  async update(productId: number, updateInventoryDto: UpdateInventoryDto) {
    const inventory = await this.findOne(productId);

    return this.prisma.inventory.update({
      where: { productId },
      data: {
        quantity: updateInventoryDto.quantity ?? inventory.quantity,
        lowStockThreshold: updateInventoryDto.lowStockThreshold ?? inventory.lowStockThreshold,
        isLowStock: updateInventoryDto.quantity ? 
          updateInventoryDto.quantity <= (updateInventoryDto.lowStockThreshold || inventory.lowStockThreshold) :
          inventory.quantity <= inventory.lowStockThreshold
      }
    });
  }

  async adjustStock(productId: number, quantity: number, type: 'add' | 'remove') {
    const inventory = await this.findOne(productId);
    
    let newQuantity: number;
    if (type === 'add') {
      newQuantity = inventory.quantity + quantity;
    } else {
      if (inventory.quantity < quantity) {
        throw new BadRequestException('Insufficient stock');
      }
      newQuantity = inventory.quantity - quantity;
    }

    return this.prisma.inventory.update({
      where: { productId },
      data: {
        quantity: newQuantity,
        isLowStock: newQuantity <= inventory.lowStockThreshold
      }
    });
  }

  async checkStock(productId: number, requestedQuantity: number): Promise<boolean> {
    const inventory = await this.findOne(productId);
    return inventory.quantity >= requestedQuantity;
  }

  async getLowStockProducts(paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.DESC, 
      sortBy = 'quantity' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    const validSortFields = ['id', 'quantity', 'lowStockThreshold', 'createdAt', 'updatedAt'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'quantity';

    const [products, totalCount] = await Promise.all([
      this.prisma.inventory.findMany({
        where: { isLowStock: true },
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          product: {
            include: {
              shop: true,
              images: {
                where: { imageType: 'main' },
                take: 1
              }
            }
          }
        }
      }),
      this.prisma.inventory.count({
        where: { isLowStock: true }
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
        sortBy: actualSortBy,
        sortDirection
      }
    };
  }
}