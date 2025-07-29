import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { SortDirection } from '../common/dto/pagination.dto';

export const CreateBrandSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Create a brand',
      description: 'Create a new product brand with logo upload'
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { 
            type: 'string', 
            example: 'Nike' 
          },
          description: { 
            type: 'string', 
            example: 'Sports and lifestyle brand' 
          },
          website: { 
            type: 'string', 
            example: 'https://example.com' 
          },
          logo: {
            type: 'string',
            format: 'binary',
            description: 'Brand logo image'
          }
        }
      }
    }),
    ApiResponse({ status: 201, description: 'Brand created successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ status: 400, description: 'Bad request - Invalid data or file' })
  );
};

export const GetAllBrandsSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all brands',
      description: 'Retrieve all product brands with pagination'
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
      description: 'Field to sort by (id, name, createdAt, status)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of brands retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Nike' },
                description: { type: 'string', example: 'Sports and lifestyle brand' },
                logo: { type: 'string', example: '/uploads/brands/logo-12345.jpg' },
                website: { type: 'string', example: 'https://example.com' },
                status: { type: 'string', example: 'enabled' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                _count: {
                  type: 'object',
                  properties: {
                    products: { type: 'number', example: 25 }
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
    })
  );
};

export const GetOneBrandSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get a brand by ID',
      description: 'Retrieve a single brand by its ID'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Brand retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Nike' },
          description: { type: 'string', example: 'Sports and lifestyle brand' },
          logo: { type: 'string', example: '/uploads/brands/logo-12345.jpg' },
          website: { type: 'string', example: 'https://example.com' },
          status: { type: 'string', example: 'enabled' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          _count: {
            type: 'object',
            properties: {
              products: { type: 'number', example: 25 }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Brand not found' })
  );
};

export const UpdateBrandSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin Only] Update a brand',
      description: 'Update brand details including logo'
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: { 
            type: 'string', 
            example: 'Updated Nike' 
          },
          description: { 
            type: 'string', 
            example: 'Updated sports and lifestyle brand description' 
          },
          website: { 
            type: 'string', 
            example: 'https://updated-website.com' 
          },
          logo: {
            type: 'string',
            format: 'binary',
            description: 'New brand logo image'
          },
          removeLogo: {
            type: 'boolean',
            example: 'false',
            description: 'Set to true to remove the existing logo'
          }
        }
      }
    }),
    ApiResponse({ status: 200, description: 'Brand updated successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ status: 404, description: 'Brand not found' })
  );
};

export const DeleteBrandSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin Only] Delete a brand',
      description: 'Delete a brand by its ID'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'Brand deleted successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - Only admins can delete brands' }),
    ApiResponse({ status: 404, description: 'Brand not found' })
  );
};