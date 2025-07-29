import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { AdminMeResponseDto } from './dto/admin-me-response.dto';
import { SortDirection } from '../common/dto/pagination.dto';

export const CreateSuperAdminSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Create the super admin',
      description: 'Can only be called once to create the first super admin'
    }),
    ApiResponse({ status: 201, description: 'Super admin created successfully' }),
    ApiResponse({ status: 409, description: 'Super admin has already been created' }),
    ApiBody({ type: CreateSuperAdminDto })
  );
};

export const CreateAdminSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[SuperAdmin Only] Create a new admin',
      description: 'Only super admin can create new admin accounts'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 201, description: 'Admin created successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - SuperAdmin access required' }),
    ApiBody({ type: CreateAdminDto })
  );
};

export const LoginAdminSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Admin login',
      description: 'Login endpoint for admin and super admin accounts. Can use username, email or phone number to login.'
    }),
    ApiResponse({ status: 200, description: 'Login successful' }),
    ApiResponse({ status: 409, description: 'Invalid credentials' }),
    ApiBody({ type: LoginAdminDto })
  );
};

export const LogoutAdminSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin/SuperAdmin] Admin logout',
      description: 'Logout endpoint for authenticated admin users'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'Logged out successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' })
  );
};

export const DeleteAdminSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[SuperAdmin Only] Delete an admin',
      description: 'Only super admin can delete admin accounts'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'Admin deleted successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - SuperAdmin access required' }),
    ApiResponse({ status: 404, description: 'Admin not found' })
  );
};

export const DisableAdminSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[SuperAdmin Only] Disable an admin',
      description: 'Only super admin can disable admin accounts'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'Admin disabled successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - SuperAdmin access required' }),
    ApiResponse({ status: 404, description: 'Admin not found' })
  );
};

export const EnableAdminSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[SuperAdmin Only] Enable an admin',
      description: 'Only super admin can enable admin accounts'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'Admin enabled successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - SuperAdmin access required' }),
    ApiResponse({ status: 404, description: 'Admin not found' })
  );
};

export const GetAllAdminsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin/SuperAdmin] Get all admins',
      description: 'View paginated list of all admin accounts (accessible by both admin and super admin)'
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
      description: 'Field to sort by (id, username, email, phoneNumber, firstName, lastName, createdAt, role)'
    }),
    ApiResponse({
      status: 200,
      description: 'List of admins with pagination',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                username: { type: 'string', example: 'admin' },
                email: { type: 'string', example: 'admin@example.com' },
                phoneNumber: { type: 'string', example: '218912345678' },
                firstName: { type: 'string', example: 'Admin' },
                lastName: { type: 'string', example: 'User' },
                role: { type: 'string', example: 'admin' },
                isDisabled: { type: 'boolean', example: false },
                createdAt: { type: 'string', format: 'date-time' },
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

export const GetMeSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin Only] Get admin profile',
      description: 'Get detailed information about the authenticated admin'
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'Admin profile retrieved successfully',
      type: AdminMeResponseDto
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ status: 404, description: 'Admin not found' })
  );
};