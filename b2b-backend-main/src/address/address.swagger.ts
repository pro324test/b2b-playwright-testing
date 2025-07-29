import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { CreateUserAddressDto, UpdateUserAddressDto } from './dto/user-address.dto';
import { CreateShopAddressDto, UpdateShopAddressDto } from './dto/shop-address.dto';

// User Address Swagger Decorators

export const CreateUserAddressSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Create user address',
      description: 'Create a new address for the authenticated user. Maximum 3 addresses allowed per user.',
    }),
    ApiBearerAuth(),
    ApiBody({ type: CreateUserAddressDto }),
    ApiResponse({
      status: 201,
      description: 'Address created successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          street: { type: 'string', example: '123 Main Street' },
          city: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Los Angeles' },
            },
          },
          googleMapsLink: { type: 'string', example: 'https://goo.gl/maps/abcdef123456' },
          latitude: { type: 'number', example: 34.0522 },
          longitude: { type: 'number', example: -118.2437 },
          notes: { type: 'string', example: 'Ring the doorbell twice' },
          addressType: { type: 'string', example: 'home' },
          isDefault: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - validation errors or maximum address limit reached',
    }),
    ApiResponse({
      status: 404,
      description: 'City not found',
    }),
  );
};

export const GetUserAddressesSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all user addresses',
      description: 'Retrieve all addresses for the authenticated user.',
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'List of user addresses',
      schema: {
        type: 'array',
        items: {
          properties: {
            id: { type: 'number', example: 1 },
            street: { type: 'string', example: '123 Main Street' },
            city: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Los Angeles' },
              },
            },
            googleMapsLink: { type: 'string', example: 'https://goo.gl/maps/abcdef123456' },
            latitude: { type: 'number', example: 34.0522 },
            longitude: { type: 'number', example: -118.2437 },
            notes: { type: 'string', example: 'Ring the doorbell twice' },
            addressType: { type: 'string', example: 'home' },
            isDefault: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    }),
  );
};

export const GetUserAddressSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user address',
      description: 'Retrieve a specific address for the authenticated user.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      required: true,
      type: 'number',
      description: 'Address ID',
    }),
    ApiResponse({
      status: 200,
      description: 'User address details',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          street: { type: 'string', example: '123 Main Street' },
          city: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Los Angeles' },
            },
          },
          googleMapsLink: { type: 'string', example: 'https://goo.gl/maps/abcdef123456' },
          latitude: { type: 'number', example: 34.0522 },
          longitude: { type: 'number', example: -118.2437 },
          notes: { type: 'string', example: 'Ring the doorbell twice' },
          addressType: { type: 'string', example: 'home' },
          isDefault: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({ status: 404, description: 'Address not found' }),
  );
};

export const UpdateUserAddressSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Update user address',
      description: 'Update a specific address for the authenticated user.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      required: true,
      type: 'number',
      description: 'Address ID',
    }),
    ApiBody({ type: UpdateUserAddressDto }),
    ApiResponse({
      status: 200,
      description: 'Address updated successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          street: { type: 'string', example: '456 Updated Street' },
          city: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 2 },
              name: { type: 'string', example: 'San Francisco' },
            },
          },
          googleMapsLink: { type: 'string', example: 'https://goo.gl/maps/updated123' },
          latitude: { type: 'number', example: 34.1234 },
          longitude: { type: 'number', example: -118.1234 },
          notes: { type: 'string', example: 'Updated delivery notes' },
          addressType: { type: 'string', example: 'work' },
          isDefault: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({ status: 404, description: 'Address or city not found' }),
  );
};

export const SetDefaultUserAddressSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Set default user address',
      description: 'Set a specific address as the default for the authenticated user.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      required: true,
      type: 'number',
      description: 'Address ID',
    }),
    ApiResponse({
      status: 200,
      description: 'Address set as default successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          street: { type: 'string', example: '123 Main Street' },
          city: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Los Angeles' },
            },
          },
          googleMapsLink: { type: 'string', example: 'https://goo.gl/maps/abcdef123456' },
          latitude: { type: 'number', example: 34.0522 },
          longitude: { type: 'number', example: -118.2437 },
          notes: { type: 'string', example: 'Ring the doorbell twice' },
          addressType: { type: 'string', example: 'home' },
          isDefault: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({ status: 404, description: 'Address not found' }),
  );
};

export const DeleteUserAddressSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete user address',
      description: 'Delete a specific address for the authenticated user.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      required: true,
      type: 'number',
      description: 'Address ID',
    }),
    ApiResponse({
      status: 200,
      description: 'Address deleted successfully',
      schema: {
        properties: {
          message: { type: 'string', example: 'Address deleted successfully' },
        },
      },
    }),
    ApiResponse({ status: 404, description: 'Address not found' }),
  );
};

// Shop Address Swagger Decorators

