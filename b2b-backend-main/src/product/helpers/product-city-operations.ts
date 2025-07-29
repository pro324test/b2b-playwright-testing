import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductCityOverrideDto } from '../dto/create-product.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { preparePaginationParams, createPaginatedResponse } from './product-pagination';

/**
 * Check if a product is available in a specific city
 * @param prisma The Prisma service instance
 * @param productId ID of the product to check
 * @param cityId ID of the city to check
 * @returns Boolean indicating whether the product is available in the specified city
 */
export async function checkProductAvailabilityInCity(
  prisma: PrismaService,
  productId: number,
  cityId: number
): Promise<boolean> {
  // First check if there's a product-specific override
  const productOverride = await prisma.productCity.findFirst({
    where: {
      productId,
      cityId,
      isOverride: true
    }
  });

  // If product override exists, use that availability
  if (productOverride) {
    return productOverride.isAvailable;
  }

  // If no product override, check the shop's city availability
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { shopId: true }
  });

  if (!product) {
    throw new NotFoundException('Product not found');
  }

  const shopCity = await prisma.shopCity.findFirst({
    where: {
      shopId: product.shopId,
      cityId
    }
  });

  // Product is available if the shop delivers to this city
  return !!shopCity;
}

/**
 * Get all cities where a product is available
 * @param prisma The Prisma service instance
 * @param productId ID of the product to get cities for
 * @returns Array of cities where the product is available
 */
export async function getProductAvailableCities(
  prisma: PrismaService,
  productId: number
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      shop: {
        include: {
          cities: {
            include: {
              city: true
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

  // Get all cities where the shop delivers
  const shopCities = product.shop.cities.map(sc => ({
    id: sc.city.id,
    name: sc.city.name,
    isActive: sc.city.isActive,
    isAvailable: true,
    isShopDefault: true
  }));

  // Get product-specific overrides
  const overrideCities = product.citiesOverride.map(pc => ({
    id: pc.city.id,
    name: pc.city.name,
    isActive: pc.city.isActive,
    isAvailable: pc.isAvailable,
    isShopDefault: false,
    isOverride: true
  }));

  // Create a map for easy lookup
  const citiesMap = new Map();
  
  // Add shop cities first
  shopCities.forEach(city => {
    citiesMap.set(city.id, city);
  });
  
  // Add/override with product-specific settings
  overrideCities.forEach(city => {
    citiesMap.set(city.id, city);
  });
  
  // Convert map back to array, filtering out unavailable cities
  return Array.from(citiesMap.values()).filter(city => city.isAvailable && city.isActive);
}

/**
 * Filter products by city
 * @param prisma The Prisma service instance
 * @param cityId ID of the city to filter by
 * @param paginationDto Optional pagination parameters
 * @returns Paginated list of products available in the specified city
 */
export async function getProductsByCityId(
  prisma: PrismaService,
  cityId: number,
  paginationDto?: PaginationDto
) {
  // Using pagination helper for parameter preparation
  const paginationParams = preparePaginationParams(
    paginationDto,
    'name',
    ['id', 'name', 'basePrice', 'createdAt']
  );
  
  const { skip, limit, sortOrder, actualSortBy } = paginationParams;

  // Build complex where clause for city availability
  const whereClause = {
    status: 'enabled',
    OR: [
      // Product specifically allows this city
      {
        citiesOverride: {
          some: {
            cityId,
            isAvailable: true
          }
        }
      },
      // Product has no override AND shop delivers to this city
      {
        AND: [
          {
            citiesOverride: {
              none: {
                cityId
              }
            }
          },
          {
            shop: {
              cities: {
                some: {
                  cityId
                }
              }
            }
          }
        ]
      }
    ]
  };

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
        shop: true
      }
    }),
    prisma.product.count({
      where: whereClause
    })
  ]);

  // Using pagination helper for response creation
  return createPaginatedResponse(products, totalCount, paginationParams);
}

/**
 * Update city availability overrides for a product
 * @param prisma The Prisma service instance
 * @param productId ID of the product to update
 * @param cityOverrides Array of city override data
 */
export async function updateProductCityOverrides(
  prisma: PrismaService,
  productId: number,
  cityOverrides: ProductCityOverrideDto[]
) {
  // First validate that all cities exist
  const cityIds = cityOverrides.map(override => override.cityId);
  
  // Only continue if we have city overrides
  if (cityIds.length === 0) {
    return;
  }

  const cities = await prisma.city.findMany({
    where: {
      id: { in: cityIds },
      isActive: true
    },
    select: { id: true }
  });

  if (cities.length !== cityIds.length) {
    throw new NotFoundException('One or more city IDs are invalid or inactive');
  }

  // Delete existing overrides
  await prisma.productCity.deleteMany({
    where: { productId }
  });

  // Create new overrides
  await prisma.productCity.createMany({
    data: cityOverrides.map(override => ({
      productId,
      cityId: override.cityId,
      isAvailable: override.isAvailable,
      isOverride: true
    }))
  });
}