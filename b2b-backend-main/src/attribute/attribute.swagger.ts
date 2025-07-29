import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { SortDirection } from '../common/dto/pagination.dto';

export const CreateAttributeSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin] Create a new attribute',
      description: 'Endpoint to create a new attribute',
    }),
    ApiBearerAuth(),
    ApiBody({ type: CreateAttributeDto }),
    ApiResponse({ status: 201, description: 'Attribute created successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
  );
};

export const GetAllAttributesSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin] Get all attributes',
      description: 'Endpoint to retrieve all attributes with pagination',
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
      description: 'Field to sort by (id, name, createdAt, isEnabled)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of attributes returned successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Color' },
                description: { type: 'string', example: 'Product color attribute' },
                isEnabled: { type: 'boolean', example: true },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                values: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 1 },
                      value: { type: 'string', example: 'Red' },
                      hexValue: { type: 'string', example: '#FF0000' }
                    }
                  }
                }
              }
            }
          },
          meta: {
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
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  );
};

export const GetAttributeSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin] Get an attribute',
      description: 'Endpoint to retrieve a specific attribute by id',
    }),
    ApiResponse({ status: 200, description: 'Attribute returned successfully' }),
    ApiResponse({ status: 404, description: 'Attribute not found' }),
  );
};

export const UpdateAttributeSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin] Update an attribute',
      description: 'Endpoint to update attribute details',
    }),
    ApiBearerAuth(),
    ApiBody({ type: UpdateAttributeDto }),
    ApiResponse({ status: 200, description: 'Attribute updated successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Attribute not found' }),
  );
};

export const EnableAttributeSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin] Enable an attribute',
      description: 'Endpoint to enable a specific attribute',
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'Attribute enabled successfully' }),
    ApiResponse({ status: 404, description: 'Attribute not found' }),
  );
};

export const DisableAttributeSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin] Disable an attribute',
      description: 'Endpoint to disable a specific attribute',
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'Attribute disabled successfully' }),
    ApiResponse({ status: 404, description: 'Attribute not found' }),
  );
};

export const DeleteAttributeSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin] Delete an attribute',
      description: 'Endpoint to delete an attribute',
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'Attribute deleted successfully' }),
    ApiResponse({ status: 404, description: 'Attribute not found' }),
  );
};

export function AddAttributeValueSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin] Add a new value to an attribute',
      description: 'Add a new value to an existing attribute'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 201, description: 'The value has been successfully added' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ status: 404, description: 'Attribute not found' }),
    ApiResponse({ status: 409, description: 'Value already exists for this attribute' })
  );
}