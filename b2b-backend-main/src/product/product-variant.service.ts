import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductVariantDto, UpdateProductVariantDto } from './dto/product-variant.dto';
import { FindVariantDto } from './dto/find-variant.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client'; // Make sure this import exists

@Injectable()
export class ProductVariantService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateProductVariantDto) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: createDto.productId },
      include: { shop: { include: { vendor: true } } }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify all attribute values exist and belong to the product
    const attributeValues = await this.prisma.attributeValue.findMany({
      where: { id: { in: createDto.attributeValueIds } },
      include: { attribute: true }
    });

    if (attributeValues.length !== createDto.attributeValueIds.length) {
      throw new BadRequestException('One or more attribute values not found');
    }

    // Check if this combination of attribute values already exists for this product
    const existingVariant = await this.prisma.productVariant.findFirst({
      where: {
        productId: createDto.productId,
        attributeValues: {
          every: {
            id: { in: createDto.attributeValueIds }
          }
        }
      }
    });

    if (existingVariant) {
      throw new ConflictException('A variant with these attributes already exists');
    }

    // Create the variant
    return this.prisma.productVariant.create({
      data: {
        product: { connect: { id: createDto.productId } },
        sku: createDto.sku,
        quantity: createDto.quantity,
        lowStockThreshold: createDto.lowStockThreshold || 10,
        isLowStock: createDto.quantity <= (createDto.lowStockThreshold || 10),
        price: createDto.price, // Add the optional price field
        attributeValues: {
          connect: createDto.attributeValueIds.map(id => ({ id }))
        }
      },
      include: {
        product: true,
        attributeValues: {
          include: {
            attribute: true
          }
        }
      }
    });
  }

  async findAll(findDto: FindVariantDto, paginationDto?: PaginationDto) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortDirection = 'desc' } = paginationDto || {};
    const skip = (page - 1) * limit;

    // Fix the type with proper Prisma typings
    const where: Prisma.ProductVariantWhereInput = {
      ...(findDto.productId ? { productId: findDto.productId } : {}),
      ...(findDto.skuPattern ? { 
        sku: { 
          contains: findDto.skuPattern, 
          mode: Prisma.QueryMode.insensitive
        } 
      } : {}),
      ...(findDto.isLowStock !== undefined ? { isLowStock: findDto.isLowStock } : {})
    };

    const [variants, total] = await Promise.all([
      this.prisma.productVariant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortDirection },
        include: {
          product: true,
          attributeValues: {
            include: {
              attribute: true
            }
          }
        }
      }),
      this.prisma.productVariant.count({ where })
    ]);

    return {
      data: variants,
      pagination: {
        totalItems: total,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
        sortBy,
        sortDirection
      }
    };
  }

  async findOne(id: number) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: true,
        attributeValues: {
          include: {
            attribute: true
          }
        }
      }
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    return variant;
  }

  async update(id: number, updateDto: UpdateProductVariantDto) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id }
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    return this.prisma.productVariant.update({
      where: { id },
      data: {
        sku: updateDto.sku,
        quantity: updateDto.quantity,
        lowStockThreshold: updateDto.lowStockThreshold,
        price: updateDto.price, // Add the price field to update
        isLowStock: updateDto.quantity !== undefined
          ? updateDto.quantity <= (updateDto.lowStockThreshold || variant.lowStockThreshold)
          : variant.isLowStock
      },
      include: {
        product: true,
        attributeValues: {
          include: {
            attribute: true
          }
        }
      }
    });
  }

  async remove(id: number) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: { cartItems: true, orderItems: true }
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    // Check if variant is being used in active carts or orders
    if (variant.cartItems.length > 0) {
      throw new BadRequestException('Cannot delete variant that is in active carts');
    }

    if (variant.orderItems.length > 0) {
      throw new BadRequestException('Cannot delete variant that has been ordered');
    }

    return this.prisma.productVariant.delete({
      where: { id }
    });
  }

  async adjustStock(id: number, quantity: number, type: 'add' | 'remove') {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id }
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    let newQuantity: number;
    
    if (type === 'add') {
      newQuantity = variant.quantity + quantity;
    } else {
      if (variant.quantity < quantity) {
        throw new BadRequestException('Insufficient stock for the requested adjustment');
      }
      newQuantity = variant.quantity - quantity;
    }

    return this.prisma.productVariant.update({
      where: { id },
      data: {
        quantity: newQuantity,
        isLowStock: newQuantity <= variant.lowStockThreshold
      }
    });
  }

  async checkStock(id: number, requestedQuantity: number): Promise<boolean> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id }
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    return variant.quantity >= requestedQuantity;
  }
  
  // Helper method to get effective price (either variant price or product base price)
  async getEffectivePrice(variantId: number): Promise<number> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true }
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    // Return variant price if defined, otherwise return product base price
    return variant.price ? Number(variant.price) : Number(variant.product.basePrice);
  }
}