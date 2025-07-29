// src/product/helpers/product-core-operations.ts
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProductDto, ProductCityOverrideDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

/**
 * Create a new product with all relations
 * @param prisma The Prisma service instance
 * @param shopId ID of the shop where product will be created
 * @param dto Product creation data
 * @returns Newly created product
 */
export async function createProduct(prisma: PrismaService, shopId: number, dto: any) {
  // Validate shop exists
  const shop = await findShopOrFail(prisma, shopId);
  
  // Validate required relationships
  const brand = await prisma.brand.findUnique({
    where: { id: dto.brandId }
  });
  
  if (!brand) {
    throw new NotFoundException('Brand not found');
  }

  // Validate categories exist
  const categories = await prisma.category.findMany({
    where: { id: { in: dto.categoryIds } }
  });
  
  if (categories.length !== dto.categoryIds.length) {
    throw new NotFoundException('One or more categories not found');
  }

  try {
    const product = await prisma.$transaction(async (tx) => {
      // Create the product
      const newProduct = await tx.product.create({
        data: {
          name: dto.name,
          description: dto.description,
          basePrice: dto.basePrice,
          shop: { 
            connect: { id: shopId } 
          },
          brand: { 
            connect: { id: dto.brandId } 
          },
          categories: {
            connect: dto.categoryIds.map(id => ({ id }))
          },
          status: 'enabled',
          images: dto.images && dto.images.length > 0 ? {
            create: dto.images.map((imageUrl, index) => ({
              path: imageUrl,
              imageType: index === 0 ? 'main' : 'gallery',
              caption: dto.captions?.[index] || '',
              displayOrder: index + 1
            }))
          } : undefined,
          inventory: {
            create: {
              quantity: dto.initialQuantity,
              lowStockThreshold: dto.lowStockThreshold || 10,
              isLowStock: dto.initialQuantity <= (dto.lowStockThreshold || 10)
            }
          }
        }
      });

      // If city overrides are provided, create them
      if (dto.cityOverrides && dto.cityOverrides.length > 0) {
        await tx.productCity.createMany({
          data: dto.cityOverrides.map(override => ({
            productId: newProduct.id,
            cityId: override.cityId,
            isAvailable: override.isAvailable,
            isOverride: true
          }))
        });
      }

      // Return the complete product with all relations
      return tx.product.findUnique({
        where: { id: newProduct.id },
        include: {
          categories: true,
          brand: true,
          images: true,
          inventory: true,
          shop: true,
          citiesOverride: {
            include: {
              city: true
            }
          }
        }
      });
    });

    return product;
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictException('Product with this name already exists');
    }
    throw error;
  }
}

/**
 * Update an existing product
 * @param prisma The Prisma service instance
 * @param productId ID of the product to update
 * @param dto Product update data
 * @param vendorId ID of the vendor for permission checking
 * @returns Updated product
 */
export async function updateProduct(prisma: PrismaService, productId: number, dto: any, vendorId: number) {
  await checkProductOwnership(prisma, productId, vendorId);
  
  // Get current product to check inventory status
  const currentProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: true }
  });
  
  if (!currentProduct) {
    throw new NotFoundException('Product not found');
  }

  // Prepare the images update data
  const imageUpdates = {};
  
  // Only include deleteMany if deleteImageIds is provided and not empty
  if (dto.deleteImageIds && dto.deleteImageIds.length > 0) {
    imageUpdates['deleteMany'] = {
      id: { in: dto.deleteImageIds }
    };
  }
  
  // Only include create if new images are uploaded
  if (dto.images && dto.images.length > 0) {
    imageUpdates['create'] = dto.images.map((imageUrl, index) => ({
      path: imageUrl,
      imageType: 'gallery', // All new images are gallery images
      caption: dto.captions?.[index] || '',
      displayOrder: index + 1
    }));
  }

  const updateData: any = {
    name: dto.name,
    description: dto.description,
    basePrice: dto.basePrice !== undefined ? dto.basePrice : undefined,
    images: Object.keys(imageUpdates).length > 0 ? imageUpdates : undefined
  };

  // Only add brand connection if brandId is provided
  if (dto.brandId !== undefined) {
    updateData.brand = {
      connect: { id: dto.brandId }
    };
  }

  // Only add categories connection if categoryIds is provided
  if (dto.categoryIds && dto.categoryIds.length > 0) {
    updateData.categories = {
      set: dto.categoryIds.map(id => ({ id }))
    };
  }

  // Handle city overrides if provided
  if (dto.cityOverrides) {
    await updateProductCityOverrides(prisma, productId, dto.cityOverrides);
  }

  // Update inventory if quantity is provided
  if (dto.quantity !== undefined) {
    await prisma.inventory.update({
      where: { productId },
      data: {
        quantity: dto.quantity,
        isLowStock: dto.quantity <= (currentProduct.inventory?.lowStockThreshold || 10)
      }
    });
  }

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: updateData,
    include: {
      categories: true,
      brand: true,
      images: true,
      inventory: true,
      citiesOverride: {
        include: {
          city: true
        }
      }
    }
  });

  return updatedProduct;
}

