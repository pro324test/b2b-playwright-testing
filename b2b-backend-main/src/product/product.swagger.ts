import { applyDecorators } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiParam, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery
} from '@nestjs/swagger';
import { SortDirection } from '../common/dto/pagination.dto';
import { ProductStatus } from './dto/product-filter.dto';

export const CreateProductSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Create a new product',
      description: 'Create a new product with images upload support'
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiParam({
      name: 'shopId',
      description: 'ID of the shop to add the product to',
      type: 'number'
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['name', 'basePrice', 'brandId', 'categoryIds'],
        properties: {
          name: { type: 'string', example: 'Dell XPS 13 Laptop' },
          description: { type: 'string', example: '13-inch premium laptop with InfinityEdge display' },
          basePrice: { type: 'number', example: 1299.99 },
          brandId: { type: 'integer', example: 1 },
          categoryIds: { 
            type: 'array', 
            items: { type: 'integer' },
            example: [1, 5]
          },
          initialQuantity: { type: 'integer', example: 50 },
          lowStockThreshold: { type: 'integer', example: 10 },
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary'
            }
          },
          captions: { 
            type: 'string', 
            example: '["Front view", "Side view"]',
            description: 'JSON string array of captions for images'
          },
          cityOverrides: {
            type: 'string',
            example: '[{"cityId": 1, "isAvailable": true}, {"cityId": 2, "isAvailable": false}]',
            description: 'JSON string array of city availability overrides (cityId, isAvailable)'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 201, 
      description: 'Product created successfully' 
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Bad request' 
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Shop, brand, or category not found' 
    })
  );
};

export const GetProductSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get product details',
      description: 'Get detailed information about a specific product including variants and city availability if available'
    }),
    ApiResponse({ 
      status: 200,
      description: 'Product found',
      schema: {
        example: {
          id: 1,
          name: "Premium Cotton T-Shirt",
          description: "High-quality soft cotton t-shirt",
          basePrice: 29.99,
          status: "enabled",
          shop: {
            id: 1,
            name: "Fashion Store",
            vendor: {
              id: 1,
              user: {
                username: "vendor1"
              }
            },
            cities: [
              { id: 1, name: "New York" },
              { id: 2, name: "Los Angeles" }
            ]
          },
          categories: [{ id: 8, name: "Apparel" }],
          brand: { id: 12, name: "FashionBrand" },
          images: [{ id: 1, path: "image-url.jpg" }],
          inventory: {
            quantity: 150,
            lowStockThreshold: 20,
            isLowStock: false
          },
          citiesOverride: [
            {
              city: { id: 3, name: "Miami" },
              isAvailable: true,
              isOverride: true
            },
            {
              city: { id: 1, name: "New York" },
              isAvailable: false,
              isOverride: true
            }
          ],
          attributeValues: [
            {
              id: 5,
              value: "Red",
              attribute: { id: 1, name: "Color" }
            },
            {
              id: 6,
              value: "Blue",
              attribute: { id: 1, name: "Color" }
            },
            {
              id: 12,
              value: "XL",
              attribute: { id: 2, name: "Size" }
            }
          ],
          variants: [
            {
              id: 1,
              sku: "RED-XL-001",
              quantity: 50,
              lowStockThreshold: 10,
              isLowStock: false,
              attributeValues: [
                {
                  id: 5,
                  value: "Red",
                  attribute: { id: 1, name: "Color" }
                },
                {
                  id: 12,
                  value: "XL",
                  attribute: { id: 2, name: "Size" }
                }
              ]
            },
            {
              id: 2,
              sku: "BLUE-XL-001",
              quantity: 25,
              lowStockThreshold: 10,
              isLowStock: false,
              attributeValues: [
                {
                  id: 6,
                  value: "Blue",
                  attribute: { id: 1, name: "Color" }
                },
                {
                  id: 12,
                  value: "XL",
                  attribute: { id: 2, name: "Size" }
                }
              ]
            }
          ]
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Product not found' })
  );
};

export const GetShopProductsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get shop products',
      description: 'Get paginated list of enabled products for a specific shop'
    }),
    ApiParam({
      name: 'shopId',
      required: true,
      type: Number,
      description: 'ID of the shop to get products for'
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (starts from 1)'
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page'
    }),
    ApiQuery({
      name: 'sortDirection',
      required: false,
      enum: SortDirection,
      description: 'Sort direction (asc or desc)'
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by (id, name, basePrice)'
    }),
    ApiResponse({ 
      status: 200,
      description: 'Shop products retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Dell XPS 13 Laptop' },
                description: { type: 'string', example: '13-inch premium laptop with InfinityEdge display' },
                basePrice: { type: 'number', example: 1299.99 },
                status: { type: 'string', example: 'enabled' },
                images: { 
                  type: 'array',
                  items: { 
                    type: 'object', 
                    properties: {
                      path: { type: 'string', example: 'https://example.com/images/dell-xps.jpg' }
                    }
                  }
                },
                variantsCount: { type: 'number', example: 6, description: 'Number of variants available for this product' }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 42 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 5 },
              hasNextPage: { type: 'boolean', example: true },
              hasPreviousPage: { type: 'boolean', example: false },
              sortBy: { type: 'string', example: 'name' },
              sortDirection: { type: 'string', example: 'asc' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Shop not found' })
  );
};

