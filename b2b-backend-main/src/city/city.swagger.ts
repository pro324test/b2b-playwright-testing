import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { SortDirection } from '../common/dto/pagination.dto';

export const CreateCitySwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Create a city',
      description: 'Create a new city in the system'
    }),
    ApiBearerAuth(),
    ApiBody({ type: CreateCityDto }),
    ApiResponse({ status: 201, description: 'City created successfully' }),
    ApiResponse({ status: 400, description: 'Bad request - Invalid data' }),
    ApiResponse({ status: 409, description: 'Conflict - City with the same name already exists' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  );
};

export const GetAllCitiesSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all cities',
      description: 'Retrieve all cities with pagination'
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
      description: 'Field to sort by (id, name, isActive, createdAt, updatedAt)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of cities',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Los Angeles' },
                isActive: { type: 'boolean', example: true },
                createdAt: { type: 'string', format: 'date-time', example: '2025-03-01T10:30:00Z' },
                updatedAt: { type: 'string', format: 'date-time', example: '2025-03-01T10:30:00Z' }
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

export const GetCitySwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get a specific city',
      description: 'Retrieve details of a specific city by ID'
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: 'number',
      description: 'The ID of the city',
      example: 1
    }),
    ApiResponse({ 
      status: 200, 
      description: 'City details',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Los Angeles' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time', example: '2025-03-01T10:30:00Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2025-03-01T10:30:00Z' }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'City not found' })
  );
};

export const UpdateCitySwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin Only] Update city',
      description: 'Update details of an existing city'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      required: true,
      type: 'number',
      description: 'The ID of the city to update',
      example: 1
    }),
    ApiBody({ 
      type: UpdateCityDto,
      examples: {
        'Update name': {
          value: { name: 'New City Name' }
        },
        'Update status': {
          value: { isActive: false }
        },
        'Complete update': {
          value: {
            name: 'New City Name',
            isActive: false
          }
        }
      }
    }),
    ApiResponse({ status: 200, description: 'City updated successfully' }),
    ApiResponse({ status: 404, description: 'City not found' }),
    ApiResponse({ status: 409, description: 'Conflict - City with the same name already exists' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  );
};

export const EnableCitySwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin Only] Enable city',
      description: 'Enable a city that was previously disabled'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      required: true,
      type: 'number',
      description: 'The ID of the city to enable',
      example: 1
    }),
    ApiResponse({ 
      status: 200, 
      description: 'City enabled successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'City enabled successfully' }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'City not found' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  );
};

export const DisableCitySwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin Only] Disable city',
      description: 'Disable a city without deleting it'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      required: true,
      type: 'number',
      description: 'The ID of the city to disable',
      example: 1
    }),
    ApiResponse({ 
      status: 200, 
      description: 'City disabled successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'City disabled successfully' }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'City not found' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  );
};

export const DeleteCitySwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin Only] Delete city',
      description: 'Permanently delete a city. Will fail if the city is referenced by other entities.'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      required: true,
      type: 'number',
      description: 'The ID of the city to delete',
      example: 1
    }),
    ApiResponse({ 
      status: 200, 
      description: 'City deleted successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'City deleted successfully' }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'City not found' }),
    ApiResponse({ status: 409, description: 'Conflict - City is referenced by other records' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  );
};