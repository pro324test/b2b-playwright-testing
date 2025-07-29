import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateProductVariantDto, UpdateProductVariantDto } from './dto/product-variant.dto';
import { SortDirection } from '../common/dto/pagination.dto';

export const CreateProductVariantSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor Only] Create product variant',
      description: 'Create a new variant for a specific product with different attributes and inventory'
    }),
    ApiBearerAuth(),
    ApiBody({
      type: CreateProductVariantDto,
      examples: {
        basic: {
          summary: 'Basic Variant',
          value: {
            productId: 1,
            sku: 'RED-XL-001',
            attributeValueIds: [5, 12],
            quantity: 50,
            lowStockThreshold: 10,
            price: 34.99 // Add price field
          }
        }
      }
    }),
    ApiResponse({ 
      status: 201, 
      description: 'Variant created successfully',
      schema: {
        example: {
          id: 1,
          sku: 'RED-XL-001',
          quantity: 50,
          price: 34.99, // Add price field
          lowStockThreshold: 10,
          isLowStock: false,
          createdAt: '2025-03-05T10:00:00Z',
          updatedAt: '2025-03-05T10:00:00Z',
          product: {
            id: 1,
            name: 'Premium Cotton T-Shirt'
          },
          attributeValues: [
            {
              id: 5,
              value: 'Red',
              attribute: {
                id: 1,
                name: 'Color'
              }
            },
            {
              id: 12,
              value: 'XL',
              attribute: {
                id: 2,
                name: 'Size'
              }
            }
          ]
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Bad request - Invalid input or duplicate variant' }),
    ApiResponse({ status: 403, description: 'Forbidden - Only vendors can create variants' }),
    ApiResponse({ status: 404, description: 'Product not found' })
  );
};

export const GetProductVariantsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get all product variants',
      description: 'Get paginated list of all product variants with filters'
    }),
    ApiQuery({
      name: 'productId',
      required: false,
      type: Number,
      description: 'Filter by product ID'
    }),
    ApiQuery({
      name: 'skuPattern',
      required: false,
      type: String,
      description: 'Filter by SKU pattern (contains search)'
    }),
    ApiQuery({
      name: 'isLowStock',
      required: false,
      type: Boolean,
      description: 'Filter to show only low stock variants'
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
      description: 'Field to sort by (id, sku, quantity, createdAt)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of variants retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                sku: { type: 'string', example: 'RED-XL-001' },
                quantity: { type: 'number', example: 50 },
                price: { type: 'number', example: 34.99 }, // Add the variant-specific price
                lowStockThreshold: { type: 'number', example: 10 },
                isLowStock: { type: 'boolean', example: false },
                productId: { type: 'number', example: 1 },
                product: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 1 },
                    name: { type: 'string', example: 'Premium Cotton T-Shirt' }
                  }
                },
                attributeValues: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      value: { type: 'string' },
                      attribute: {
                        type: 'object',
                        properties: {
                          id: { type: 'number' },
                          name: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          pagination: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 15 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 2 },
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

export const GetVariantByIdSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get a variant by ID',
      description: 'Get detailed information about a specific product variant'
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Variant ID',
      required: true
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Variant details',
      schema: {
        example: {
          id: 1,
          sku: 'RED-XL-001',
          quantity: 50,
          price: 34.99, // Add the variant-specific price
          lowStockThreshold: 10,
          isLowStock: false,
          createdAt: '2025-03-05T10:00:00Z',
          updatedAt: '2025-03-05T10:00:00Z',
          product: {
            id: 1,
            name: 'Premium Cotton T-Shirt'
          },
          attributeValues: [
            {
              id: 5,
              value: 'Red',
              attribute: {
                id: 1,
                name: 'Color'
              }
            },
            {
              id: 12,
              value: 'XL',
              attribute: {
                id: 2,
                name: 'Size'
              }
            }
          ]
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Variant not found' })
  );
};

export const GetVariantsByProductSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get variants for a specific product',
      description: 'Get all variants associated with a specific product'
    }),
    ApiParam({
      name: 'productId',
      type: 'number',
      description: 'Product ID',
      required: true
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
    ApiResponse({ 
      status: 200, 
      description: 'List of product variants',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                sku: { type: 'string', example: 'RED-XL-001' },
                quantity: { type: 'number', example: 50 },
                price: { type: 'number', example: 34.99 }, // Add price field
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
          },
          pagination: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 6 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 1 }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Product not found' })
  );
};

