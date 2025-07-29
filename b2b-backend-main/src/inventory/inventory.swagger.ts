import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { SortDirection } from '../common/dto/pagination.dto';

export const CreateInventorySwagger = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create inventory for a product' }),
    ApiBearerAuth(),
    ApiBody({
      type: CreateInventoryDto,
      examples: {
        basic: {
          summary: 'Basic Inventory',
          value: {
            productId: 1,
            quantity: 100,
            lowStockThreshold: 10
          }
        }
      }
    }),
    ApiResponse({ status: 201, description: 'Inventory created successfully' }),
    ApiResponse({ status: 404, description: 'Product not found' }),
    ApiResponse({ status: 400, description: 'Inventory already exists' })
  );
};

export const UpdateInventorySwagger = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update product inventory' }),
    ApiBearerAuth(),
    ApiBody({
      type: UpdateInventoryDto,
      examples: {
        basic: {
          summary: 'Update Inventory',
          value: {
            quantity: 150,
            lowStockThreshold: 20
          }
        }
      }
    }),
    ApiResponse({ status: 200, description: 'Inventory updated successfully' }),
    ApiResponse({ status: 404, description: 'Inventory not found' })
  );
};

export const AdjustStockSwagger = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Adjust stock quantity' }),
    ApiBearerAuth(),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          quantity: { type: 'number', example: 10 },
          type: { type: 'string', enum: ['add', 'remove'], example: 'add' }
        }
      },
      examples: {
        add: {
          summary: 'Add Stock',
          value: {
            quantity: 10,
            type: 'add'
          }
        },
        remove: {
          summary: 'Remove Stock',
          value: {
            quantity: 5,
            type: 'remove'
          }
        }
      }
    }),
    ApiResponse({ status: 200, description: 'Stock adjusted successfully' }),
    ApiResponse({ status: 404, description: 'Inventory not found' }),
    ApiResponse({ status: 400, description: 'Invalid adjustment' })
  );
};

export const GetLowStockSwagger = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get low stock products with pagination' }),
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
      description: 'Field to sort by (id, quantity, lowStockThreshold, createdAt, updatedAt)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Low stock products retrieved successfully with pagination',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                productId: { type: 'number', example: 42 },
                quantity: { type: 'number', example: 5 },
                lowStockThreshold: { type: 'number', example: 10 },
                isLowStock: { type: 'boolean', example: true },
                product: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 42 },
                    name: { type: 'string', example: 'Office Chair' },
                    shop: {
                      type: 'object',
                      properties: {
                        id: { type: 'number', example: 3 },
                        name: { type: 'string', example: 'Furniture Store' }
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
              totalItems: { type: 'number', example: 25 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 3 },
              hasNextPage: { type: 'boolean', example: true },
              hasPreviousPage: { type: 'boolean', example: false },
              sortBy: { type: 'string', example: 'quantity' },
              sortDirection: { type: 'string', example: 'asc' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Role not permitted' })
  );
};