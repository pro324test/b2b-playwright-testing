import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SortDirection } from '../common/dto/pagination.dto';

export const CreateCategorySwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Create a new category',
      description: 'Create a new category with optional parent category'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 201, description: 'Category created successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ status: 409, description: 'Category already exists' }),
    ApiResponse({ status: 404, description: 'Parent category not found' })
  );
};

export const UpdateCategorySwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Update a category',
      description: 'Update category details including parent-child relationships'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'Category updated successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ status: 400, description: 'Invalid parent category relationship' }),
    ApiResponse({ status: 404, description: 'Category or parent category not found' })
  );
};

export const DeleteCategorySwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Delete a category',
      description: 'Delete a category and update related hierarchies'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'Category deleted successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ status: 404, description: 'Category not found' })
  );
};

export const GetAllCategoriesSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get all categories',
      description: 'Get paginated category list with parent-child relationships'
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
      description: 'Field to sort by (id, name, level, status)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Paginated list of categories with their hierarchy',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                description: { type: 'string' },
                level: { type: 'number' },
                parent: { 
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' }
                  }
                },
                children: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      name: { type: 'string' }
                    }
                  }
                },
                _count: {
                  type: 'object',
                  properties: {
                    products: { type: 'number' },
                    children: { type: 'number' }
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
              sortBy: { type: 'string', example: 'name' },
              sortDirection: { type: 'string', example: 'desc' }
            }
          }
        }
      }
    })
  );
};

export const GetRootCategoriesSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get root categories',
      description: 'Get paginated top-level categories'
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
      description: 'Field to sort by (id, name, status)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Paginated list of root categories' 
    })
  );
};

export const GetSubcategoriesSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get subcategories',
      description: 'Get paginated subcategories of a specific category'
    }),
    ApiParam({ name: 'id', description: 'Parent category ID' }),
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
      description: 'Field to sort by (id, name, level, status)'
    }),
    ApiResponse({ status: 200, description: 'Paginated list of subcategories' }),
    ApiResponse({ status: 404, description: 'Parent category not found' })
  );
};

export const EnableCategorySwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Enable a category',
      description: 'Enable a disabled category to make it visible in public endpoints'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'Category enabled successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ status: 404, description: 'Category not found' })
  );
};

export const DisableCategorySwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Disable a category',
      description: 'Disable a category to hide it from public endpoints'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'Category disabled successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ status: 404, description: 'Category not found' })
  );
};

export const GetCategoryWithChildrenSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get category with full child hierarchy',
      description: 'Returns a category with its complete sub-category tree'
    }),
    ApiParam({ 
      name: 'id', 
      description: 'Category ID',
      type: 'number'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Category with its sub-categories',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          level: { type: 'number' },
          status: { type: 'string' },
          parent: { 
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'number' },
              name: { type: 'string' }
            } 
          },
          children: { 
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                children: {
                  type: 'array',
                  items: { type: 'object' }
                }
              }
            } 
          },
          _count: {
            type: 'object',
            properties: {
              products: { type: 'number' },
              children: { type: 'number' }
            }
          }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Category not found' 
    })
  );
};