/**
 * Find a product by ID with all relations
 * @param prisma The Prisma service instance
 * @param id Product ID
 * @returns Product with all relations
 */
export async function findOne(prisma: PrismaService, id: number) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      shop: {
        include: { 
          vendor: true,
          cities: {
            include: {
              city: true
            }
          }
        }
      },
      categories: true,
      brand: true,
      images: true,
      inventory: true,
      variants: {
        include: {
          attributeValues: {
            include: {
              attribute: true
            }
          }
        }
      },
      citiesOverride: {
        include: {
          city: true
        }
      }
    }
  });

  if (!product) {
    throw new NotFoundException('Product not found');
  }

  return product;
}

/**
 * Enable a product
 * @param prisma The Prisma service instance
 * @param productId Product ID
 * @param vendorId Vendor ID for permission checking
 * @returns Updated product
 */
export async function enableProduct(prisma: PrismaService, productId: number, vendorId: number) {
  await checkProductOwnership(prisma, productId, vendorId);
  
  return prisma.product.update({
    where: { id: productId },
    data: { status: 'enabled' }
  });
}

/**
 * Disable a product
 * @param prisma The Prisma service instance
 * @param productId Product ID
 * @param vendorId Vendor ID for permission checking
 * @returns Updated product
 */
export async function disableProduct(prisma: PrismaService, productId: number, vendorId: number) {
  await checkProductOwnership(prisma, productId, vendorId);
  
  return prisma.product.update({
    where: { id: productId },
    data: { status: 'disabled' }
  });
}

/**
 * Delete a product
 * @param prisma The Prisma service instance
 * @param productId Product ID
 * @param vendorId Vendor ID for permission checking
 */
export async function deleteProduct(prisma: PrismaService, productId: number, vendorId: number) {
  await checkProductOwnership(prisma, productId, vendorId);
  
  await prisma.product.delete({
    where: { id: productId }
  });
}

/**
 * Verify that a shop exists
 * @param prisma The Prisma service instance
 * @param shopId Shop ID
 * @returns Shop if found
 * @throws NotFoundException if shop not found
 */
export async function findShopOrFail(prisma: PrismaService, shopId: number) {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId }
  });
  
  if (!shop) throw new NotFoundException('Shop not found');
  
  return shop;
}

/**
 * Check if a vendor owns a product
 * @param prisma The Prisma service instance
 * @param productId Product ID
 * @param vendorId Vendor ID
 * @returns Product if ownership verified
 * @throws ForbiddenException if vendor doesn't own the product
 */
export async function checkProductOwnership(prisma: PrismaService, productId: number, vendorId: number) {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shop: {
        vendor: { id: vendorId }
      }
    }
  });

  if (!product) {
    throw new ForbiddenException('Product not found or you do not have permission');
  }

  return product;
}

/**
 * Set city availability overrides for a product
 * @param prisma The Prisma service instance
 * @param productId Product ID
 * @param cityOverrides Array of city overrides
 */
export async function updateProductCityOverrides(prisma: PrismaService, productId: number, cityOverrides: ProductCityOverrideDto[]) {
  // First validate that all cities exist
  const cityIds = cityOverrides.map(override => override.cityId);
  
  const cities = await prisma.city.findMany({
    where: {
      id: { in: cityIds },
      isActive: true
    },
    select: { id: true }
  });

  if (cities.length !== cityIds.length) {
    throw new BadRequestException('One or more city IDs are invalid or inactive');
  }

  // Delete existing overrides
  await prisma.productCity.deleteMany({
    where: { productId }
  });

  // Create new overrides
  if (cityOverrides.length > 0) {
    await prisma.productCity.createMany({
      data: cityOverrides.map(override => ({
        productId,
        cityId: override.cityId,
        isAvailable: override.isAvailable,
        isOverride: true
      }))
    });
  }
}