export const UpdateProductSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Update a product',
      description: 'Update product details including images, inventory quantity and other properties'
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiParam({
      name: 'id',
      description: 'Product ID',
      type: 'number'
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Updated Product Name' },
          description: { type: 'string', example: 'Updated product description' },
          basePrice: { type: 'number', example: 1199.99 },
          brandId: { type: 'integer', example: 2 },
          categoryIds: {
            type: 'array',
            items: { type: 'integer' },
            example: [2, 6]
          },
          deleteImageIds: { 
            type: 'string', 
            example: '[1, 3]',
            description: 'JSON string array of image IDs to delete' 
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary'
            }
          },
          captions: { 
            type: 'string', 
            example: '["Updated front view", "Updated side view"]',
            description: 'JSON string array of captions for new images'
          },
          cityOverrides: {
            type: 'string',
            example: '[{"cityId": 1, "isAvailable": true}, {"cityId": 3, "isAvailable": false}]',
            description: 'JSON string array of city availability overrides (cityId, isAvailable)'
          },
          quantity: {
            type: 'integer',
            example: 100,
            description: 'Update product inventory quantity'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Product updated successfully',
      schema: {
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Updated Product Name' },
          description: { type: 'string', example: 'Updated product description' },
          basePrice: { type: 'number', example: 1199.99 },
          status: { type: 'string', example: 'enabled' },
          inventory: {
            type: 'object',
            properties: {
              quantity: { type: 'integer', example: 100 },
              isLowStock: { type: 'boolean', example: false },
              lowStockThreshold: { type: 'integer', example: 10 }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Only vendors can update their products' }),
    ApiResponse({ status: 404, description: 'Product not found' })
  );
};

export const EnableProductSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor Only] Enable product',
      description: 'Enable a disabled product. Vendors can only enable their own products.'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'Product enabled successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Not your product' }),
    ApiResponse({ status: 404, description: 'Product not found' })
  );
};

export const DisableProductSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor Only] Disable product',
      description: 'Disable an enabled product. Vendors can only disable their own products.'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'Product disabled successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Not your product' }),
    ApiResponse({ status: 404, description: 'Product not found' })
  );
};

export const DeleteProductSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor Only] Delete product',
      description: 'Permanently delete a product. Vendors can only delete their own products.'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'Product deleted successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Not your product' }),
    ApiResponse({ status: 404, description: 'Product not found' })
  );
};

export const GetVendorProductsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor Only] Get vendor products',
      description: 'Get paginated list of all products across all shops owned by the authenticated vendor'
    }),
    ApiBearerAuth(),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (starts from 1)'
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page'
    }),
    ApiQuery({
      name: 'sortDirection',
      required: false,
      enum: SortDirection,
      description: 'Sort direction (asc or desc)'
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by (id, name, basePrice, createdAt, status)'
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: ProductStatus,
      description: 'Filter by product status (enabled, disabled, all)'
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Search products by name'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Products retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Premium Cotton T-Shirt' },
                description: { type: 'string', example: 'High-quality soft cotton t-shirt' },
                basePrice: { type: 'number', example: 29.99 },
                status: { type: 'string', example: 'enabled' }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 42 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 5 },
              hasNextPage: { type: 'boolean', example: true },
              hasPreviousPage: { type: 'boolean', example: false },
              sortBy: { type: 'string', example: 'name' },
              sortDirection: { type: 'string', example: 'asc' },
              filters: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'all' },
                  search: { type: 'string', example: 'shirt', nullable: true }
                }
              }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' }),
    ApiResponse({ status: 403, description: 'Forbidden - Vendor access required' })
  );
};

