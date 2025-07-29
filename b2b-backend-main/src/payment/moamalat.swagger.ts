import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { 
  CreateMoamalatCredentialDto, 
  UpdateMoamalatCredentialDto,
  MoamalatSystemSettingsDto 
} from './dto/moamalat-credential.dto';

export const GetMoamalatCredentialsSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get Moamalat credentials for payment processing',
      description: 'Retrieves the appropriate Moamalat credentials for a shop (vendor-specific or system default).',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'shopId',
      type: 'number',
      description: 'ID of the shop to get payment credentials for',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Moamalat credentials retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          merchantId: { type: 'string', example: '10081014649' },
          terminalId: { type: 'string', example: '99179395' },
          secureKey: { type: 'string', example: '3a488a89b3f7993476c252f017c488bb' },
          isVendorAccount: { type: 'boolean', example: true },
        },
      },
    }),
    ApiResponse({ status: 404, description: 'Shop not found or system credentials not configured' }),
  );
};

export const CreateMoamalatCredentialsSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Vendor Only] Add Moamalat payment credentials',
      description: 'Allows vendors to add or update their Moamalat payment gateway credentials.',
    }),
    ApiBearerAuth(),
    ApiBody({
      type: CreateMoamalatCredentialDto,
    }),
    ApiResponse({
      status: 201,
      description: 'Credentials added successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          vendorId: { type: 'number', example: 5 },
          merchantId: { type: 'string', example: '10081014649' },
          terminalId: { type: 'string', example: '99179395' },
          secureKey: { type: 'string', example: '3a488a89b3f7993476c252f017c488bb' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Only vendors can create credentials',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Vendor account not found for user',
    }),
  );
};

export const GetVendorMoamalatCredentialsSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Vendor Only] Get current Moamalat credentials',
      description: "Retrieves the vendor's current Moamalat payment gateway credentials.",
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'Credentials retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          merchantId: { type: 'string', example: '10081014649' },
          terminalId: { type: 'string', example: '99179395' },
          secureKey: { type: 'string', example: '3a488a89b3f7993476c252f017c488bb' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Credentials not found for this vendor',
    }),
  );
};

export const UpdateMoamalatCredentialsSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Vendor Only] Update Moamalat credentials',
      description: "Updates the vendor's Moamalat payment gateway credentials.",
    }),
    ApiBearerAuth(),
    ApiBody({
      type: UpdateMoamalatCredentialDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Credentials updated successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          merchantId: { type: 'string', example: '10081014649' },
          terminalId: { type: 'string', example: '99179395' },
          secureKey: { type: 'string', example: '3a488a89b3f7993476c252f017c488bb' },
          isActive: { type: 'boolean', example: true },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Credentials not found for this vendor',
    }),
  );
};

export const ToggleCredentialsStatusSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Vendor Only] Enable/disable Moamalat credentials',
      description: "Toggle the active status of the vendor's Moamalat credentials.",
    }),
    ApiBearerAuth(),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          isActive: { type: 'boolean', example: false },
        },
        required: ['isActive'],
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Credentials status updated successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          isActive: { type: 'boolean', example: false },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Credentials not found for this vendor',
    }),
  );
};

export const SetSystemCredentialsSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin Only] Set system default Moamalat credentials',
      description: 'Configure platform-wide default Moamalat credentials used when vendors have not set up their own.',
    }),
    ApiBearerAuth(),
    ApiBody({
      type: MoamalatSystemSettingsDto,
    }),
    ApiResponse({
      status: 200,
      description: 'System credentials updated successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'System Moamalat credentials updated successfully' },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Admin access required',
    }),
  );
};

export const GetSystemCredentialsSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Admin Only] Get system default Moamalat credentials',
      description: 'Retrieve the current platform-wide default Moamalat credentials.',
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'System credentials retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          merchantId: { type: 'string', example: '10081014649' },
          terminalId: { type: 'string', example: '99179395' },
          secureKey: { type: 'string', example: '3a488a89b3f7993476c252f017c488bb' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Admin access required',
    }),
    ApiResponse({
      status: 404,
      description: 'System credentials not configured',
    }),
  );
};