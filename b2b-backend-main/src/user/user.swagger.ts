import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UserMeResponseDto } from './dto/user-me-response.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SortDirection } from '../common/dto/pagination.dto';

export const GetAllUsersSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Get all users',
      description: 'Get a paginated list of all users in the system'
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
      description: 'Field to sort by (id, username, email, phoneNumber, firstName, lastName, role, createdAt)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of users retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 5 },
                username: { type: 'string', example: 'johndoe' },
                email: { type: 'string', example: 'john@example.com' },
                phoneNumber: { type: 'string', example: '218912345678' }, // Add phoneNumber
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' },
                role: { type: 'string', example: 'user' },
                isDisabled: { type: 'boolean', example: false },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
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
              sortBy: { type: 'string', example: 'username' },
              sortDirection: { type: 'string', example: 'asc' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  );
};

export const UpdateUserSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Update user profile',
      description: 'Users can update their own profile information'
    }),
    ApiBearerAuth(),
    ApiBody({
      type: UpdateUserDto,
      examples: {
        'Update Name': {
          value: {
            firstName: 'John',
            lastName: 'Smith'
          }
        },
        'Update Credentials': {
          value: {
            username: 'newusername',
            email: 'newemail@example.com',
            phoneNumber: '218912345678', // Add phoneNumber
            password: 'newpassword123'
          }
        },
        'Complete Update': {
          value: {
            username: 'newusername',
            email: 'newemail@example.com',
            phoneNumber: '218912345678', // Add phoneNumber
            password: 'newpassword123',
            firstName: 'John',
            lastName: 'Smith'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'User information updated successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 5 },
          username: { type: 'string', example: 'newusername' },
          email: { type: 'string', example: 'newemail@example.com' },
          phoneNumber: { type: 'string', example: '218912345678' }, // Add phoneNumber
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Smith' },
          role: { type: 'string', example: 'user' },
          createdAt: { type: 'string', format: 'date-time', example: '2025-01-15T10:30:00Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2025-02-27T15:45:30Z' }
        }
      }
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' }),
    ApiResponse({ 
      status: 404, 
      description: 'User not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'User not found',
          error: 'Not Found'
        }
      }
    }),
    ApiResponse({ 
      status: 409, 
      description: 'Username, email, or phone number already exists',
      schema: {
        example: {
          statusCode: 409,
          message: 'Username already exists',
          error: 'Conflict'
        }
      }
    })
  );
};

export const GetMeSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Authenticated] Get user profile',
      description: 'Get detailed information about the authenticated user'
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'User profile retrieved successfully',
      schema: {
        example: {
          id: 5,
          username: 'johndoe',
          email: 'john@example.com',
          phoneNumber: '218912345678', // Add phoneNumber
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          isDisabled: false,
          createdAt: '2025-01-15T10:30:00Z',
          updatedAt: '2025-01-15T10:30:00Z',
          vendor: null // or vendor details if applicable
        }
      }
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ 
      status: 404, 
      description: 'User not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'User not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const GetUserByIdSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin Only] Get user by ID',
      description: 'Get detailed information about a specific user by ID'
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'User details retrieved successfully',
      schema: {
        example: {
          id: 5,
          username: 'johndoe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'vendor',
          isDisabled: false,
          createdAt: '2025-01-15T10:30:00Z',
          updatedAt: '2025-01-15T10:30:00Z',
          vendor: {
            id: 3,
            isDisabled: false,
            shops: [
              {
                id: 7,
                name: 'Tech Shop',
                status: 'enabled'
              }
            ]
          }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'User not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'User with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const UpdateUserByAdminSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin Only] Update user by ID',
      description: 'Admin can update any user\'s information including role'
    }),
    ApiBearerAuth(),
    ApiBody({
      type: UpdateUserAdminDto,
      examples: {
        'Update Name': {
          value: {
            firstName: 'John',
            lastName: 'Smith'
          }
        },
        'Update Credentials': {
          value: {
            username: 'newusername',
            email: 'newemail@example.com',
            password: 'newpassword123'
          }
        },
        'Update Role': {
          value: {
            role: 'user'
          }
        },
        'Update Status': {
          value: {
            isDisabled: true
          }
        },
        'Complete Update': {
          value: {
            username: 'newusername',
            email: 'newemail@example.com',
            password: 'newpassword123',
            firstName: 'John',
            lastName: 'Smith',
            role: 'vendor',
            isDisabled: false
          }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: 'User updated successfully',
      schema: {
        example: {
          id: 5,
          username: 'newusername',
          email: 'newemail@example.com',
          firstName: 'John',
          lastName: 'Smith',
          role: 'vendor',
          isDisabled: false,
          createdAt: '2025-01-15T10:30:00Z',
          updatedAt: '2025-02-27T15:45:30Z'
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'User not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'User with ID 999 not found',
          error: 'Not Found'
        }
      }
    }),
    ApiResponse({ 
      status: 409, 
      description: 'Username or email already exists',
      schema: {
        example: {
          statusCode: 409,
          message: 'Username already exists',
          error: 'Conflict'
        }
      }
    })
  );
};

export const EnableUserSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin Only] Enable user',
      description: 'Enable a disabled user account'
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'User enabled successfully',
      schema: {
        example: {
          message: 'User enabled successfully'
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'User not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'User with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const DisableUserSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin Only] Disable user',
      description: 'Temporarily disable a user account without deleting it'
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'User disabled successfully',
      schema: {
        example: {
          message: 'User disabled successfully'
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'User not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'User with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const DeleteUserSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin Only] Delete user',
      description: 'Permanently delete a user account. Cannot delete users with active vendor shops that have products.'
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'User deleted successfully',
      schema: {
        example: {
          message: 'User deleted successfully'
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'User not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'User with ID 999 not found',
          error: 'Not Found'
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Cannot delete user with active shops/products',
      schema: {
        example: {
          statusCode: 400,
          message: 'Cannot delete user with active vendor account that has shops with products',
          error: 'Bad Request'
        }
      }
    })
  );
};

export const GetAllVendorUsersSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Get all vendor users',
      description: 'Get a paginated list of all users with vendor role'
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
      description: 'Field to sort by (id, username, email, firstName, lastName, createdAt)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of vendor users retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 5 },
                username: { type: 'string', example: 'vendoruser' },
                email: { type: 'string', example: 'vendor@example.com' },
                firstName: { type: 'string', example: 'Jane' },
                lastName: { type: 'string', example: 'Smith' },
                role: { type: 'string', example: 'vendor' },
                isDisabled: { type: 'boolean', example: false },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                vendor: { 
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    shops: { type: 'array' },
                    groups: { type: 'array' }
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
              sortBy: { type: 'string', example: 'username' },
              sortDirection: { type: 'string', example: 'asc' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  );
};
