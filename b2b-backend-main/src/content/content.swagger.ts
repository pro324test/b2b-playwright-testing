import { applyDecorators } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiBody,
  ApiQuery,
  ApiConsumes
} from '@nestjs/swagger';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { UpdateContentTypeDto } from './dto/update-content-type.dto';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentFilterDto, ContentPublishStatus } from './dto/content-filter.dto';
import { SortDirection } from '../common/dto/pagination.dto';

/**
 * Content Type Swagger Decorators
 */
export const CreateContentTypeSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Create content type',
      description: 'Create a new content type category for organizing content items'
    }),
    ApiBearerAuth(),
    ApiBody({ type: CreateContentTypeDto }),
    ApiResponse({ 
      status: 201, 
      description: 'Content type created successfully',
      schema: {
        example: {
          id: 1,
          name: 'Banner',
          description: 'Homepage banner content',
          createdAt: '2025-04-23T12:00:00.000Z',
          updatedAt: '2025-04-23T12:00:00.000Z'
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 409, 
      description: 'Conflict - Content type with the same name already exists',
      schema: {
        example: {
          statusCode: 409,
          message: "Content type with name 'Banner' already exists",
          error: 'Conflict'
        }
      }
    })
  );
};

export const GetAllContentTypesSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get all content types',
      description: 'Get a list of all available content types'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of content types',
      schema: {
        example: [
          {
            id: 1,
            name: 'Banner',
            description: 'Homepage banner content',
            createdAt: '2025-04-23T12:00:00.000Z',
            updatedAt: '2025-04-23T12:00:00.000Z',
            _count: {
              contents: 5
            }
          },
          {
            id: 2,
            name: 'Feature Box',
            description: 'Product feature highlight box',
            createdAt: '2025-04-23T12:30:00.000Z',
            updatedAt: '2025-04-23T12:30:00.000Z',
            _count: {
              contents: 3
            }
          }
        ]
      }
    })
  );
};

export const GetContentTypeSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get content type details',
      description: 'Get detailed information about a specific content type'
    }),
    ApiParam({
      name: 'id',
      description: 'Content type ID',
      type: 'number'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Content type details',
      schema: {
        example: {
          id: 1,
          name: 'Banner',
          description: 'Homepage banner content',
          createdAt: '2025-04-23T12:00:00.000Z',
          updatedAt: '2025-04-23T12:00:00.000Z',
          _count: {
            contents: 5
          }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Content type not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Content type with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const UpdateContentTypeSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Update content type',
      description: 'Update an existing content type'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: 'Content type ID',
      type: 'number'
    }),
    ApiBody({ type: UpdateContentTypeDto }),
    ApiResponse({ 
      status: 200, 
      description: 'Content type updated successfully',
      schema: {
        example: {
          id: 1,
          name: 'Updated Banner',
          description: 'Updated homepage banner content',
          createdAt: '2025-04-23T12:00:00.000Z',
          updatedAt: '2025-04-23T13:15:00.000Z'
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'Content type not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Content type with ID 999 not found',
          error: 'Not Found'
        }
      }
    }),
    ApiResponse({ 
      status: 409, 
      description: 'Conflict - Content type with the same name already exists',
      schema: {
        example: {
          statusCode: 409,
          message: "Content type with name 'Banner' already exists",
          error: 'Conflict'
        }
      }
    })
  );
};

export const DeleteContentTypeSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Delete content type',
      description: 'Delete an existing content type. Cannot delete types that have associated content.'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: 'Content type ID',
      type: 'number'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Content type deleted successfully'
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'Content type not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Content type with ID 999 not found',
          error: 'Not Found'
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Bad Request - Content type has associated content',
      schema: {
        example: {
          statusCode: 400,
          message: 'Cannot delete content type that has 5 associated content items',
          error: 'Bad Request'
        }
      }
    })
  );
};

/**
 * Content Item Swagger Decorators
 */
export const CreateContentSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Create content',
      description: 'Create a new content item with file upload support'
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['title', 'typeId'],
        properties: {
          title: { 
            type: 'string', 
            example: 'Summer Sale' 
          },
          description: { 
            type: 'string', 
            example: 'Get up to 50% off on all summer items' 
          },
          typeId: { 
            type: 'integer', 
            example: 1 
          },
          backgroundColor: { 
            type: 'string', 
            example: '#FF5733' 
          },
          extraData: { 
            type: 'string', 
            example: '{"buttonText":"Shop Now","theme":"dark"}' 
          },
          link: { 
            type: 'string', 
            example: 'https://example.com/summer-sale' 
          },
          isPublished: { 
            type: 'boolean', 
            example: true 
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary'
            },
            description: 'Content images (up to 10)'
          },
          imagesMeta: {
            type: 'string',
            example: '[{"displayOrder":1},{"displayOrder":2}]',
            description: 'JSON string containing display order for uploaded images'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 201, 
      description: 'Content created successfully',
      schema: {
        example: {
          id: 1,
          title: 'Summer Sale',
          description: 'Get up to 50% off on all summer items',
          typeId: 1,
          backgroundColor: '#FF5733',
          extraData: { buttonText: 'Shop Now', theme: 'dark' },
          link: 'https://example.com/summer-sale',
          isPublished: true,
          publishedAt: '2025-04-23T12:00:00.000Z',
          createdById: 1,
          createdAt: '2025-04-23T12:00:00.000Z',
          updatedAt: '2025-04-23T12:00:00.000Z',
          type: {
            id: 1,
            name: 'Banner'
          },
          images: [
            {
              id: 1,
              imageUrl: '/uploads/content/image-1714042800000.jpg',
              displayOrder: 0
            }
          ]
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'Content type not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Content type with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const GetAllContentSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get all content',
      description: 'Get a paginated list of content with filtering options'
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
      name: 'publishStatus',
      required: false,
      enum: ContentPublishStatus,
      description: 'Filter by publish status (all, published, unpublished)'
    }),
    ApiQuery({
      name: 'typeId',
      required: false,
      type: Number,
      description: 'Filter by content type ID'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of content items with pagination',
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
                backgroundColor: { type: 'string' },
                link: { type: 'string' },
                isPublished: { type: 'boolean' },
                publishedAt: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                type: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' }
                  }
                },
                images: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      imageUrl: { type: 'string' },
                      displayOrder: { type: 'number' }
                    }
                  }
                }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
              totalPages: { type: 'number' },
              hasNextPage: { type: 'boolean' },
              hasPreviousPage: { type: 'boolean' }
            }
          }
        }
      }
    })
  );
};