export const CreateShopAddressSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Vendor Only] Create shop address',
      description: 'Create a new address for a shop. Vendor must be the owner of the shop.',
    }),
    ApiBearerAuth(),
    ApiBody({ type: CreateShopAddressDto }),
    ApiResponse({
      status: 201,
      description: 'Shop address created successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          shopId: { type: 'number', example: 5 },
          street: { type: 'string', example: '123 Business Street' },
          city: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Los Angeles' },
            },
          },
          googleMapsLink: { type: 'string', example: 'https://goo.gl/maps/business123' },
          latitude: { type: 'number', example: 34.0522 },
          longitude: { type: 'number', example: -118.2437 },
          notes: { type: 'string', example: 'Business hours: 9 AM - 5 PM' },
          isDefault: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Not authorized to manage this shop',
    }),
    ApiResponse({
      status: 404,
      description: 'Shop or city not found',
    }),
  );
};

export const GetShopAddressesSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all shop addresses',
      description: 'Retrieve all addresses for a specific shop.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'shopId',
      required: true,
      type: 'number',
      description: 'Shop ID',
    }),
    ApiResponse({
      status: 200,
      description: 'List of shop addresses',
      schema: {
        type: 'array',
        items: {
          properties: {
            id: { type: 'number', example: 1 },
            shopId: { type: 'number', example: 5 },
            street: { type: 'string', example: '123 Business Street' },
            city: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Los Angeles' },
              },
            },
            googleMapsLink: { type: 'string', example: 'https://goo.gl/maps/business123' },
            latitude: { type: 'number', example: 34.0522 },
            longitude: { type: 'number', example: -118.2437 },
            notes: { type: 'string', example: 'Business hours: 9 AM - 5 PM' },
            isDefault: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    }),
  );
};

export const GetShopAddressSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get shop address',
      description: 'Retrieve a specific address for a shop.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'shopId',
      required: true,
      type: 'number',
      description: 'Shop ID',
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: 'number',
      description: 'Address ID',
    }),
    ApiResponse({
      status: 200,
      description: 'Shop address details',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          shopId: { type: 'number', example: 5 },
          street: { type: 'string', example: '123 Business Street' },
          city: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Los Angeles' },
            },
          },
          googleMapsLink: { type: 'string', example: 'https://goo.gl/maps/business123' },
          latitude: { type: 'number', example: 34.0522 },
          longitude: { type: 'number', example: -118.2437 },
          notes: { type: 'string', example: 'Business hours: 9 AM - 5 PM' },
          isDefault: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({ status: 404, description: 'Address not found for this shop' }),
  );
};

export const UpdateShopAddressSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Vendor Only] Update shop address',
      description: 'Update a specific address for a shop. Vendor must be the owner of the shop.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      required: true,
      type: 'number',
      description: 'Address ID',
    }),
    ApiBody({ type: UpdateShopAddressDto }),
    ApiResponse({
      status: 200,
      description: 'Shop address updated successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          shopId: { type: 'number', example: 5 },
          street: { type: 'string', example: '456 Updated Business Street' },
          city: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 2 },
              name: { type: 'string', example: 'San Francisco' },
            },
          },
          googleMapsLink: { type: 'string', example: 'https://goo.gl/maps/updated-business' },
          latitude: { type: 'number', example: 34.1234 },
          longitude: { type: 'number', example: -118.1234 },
          notes: { type: 'string', example: 'Updated business hours: 10 AM - 6 PM' },
          isDefault: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Not authorized to manage this shop',
    }),
    ApiResponse({
      status: 404,
      description: 'Address or city not found',
    }),
  );
};

export const SetDefaultShopAddressSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Vendor Only] Set default shop address',
      description: 'Set a specific address as the default for a shop. Vendor must be the owner of the shop.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      required: true,
      type: 'number',
      description: 'Address ID',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          shopId: { type: 'number', example: 5 },
        },
        required: ['shopId'],
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Shop address set as default successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          shopId: { type: 'number', example: 5 },
          street: { type: 'string', example: '123 Business Street' },
          city: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Los Angeles' },
            },
          },
          googleMapsLink: { type: 'string', example: 'https://goo.gl/maps/business123' },
          latitude: { type: 'number', example: 34.0522 },
          longitude: { type: 'number', example: -118.2437 },
          notes: { type: 'string', example: 'Business hours: 9 AM - 5 PM' },
          isDefault: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Not authorized to manage this shop',
    }),
    ApiResponse({ status: 404, description: 'Address not found for this shop' }),
  );
};

export const DeleteShopAddressSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Vendor Only] Delete shop address',
      description: 'Delete a specific address for a shop. Vendor must be the owner of the shop.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      required: true,
      type: 'number',
      description: 'Address ID',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          shopId: { type: 'number', example: 5 },
        },
        required: ['shopId'],
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Shop address deleted successfully',
      schema: {
        properties: {
          message: { type: 'string', example: 'Shop address deleted successfully' },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Not authorized to manage this shop',
    }),
    ApiResponse({ status: 404, description: 'Address not found for this shop' }),
  );
};