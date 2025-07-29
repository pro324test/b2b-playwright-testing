import { applyDecorators } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam
} from '@nestjs/swagger';

/**
 * Swagger decorator for "Enable price rule" endpoint
 */
export const EnablePriceRuleSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin/Vendor] Enable price rule',
      description: 'Enable a disabled price rule to make it active again. Vendors can only enable rules they created.'
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: Number,
      description: 'ID of the price rule to enable'
    }),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 200, 
      description: 'Price rule enabled successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Bulk Discount' },
          status: { type: 'string', example: 'enabled' },
          creatorType: { type: 'string', example: 'user' },
          creatorId: { type: 'number', example: 15 }
        }
      }
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - No permission to enable this rule',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'You do not have permission to enable this price rule' },
          error: { type: 'string', example: 'Forbidden' }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Price rule not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized - JWT token is invalid or expired' })
  );
};

/**
 * Swagger decorator for "Disable price rule" endpoint
 */
export const DisablePriceRuleSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin/Vendor] Disable price rule',
      description: 'Temporarily disable a price rule without deleting it. Vendors can only disable rules they created.'
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: Number,
      description: 'ID of the price rule to disable'
    }),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 200, 
      description: 'Price rule disabled successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Bulk Discount' },
          status: { type: 'string', example: 'disabled' },
          creatorType: { type: 'string', example: 'admin' },
          creatorId: { type: 'number', example: 1 }
        }
      }
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - No permission to disable this rule',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'You do not have permission to disable this price rule' },
          error: { type: 'string', example: 'Forbidden' }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Price rule not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized - JWT token is invalid or expired' })
  );
};

/**
 * Swagger decorator for "Delete price rule" endpoint
 */
export const DeletePriceRuleSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin/Vendor] Delete price rule',
      description: 'Permanently remove a price rule from the system. Vendors can only delete rules they created.'
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: Number,
      description: 'ID of the price rule to delete'
    }),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 200, 
      description: 'Price rule deleted successfully',
      schema: {
        properties: {
          message: { type: 'string', example: 'Price rule deleted successfully' }
        }
      }
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - No permission to delete this rule',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'You do not have permission to delete this price rule' },
          error: { type: 'string', example: 'Forbidden' }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Price rule not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized - JWT token is invalid or expired' })
  );
};