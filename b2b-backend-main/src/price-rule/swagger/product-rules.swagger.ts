import { applyDecorators } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { SortDirection } from '../../common/dto/pagination.dto';

/**
 * Swagger decorator for "Get price rules for product" endpoint
 */
export const GetProductPriceRulesSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get active price rules for a product',
      description: 'Get active price rules applicable to a specific product'
    }),
    ApiParam({
      name: 'productId',
      required: true,
      description: 'Product ID to get applicable price rules for',
      type: Number
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
      description: 'Field to sort by (id, name, type, value, minQuantity, createdAt)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of price rules for the product',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 5 },
                name: { type: 'string', example: 'Product Discount' },
                type: { type: 'string', enum: ['discount', 'bulk_price', 'special_price'], example: 'discount' },
                value: { type: 'number', example: 15.00 },
                minQuantity: { type: 'number', example: 2 },
                maxQuantity: { type: 'number', example: 10, nullable: true },
                startDate: { type: 'string', format: 'date-time', nullable: true },
                endDate: { type: 'string', format: 'date-time', nullable: true },
                status: { type: 'string', example: 'enabled' },
                vendorGroupId: { type: 'number', example: 1, nullable: true },
                creatorType: { type: 'string', example: 'admin' },
                creatorId: { type: 'number', example: 1 }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 3 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 1 },
              hasNextPage: { type: 'boolean', example: false },
              hasPreviousPage: { type: 'boolean', example: false },
              sortBy: { type: 'string', example: 'minQuantity' },
              sortDirection: { type: 'string', example: 'asc' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'No price rules found for this product' })
  );
};

/**
 * Swagger decorator for "Get price rules for variant" endpoint
 */
export const GetVariantPriceRulesSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get active price rules for a product variant',
      description: 'Get active price rules applicable to a specific product variant'
    }),
    ApiParam({
      name: 'variantId',
      required: true,
      type: Number,
      description: 'Variant ID to get applicable price rules for'
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
      description: 'Field to sort by (id, name, type, value, minQuantity, createdAt)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of price rules for the variant',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 9 },
                name: { type: 'string', example: 'Variant Discount' },
                type: { type: 'string', enum: ['discount', 'bulk_price', 'special_price'], example: 'discount' },
                value: { type: 'number', example: 15.00 },
                minQuantity: { type: 'number', example: 1 },
                maxQuantity: { type: 'number', example: 5, nullable: true },
                startDate: { type: 'string', format: 'date-time', nullable: true },
                endDate: { type: 'string', format: 'date-time', nullable: true },
                status: { type: 'string', example: 'enabled' },
                vendorGroupId: { type: 'number', example: 2, nullable: true },
                creatorType: { type: 'string', example: 'user' },
                creatorId: { type: 'number', example: 15 }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 2 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 1 },
              hasNextPage: { type: 'boolean', example: false },
              hasPreviousPage: { type: 'boolean', example: false },
              sortBy: { type: 'string', example: 'minQuantity' },
              sortDirection: { type: 'string', example: 'asc' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'No price rules found for this variant' })
  );
};