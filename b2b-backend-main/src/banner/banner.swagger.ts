// src/banner/banner.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { CreateBannerTypeDto } from './dto/create-banner-type.dto';
import { SortDirection } from '../common/dto/pagination.dto';

export const CreateBannerTypeSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Create a banner type',
      description: 'Create a new banner type template'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 201, description: 'Banner type created successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - Only admins can create banner types' }),
    ApiBody({ type: CreateBannerTypeDto })
  );
};

export const UpdateBannerTypeSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Update a banner type',
      description: 'Update an existing banner type'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'Banner type updated successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - Only admins can update banner types' }),
    ApiResponse({ status: 404, description: 'Banner type not found' }),
    ApiParam({ name: 'id', type: Number, description: 'Banner type ID' })
  );
};

export const DeleteBannerTypeSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Delete a banner type',
      description: 'Delete an existing banner type'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'Banner type deleted successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - Only admins can delete banner types' }),
    ApiResponse({ status: 404, description: 'Banner type not found' }),
    ApiParam({ name: 'id', type: Number, description: 'Banner type ID' })
  );
};

export const GetBannerTypesSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get all banner types',
      description: 'Get a paginated list of all banner types'
    }),
    ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (starts from 1)' }),
    ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' }),
    ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort by' }),
    ApiQuery({ 
      name: 'sortDirection', 
      required: false, 
      enum: SortDirection, 
      description: 'Direction of sorting (ASC or DESC)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Banner types retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                width: { type: 'number' },
                height: { type: 'number' },
                status: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                _count: {
                  type: 'object',
                  properties: {
                    banners: { type: 'number' }
                  }
                }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number' },
              itemsPerPage: { type: 'number' },
              currentPage: { type: 'number' },
              totalPages: { type: 'number' },
              hasNextPage: { type: 'boolean' },
              hasPreviousPage: { type: 'boolean' },
              sortBy: { type: 'string' },
              sortDirection: { type: 'string' },
            }
          }
        }
      }
    })
  );
};

export const GetBannerTypeSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get banner type by ID',
      description: 'Get details of a specific banner type'
    }),
    ApiResponse({ status: 200, description: 'Banner type retrieved successfully' }),
    ApiResponse({ status: 404, description: 'Banner type not found' }),
    ApiParam({ name: 'id', type: Number, description: 'Banner type ID' })
  );
};

export const CreateBannerSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor Only] Create a banner',
      description: 'Create a new banner for a shop'
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['title', 'bannerTypeId', 'shopId', 'image'],
        properties: {
          title: { 
            type: 'string', 
            example: 'Summer Sale Banner' 
          },
          description: { 
            type: 'string', 
            example: 'Banner for summer promotion' 
          },
          image: {
            type: 'string',
            format: 'binary',
            description: 'Banner image file'
          },
          link: { 
            type: 'string', 
            example: 'https://example.com/summer-promo' 
          },
          startDate: { 
            type: 'string', 
            format: 'date-time', 
            example: '2025-06-01T00:00:00Z' 
          },
          endDate: { 
            type: 'string', 
            format: 'date-time', 
            example: '2025-08-31T23:59:59Z' 
          },
          bannerTypeId: { 
            type: 'number', 
            example: 1 
          },
          shopId: { 
            type: 'number', 
            example: 5 
          }
        }
      }
    }),
    ApiResponse({ status: 201, description: 'Banner created successfully' }),
    ApiResponse({ status: 400, description: 'Invalid banner data' }),
    ApiResponse({ status: 403, description: 'Forbidden - Not shop owner' }),
  );
};