export const GetProductsByCitySwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get products available in a city',
      description: 'Get all products that are available in a specific city, respecting shop defaults and product overrides'
    }),
    ApiParam({
      name: 'cityId',
      required: true,
      type: Number,
      description: 'City ID'
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (starts from 1)'
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page'
    }),
    ApiQuery({
      name: 'sortDirection',
      required: false,
      enum: SortDirection,
      description: 'Sort direction (asc or desc)'
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by (id, name, basePrice)'
    }),
    ApiResponse({ 
      status: 200,
      description: 'Products retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Dell XPS 13 Laptop' },
                description: { type: 'string', example: '13-inch premium laptop with InfinityEdge display' },
                basePrice: { type: 'number', example: 1299.99 },
                status: { type: 'string', example: 'enabled' },
                shop: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 1 },
                    name: { type: 'string', example: 'Tech Shop' }
                  }
                },
                images: { 
                  type: 'array',
                  items: { 
                    type: 'object', 
                    properties: {
                      path: { type: 'string', example: 'https://example.com/images/dell-xps.jpg' }
                    }
                  }
                }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 42 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 5 },
              hasNextPage: { type: 'boolean', example: true },
              hasPreviousPage: { type: 'boolean', example: false },
              sortBy: { type: 'string', example: 'name' },
              sortDirection: { type: 'string', example: 'asc' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'City not found' })
  );
};

export const GetProductCitiesSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get cities where product is available',
      description: 'Get the list of cities where a product can be delivered, considering both shop defaults and product overrides'
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: Number,
      description: 'Product ID'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Available cities retrieved successfully',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'New York' },
            isActive: { type: 'boolean', example: true },
            isAvailable: { type: 'boolean', example: true },
            isShopDefault: { type: 'boolean', example: true },
            isOverride: { type: 'boolean', example: false }
          }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Product not found' })
  );
};

export const CheckProductCityAvailabilitySwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Check if product is available in a specific city',
      description: 'Check if a product can be delivered to a specific city, considering both shop defaults and product overrides'
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: Number,
      description: 'Product ID'
    }),
    ApiParam({
      name: 'cityId',
      required: true,
      type: Number,
      description: 'City ID'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Availability check completed',
      schema: {
        properties: {
          isAvailable: { type: 'boolean', example: true }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Product or city not found' })
  );
};

export const GetAllProductsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get all products',
      description: 'Get paginated list of all enabled products across all shops'
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (starts from 1)'
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page'
    }),
    ApiQuery({
      name: 'sortDirection',
      required: false,
      enum: SortDirection,
      description: 'Sort direction (asc or desc)'
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by (id, name, basePrice, createdAt)'
    }),
    ApiResponse({ 
      status: 200,
      description: 'Products retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Premium Cotton T-Shirt' },
                description: { type: 'string', example: 'High-quality soft cotton t-shirt' },
                basePrice: { type: 'number', example: 29.99 },
                shop: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 1 },
                    name: { type: 'string', example: 'Fashion Shop' }
                  }
                },
                images: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      path: { type: 'string', example: 'https://example.com/images/tshirt.jpg' }
                    }
                  }
                },
                variantsCount: { type: 'number', example: 3, description: 'Number of variants available for this product' },
                hasVariants: { type: 'boolean', example: true, description: 'Whether the product has variants' },
                minVariantPrice: { type: 'number', example: 24.99, description: 'Lowest price across all variants' },
                maxVariantPrice: { type: 'number', example: 34.99, description: 'Highest price across all variants' },
                variants: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 1 },
                      sku: { type: 'string', example: 'RED-XL-001' },
                      quantity: { type: 'number', example: 50 },
                      price: { type: 'number', example: 29.99 },
                      attributeValues: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            value: { type: 'string', example: 'Red' },
                            attribute: {
                              type: 'object',
                              properties: {
                                name: { type: 'string', example: 'Color' }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 120 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 12 },
              hasNextPage: { type: 'boolean', example: true },
              hasPreviousPage: { type: 'boolean', example: false },
              sortBy: { type: 'string', example: 'createdAt' },
              sortDirection: { type: 'string', example: 'desc' }
            }
          }
        }
      }
    })
  );
};

export const GetPublicVendorProductsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get products by vendor',
      description: 'Get paginated list of products for a specific vendor with optional status filtering'
    }),
    ApiParam({
      name: 'vendorId',
      type: 'number',
      description: 'Vendor ID',
      required: true
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: ProductStatus,
      description: 'Filter by product status (enabled, disabled, or all)',
      default: ProductStatus.ENABLED
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (starts from 1)'
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page'
    }),
    ApiQuery({
      name: 'sortDirection',
      required: false,
      enum: SortDirection,
      description: 'Sort direction (asc or desc)'
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by (id, name, basePrice, createdAt)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Vendor products retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { type: 'object', properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Product Name' },
              basePrice: { type: 'number', example: 99.99 },
              status: { type: 'string', example: 'enabled' },
              // Other properties...
            }}
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 42 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 5 }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Vendor not found' })
  );
};