export const UpdateVariantSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor Only] Update product variant',
      description: 'Update details of an existing product variant'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Variant ID',
      required: true
    }),
    ApiBody({
      type: UpdateProductVariantDto,
      examples: {
        updateQuantity: {
          summary: 'Update Stock Quantity',
          value: {
            quantity: 75
          }
        },
        updateSku: {
          summary: 'Update SKU',
          value: {
            sku: 'RED-XL-002'
          }
        },
        updateThreshold: {
          summary: 'Update Stock Threshold',
          value: {
            lowStockThreshold: 15
          }
        },
        updatePrice: { // Add price example
          summary: 'Update Price',
          value: {
            price: 39.99
          }
        }
      }
    }),
    ApiResponse({ status: 200, description: 'Variant updated successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - Only vendors can update variants' }),
    ApiResponse({ status: 404, description: 'Variant not found' })
  );
};

export const DeleteVariantSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor Only] Delete product variant',
      description: 'Delete a product variant that is not in use'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Variant ID',
      required: true
    }),
    ApiResponse({ status: 200, description: 'Variant deleted successfully' }),
    ApiResponse({ status: 400, description: 'Cannot delete variant that is in active carts or orders' }),
    ApiResponse({ status: 403, description: 'Forbidden - Only vendors can delete variants' }),
    ApiResponse({ status: 404, description: 'Variant not found' })
  );
};

export const AddStockSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor Only] Add stock to variant',
      description: 'Increase inventory quantity for a specific variant'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Variant ID',
      required: true
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          quantity: { 
            type: 'number', 
            example: 20,
            description: 'Quantity to add to current stock'
          }
        },
        required: ['quantity']
      }
    }),
    ApiResponse({ status: 200, description: 'Stock added successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - Only vendors can update stock' }),
    ApiResponse({ status: 404, description: 'Variant not found' })
  );
};

export const RemoveStockSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor Only] Remove stock from variant',
      description: 'Decrease inventory quantity for a specific variant'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Variant ID',
      required: true
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          quantity: { 
            type: 'number', 
            example: 5,
            description: 'Quantity to remove from current stock'
          }
        },
        required: ['quantity']
      }
    }),
    ApiResponse({ status: 200, description: 'Stock removed successfully' }),
    ApiResponse({ status: 400, description: 'Insufficient stock for the requested adjustment' }),
    ApiResponse({ status: 403, description: 'Forbidden - Only vendors can update stock' }),
    ApiResponse({ status: 404, description: 'Variant not found' })
  );
};

export const GetLowStockVariantsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor/Admin Only] Get low stock variants',
      description: 'Get paginated list of variants that are below their low stock threshold'
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
    ApiResponse({ 
      status: 200, 
      description: 'List of low stock variants',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 3 },
                sku: { type: 'string', example: 'BLUE-M-001' },
                quantity: { type: 'number', example: 5 },
                price: { type: 'number', example: 29.99 }, // Add price field
                lowStockThreshold: { type: 'number', example: 10 },
                isLowStock: { type: 'boolean', example: true },
                product: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 1 },
                    name: { type: 'string', example: 'Premium Cotton T-Shirt' }
                  }
                },
                attributeValues: {
                  type: 'array',
                  items: {
                    type: 'object'
                  }
                }
              }
            }
          },
          pagination: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 3 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 1 }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Only vendors and admins can access this endpoint' })
  );
};