export const GetShopBannersSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get all banners for a shop',
      description: 'Get a paginated list of all banners for a specific shop'
    }),
    ApiParam({ name: 'shopId', type: Number, description: 'Shop ID' }),
    ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (starts from 1)' }),
    ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' }),
    ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort by' }),
    ApiQuery({ 
      name: 'sortDirection', 
      required: false, 
      enum: SortDirection, 
      description: 'Direction of sorting (ASC or DESC)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Banners retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                title: { type: 'string' },
                description: { type: 'string' },
                imageUrl: { type: 'string' },
                link: { type: 'string' },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' },
                status: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                bannerTypeId: { type: 'number' },
                shopId: { type: 'number' },
                bannerType: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    width: { type: 'number' },
                    height: { type: 'number' },
                  }
                }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number' },
              itemsPerPage: { type: 'number' },
              currentPage: { type: 'number' },
              totalPages: { type: 'number' },
              hasNextPage: { type: 'boolean' },
              hasPreviousPage: { type: 'boolean' },
              sortBy: { type: 'string' },
              sortDirection: { type: 'string' },
            }
          }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Shop not found' })
  );
};

export const GetActiveBannersSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get active banners',
      description: 'Get active banners, optionally filtered by shop'
    }),
    ApiQuery({ name: 'shopId', required: false, type: Number, description: 'Shop ID for filtering' }),
    ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (starts from 1)' }),
    ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' }),
    ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort by' }),
    ApiQuery({ 
      name: 'sortDirection', 
      required: false, 
      enum: SortDirection, 
      description: 'Direction of sorting (ASC or DESC)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Active banners retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                title: { type: 'string' },
                description: { type: 'string' },
                imageUrl: { type: 'string' },
                link: { type: 'string' },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' },
                status: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                bannerTypeId: { type: 'number' },
                shopId: { type: 'number' },
                bannerType: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    width: { type: 'number' },
                    height: { type: 'number' },
                  }
                },
                shop: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    status: { type: 'string' },
                    logoUrl: { type: 'string' }
                  }
                }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number' },
              itemsPerPage: { type: 'number' },
              currentPage: { type: 'number' },
              totalPages: { type: 'number' },
              hasNextPage: { type: 'boolean' },
              hasPreviousPage: { type: 'boolean' },
              sortBy: { type: 'string' },
              sortDirection: { type: 'string' },
            }
          }
        }
      }
    })
  );
};

export const GetBannerSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get banner by ID',
      description: 'Get details of a specific banner'
    }),
    ApiParam({ name: 'id', type: Number, description: 'Banner ID' }),
    ApiResponse({ 
      status: 200, 
      description: 'Banner retrieved successfully',
      schema: {
        properties: {
          id: { type: 'number' },
          title: { type: 'string' },
          description: { type: 'string' },
          imageUrl: { type: 'string' },
          link: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          bannerTypeId: { type: 'number' },
          shopId: { type: 'number' },
          bannerType: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              width: { type: 'number' },
              height: { type: 'number' },
              status: { type: 'string' }
            }
          },
          shop: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              status: { type: 'string' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Banner not found' })
  );
};

export const UpdateBannerSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor Only] Update a banner',
      description: 'Update an existing banner'
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiParam({ name: 'id', type: Number, description: 'Banner ID' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: { 
            type: 'string', 
            example: 'Updated Summer Sale Banner' 
          },
          description: { 
            type: 'string', 
            example: 'Updated banner for summer promotion' 
          },
          image: {
            type: 'string',
            format: 'binary',
            description: 'Banner image file (optional)'
          },
          link: { 
            type: 'string', 
            example: 'https://example.com/updated-summer-promo' 
          },
          startDate: { 
            type: 'string', 
            format: 'date-time', 
            example: '2025-06-01T00:00:00Z' 
          },
          endDate: { 
            type: 'string', 
            format: 'date-time', 
            example: '2025-08-31T23:59:59Z' 
          },
          status: { 
            type: 'string', 
            example: 'active' 
          }
        }
      }
    }),
    ApiResponse({ status: 200, description: 'Banner updated successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - Not banner owner' }),
    ApiResponse({ status: 404, description: 'Banner not found' })
  );
};

export const DeleteBannerSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor Only] Delete a banner',
      description: 'Delete an existing banner'
    }),
    ApiBearerAuth(),
    ApiParam({ name: 'id', type: Number, description: 'Banner ID' }),
    ApiResponse({ status: 200, description: 'Banner deleted successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - Not banner owner' }),
    ApiResponse({ status: 404, description: 'Banner not found' })
  );
};