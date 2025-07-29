import { applyDecorators } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiQuery,
  ApiBearerAuth
} from '@nestjs/swagger';
import { SortDirection } from '../../common/dto/pagination.dto';

/**
 * Swagger decorator for "Get price rules for vendor group" endpoint
 */
export const GetVendorGroupPriceRulesSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get active price rules for a vendor group',
      description: 'Get active price rules applicable to a specific vendor group'
    }),
    ApiParam({
      name: 'vendorGroupId',
      required: true,
      type: Number,
      description: 'Vendor Group ID to get applicable price rules for'
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
      description: 'List of price rules for the vendor group',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 7 },
                name: { type: 'string', example: 'Partner Discount' },
                type: { type: 'string', enum: ['discount', 'bulk_price', 'special_price'], example: 'discount' },
                value: { type: 'number', example: 10.00 },
                minQuantity: { type: 'number', example: 1 },
                maxQuantity: { type: 'number', example: null, nullable: true },
                startDate: { type: 'string', format: 'date-time', nullable: true },
                endDate: { type: 'string', format: 'date-time', nullable: true },
                status: { type: 'string', example: 'enabled' },
                vendorGroupId: { type: 'number', example: 3 },
                creatorType: { type: 'string', example: 'admin' },
                creatorId: { type: 'number', example: 1 }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 5 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 1 },
              hasNextPage: { type: 'boolean', example: false },
              hasPreviousPage: { type: 'boolean', example: false },
              sortBy: { type: 'string', example: 'createdAt' },
              sortDirection: { type: 'string', example: 'desc' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'No price rules found for this vendor group' })
  );
};

/**
 * Swagger decorator for "Get price rules for vendor" endpoint
 */
export const GetVendorPriceRulesSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get active price rules for a vendor',
      description: 'Get active price rules applicable to products from a specific vendor'
    }),
    ApiParam({
      name: 'vendorId',
      required: true,
      type: Number,
      description: 'Vendor ID to get applicable price rules for'
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
      description: 'List of price rules for the vendor',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 10 },
                name: { type: 'string', example: 'Vendor Discount' },
                type: { type: 'string', enum: ['discount', 'bulk_price', 'special_price'], example: 'discount' },
                value: { type: 'number', example: 12.50 },
                minQuantity: { type: 'number', example: 3 },
                maxQuantity: { type: 'number', example: null, nullable: true },
                startDate: { type: 'string', format: 'date-time', nullable: true },
                endDate: { type: 'string', format: 'date-time', nullable: true },
                status: { type: 'string', example: 'enabled' },
                vendorGroupId: { type: 'number', example: 1, nullable: true },
                creatorType: { type: 'string', example: 'user' },
                creatorId: { type: 'number', example: 15 }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 4 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 1 },
              hasNextPage: { type: 'boolean', example: false },
              hasPreviousPage: { type: 'boolean', example: false },
              sortBy: { type: 'string', example: 'createdAt' },
              sortDirection: { type: 'string', example: 'desc' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'No price rules found for this vendor' })
  );
};

/**
 * Swagger decorator for "Get price rules for shop" endpoint
 */
export const GetShopPriceRulesSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get active price rules for a shop',
      description: 'Get active price rules applicable to products from a specific shop'
    }),
    ApiParam({
      name: 'shopId',
      required: true,
      type: Number,
      description: 'Shop ID to get applicable price rules for'
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
      description: 'List of price rules for the shop',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 12 },
                name: { type: 'string', example: 'Shop Specific Discount' },
                type: { type: 'string', enum: ['discount', 'bulk_price', 'special_price'], example: 'discount' },
                value: { type: 'number', example: 8.00 },
                minQuantity: { type: 'number', example: 2 },
                maxQuantity: { type: 'number', example: 20, nullable: true },
                startDate: { type: 'string', format: 'date-time', nullable: true },
                endDate: { type: 'string', format: 'date-time', nullable: true },
                status: { type: 'string', example: 'enabled' },
                vendorGroupId: { type: 'number', example: null, nullable: true },
                creatorType: { type: 'string', example: 'user' },
                creatorId: { type: 'number', example: 15 }
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
    ApiResponse({ status: 404, description: 'No price rules found for this shop' })
  );
};

/**
 * Swagger decorator for "Get current vendor's price rules" endpoint
 */
export const GetCurrentVendorPriceRulesSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor] Get active price rules for authenticated vendor',
      description: 'Get active price rules applicable to products from the authenticated vendor'
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
      description: 'Field to sort by (id, name, type, value, minQuantity, createdAt)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of price rules for the authenticated vendor',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 15 },
                name: { type: 'string', example: 'My Shop Discount' },
                type: { type: 'string', enum: ['discount', 'bulk_price', 'special_price'], example: 'discount' },
                value: { type: 'number', example: 15.00 },
                minQuantity: { type: 'number', example: 3 },
                maxQuantity: { type: 'number', example: null, nullable: true },
                startDate: { type: 'string', format: 'date-time', nullable: true },
                endDate: { type: 'string', format: 'date-time', nullable: true },
                status: { type: 'string', example: 'enabled' },
                creatorType: { type: 'string', example: 'user' },
                creatorId: { type: 'number', example: 15 }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 4 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 1 },
              hasNextPage: { type: 'boolean', example: false },
              hasPreviousPage: { type: 'boolean', example: false },
              sortBy: { type: 'string', example: 'createdAt' },
              sortDirection: { type: 'string', example: 'desc' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - JWT token is invalid or expired' }),
    ApiResponse({ status: 403, description: 'Forbidden - Not enough permissions' }),
    ApiResponse({ status: 404, description: 'No vendor profile found for this user' })
  );
};

/**
 * Swagger decorator for "Get all price rules" endpoint
 */
export const GetAllPriceRulesSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get all price rules with pagination',
      description: 'Retrieve all price rules with pagination, sorting, and filtering options'
    }),
    ApiQuery({
      name: 'includeInactive',
      required: false,
      type: Boolean,
      description: 'Include inactive price rules (default: false)'
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
      description: 'Field to sort by (id, name, type, value, minQuantity, createdAt, status)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of price rules',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Spring Sale Discount' },
                type: { type: 'string', enum: ['discount', 'bulk_price', 'special_price'], example: 'discount' },
                value: { type: 'number', example: 15.00 },
                minQuantity: { type: 'number', example: 1 },
                maxQuantity: { type: 'number', example: null, nullable: true },
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
              totalItems: { type: 'number', example: 25 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 3 },
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