// src/product/helpers/product-query-operations.ts
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ProductFilterDto, ProductStatus } from '../dto/product-filter.dto';
import { Prisma } from '@prisma/client';
import { preparePaginationParams, createPaginatedResponse } from './product-pagination';

/**
 * Get products by shop ID
 * @param prisma The Prisma service instance
 * @param shopId ID of the shop to get products for
 * @param paginationDto Optional pagination parameters
 * @returns Paginated list of products for the shop
 */
export async function getProductsByShop(
  prisma: PrismaService,
  shopId: number,
  paginationDto?: PaginationDto
) {
  // Using pagination helper for parameter preparation
  const paginationParams = preparePaginationParams(
    paginationDto,
    'name',
    ['id', 'name', 'basePrice', 'createdAt']
  );
  
  const { skip, limit, sortOrder, actualSortBy } = paginationParams;

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: { 
        shopId,
        status: 'enabled'
      },
      skip,
      take: limit,
      orderBy: { [actualSortBy]: sortOrder },
      include: {
        categories: true,
        brand: true,
        images: true,
        inventory: true,
        citiesOverride: true
      }
    }),
    prisma.product.count({
      where: { 
        shopId,
        status: 'enabled'
      }
    })
  ]);

  // Using pagination helper for response creation
  return createPaginatedResponse(products, totalCount, paginationParams);
}

/**
 * Get products by vendor ID
 * @param prisma The Prisma service instance
 * @param vendorId ID of the vendor to get products for
 * @param filterDto Filter and pagination parameters
 * @returns Paginated list of products for the vendor
 */
export async function getProductsByVendor(
  prisma: PrismaService,
  vendorId: number,
  filterDto: ProductFilterDto
) {
  const { status = ProductStatus.ALL, search } = filterDto || {};

  // Using pagination helper for parameter preparation
  const paginationParams = preparePaginationParams(
    filterDto,
    'createdAt',
    ['id', 'name', 'basePrice', 'createdAt', 'status']
  );
  
  const { skip, limit, sortOrder, actualSortBy } = paginationParams;

  // Get the vendor with their shops directly
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      shops: {
        select: { id: true }
      }
    }
  });

  if (!vendor) {
    throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
  }

  // Get shop IDs directly from vendor relation
  const shopIds = vendor.shops.map(shop => shop.id);
  
  if (shopIds.length === 0) {
    return {
      data: [],
      meta: {
        totalItems: 0,
        itemsPerPage: limit,
        currentPage: paginationParams.page,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        sortBy: actualSortBy,
        sortDirection: paginationParams.sortDirection,
        filters: {
          status,
          search: search || null
        }
      }
    };
  }

  // Build where clause with shopId in the list of this vendor's shops
  const whereClause: Prisma.ProductWhereInput = { 
    shopId: {
      in: shopIds
    }
  };
  
  if (status !== ProductStatus.ALL) {
    whereClause.status = status;
  }
  
  if (search) {
    whereClause.name = {
      contains: search,
      mode: 'insensitive'
    };
  }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { [actualSortBy]: sortOrder },
      include: {
        categories: true,
        brand: true,
        images: true,
        inventory: true,
        shop: true,
        variants: {
          include: {
            attributeValues: {
              include: {
                attribute: true
              }
            }
          }
        }
      }
    }),
    prisma.product.count({
      where: whereClause
    })
  ]);

  // Using pagination helper for response creation but with added filters field
  const baseResponse = createPaginatedResponse(products, totalCount, paginationParams);
  
  // Add filter info to the standard pagination response
  return {
    ...baseResponse,
    meta: {
      ...baseResponse.meta,
      filters: {
        status,
        search: search || null
      }
    }
  };
}

/**
 * Get all enabled products with pagination
 * @param prisma The Prisma service instance
 * @param paginationDto Optional pagination parameters
 * @returns Paginated list of all enabled products
 */
export async function getAllProducts(
  prisma: PrismaService,
  paginationDto?: PaginationDto
) {
  // Using pagination helper for parameter preparation
  const paginationParams = preparePaginationParams(
    paginationDto,
    'createdAt',
    ['id', 'name', 'basePrice', 'createdAt']
  );
  
  const { skip, limit, sortOrder, actualSortBy } = paginationParams;

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: { 
        status: 'enabled'
      },
      skip,
      take: limit,
      orderBy: { [actualSortBy]: sortOrder },
      include: {
        categories: true,
        brand: true,
        images: true,
        inventory: true,
        shop: true,
        variants: {
          include: {
            attributeValues: {
              include: {
                attribute: true
              }
            }
          }
        }
      }
    }),
    prisma.product.count({
      where: { 
        status: 'enabled'
      }
    })
  ]);

  // Add metadata about variants to make it easier for the frontend
  const productsWithVariantInfo = products.map(product => ({
    ...product,
    variantsCount: product.variants.length,
    hasVariants: product.variants.length > 0,
    minVariantPrice: product.variants.length > 0 ? 
      Math.min(...product.variants.filter(v => v.price !== null).map(v => Number(v.price || product.basePrice))) : 
      Number(product.basePrice),
    maxVariantPrice: product.variants.length > 0 ?
      Math.max(...product.variants.filter(v => v.price !== null).map(v => Number(v.price || product.basePrice))) :
      Number(product.basePrice),
  }));

  // Using pagination helper for response creation
  return createPaginatedResponse(productsWithVariantInfo, totalCount, paginationParams);
}