export const GetContentSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get content details',
      description: 'Get detailed information about a specific content item'
    }),
    ApiParam({
      name: 'id',
      description: 'Content ID',
      type: 'number'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Content details',
      schema: {
        example: {
          id: 1,
          title: 'Summer Sale',
          description: 'Get up to 50% off on all summer items',
          typeId: 1,
          backgroundColor: '#FF5733',
          extraData: { buttonText: 'Shop Now', theme: 'dark' },
          link: 'https://example.com/summer-sale',
          isPublished: true,
          publishedAt: '2025-04-23T12:00:00.000Z',
          createdById: 1,
          createdAt: '2025-04-23T12:00:00.000Z',
          updatedAt: '2025-04-23T12:00:00.000Z',
          type: {
            id: 1,
            name: 'Banner'
          },
          images: [
            {
              id: 1,
              imageUrl: '/uploads/content/image-1714042800000.jpg',
              displayOrder: 0
            }
          ]
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Content not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Content with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const UpdateContentSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Update content',
      description: 'Update an existing content item with file upload support'
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiParam({
      name: 'id',
      description: 'Content ID',
      type: 'number'
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: { 
            type: 'string', 
            example: 'Updated Summer Sale' 
          },
          description: { 
            type: 'string', 
            example: 'Get up to 70% off on all summer items' 
          },
          typeId: { 
            type: 'integer', 
            example: 1 
          },
          backgroundColor: { 
            type: 'string', 
            example: '#FF8C00' 
          },
          extraData: { 
            type: 'string', 
            example: '{"buttonText":"Shop Now","theme":"light"}' 
          },
          link: { 
            type: 'string', 
            example: 'https://example.com/updated-summer-sale' 
          },
          isPublished: { 
            type: 'boolean', 
            example: true 
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary'
            },
            description: 'Content images (up to 10)'
          },
          imagesMeta: {
            type: 'string',
            example: '[{"displayOrder":1},{"displayOrder":2}]',
            description: 'JSON string containing display order for uploaded images'
          },
          deleteImageIds: {
            type: 'string',
            example: '[1, 2]',
            description: 'JSON array of image IDs to delete'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Content updated successfully',
      schema: {
        example: {
          id: 1,
          title: 'Updated Summer Sale',
          description: 'Get up to 70% off on all summer items',
          typeId: 1,
          backgroundColor: '#FF8C00',
          extraData: { buttonText: 'Shop Now', theme: 'light' },
          link: 'https://example.com/updated-summer-sale',
          isPublished: true,
          publishedAt: '2025-04-23T12:00:00.000Z',
          createdById: 1,
          createdAt: '2025-04-23T12:00:00.000Z',
          updatedAt: '2025-04-23T13:30:00.000Z',
          type: {
            id: 1,
            name: 'Banner'
          },
          images: [
            {
              id: 2,
              imageUrl: '/uploads/content/image-1714046000000.jpg',
              displayOrder: 0
            }
          ]
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'Content or content type not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Content with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const DeleteContentSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Delete content',
      description: 'Delete an existing content item and its associated images'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: 'Content ID',
      type: 'number'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Content deleted successfully'
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'Content not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Content with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const PublishContentSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Publish content',
      description: 'Publish a content item to make it visible to users'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: 'Content ID',
      type: 'number'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Content published successfully',
      schema: {
        example: {
          id: 1,
          title: 'Summer Sale',
          isPublished: true,
          publishedAt: '2025-04-23T14:00:00.000Z',
          updatedAt: '2025-04-23T14:00:00.000Z',
          // Other content properties...
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'Content not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Content with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const UnpublishContentSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Unpublish content',
      description: 'Unpublish a content item to hide it from users'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: 'Content ID',
      type: 'number'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Content unpublished successfully',
      schema: {
        example: {
          id: 1,
          title: 'Summer Sale',
          isPublished: false,
          publishedAt: null,
          updatedAt: '2025-04-23T14:30:00.000Z',
          // Other content properties...
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'Content not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Content with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const GetPublishedContentByTypeSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get published content by type',
      description: 'Get all published content items of a specific type'
    }),
    ApiParam({
      name: 'typeId',
      description: 'Content Type ID',
      type: 'number'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of published content items',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
            backgroundColor: { type: 'string' },
            extraData: { 
              type: 'object',
              additionalProperties: true
            },
            link: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  imageUrl: { type: 'string' },
                  displayOrder: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Content type not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Content type with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};