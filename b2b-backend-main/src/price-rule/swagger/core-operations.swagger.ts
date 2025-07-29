import { applyDecorators } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody,
  ApiParam
} from '@nestjs/swagger';

// Update the swagger constants
const PRICE_RULE_TYPES = {
  DISCOUNT: 'discount',
  FIXED_PRICE: 'fixed_price'
};

/**
 * Swagger decorator for creating a price rule
 */
export const CreatePriceRuleSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin/SuperAdmin/Vendor] Create price rule',
      description: `Create a new pricing rule for products or variants.
      
Available rule types:
- discount: Percentage discount (15 means 15% off)
- fixed_price: Fixed absolute price ($89.99 per unit)

NOTE: 
- Admin users MUST specify a vendor using onBehalfOfVendorId
- Vendors can create rules for specific shops, products, variants, or globally for all their products
- If no shop, product or variant IDs are specified, the rule applies to all vendor's products
- If shopIds are specified, the rule applies to all products in those shops only`
    }),
    ApiBearerAuth(),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Summer Discount' },
          type: { type: 'string', enum: ['discount', 'fixed_price'] },
          value: { type: 'number', example: 15.00 },
          minQuantity: { type: 'number', example: 5 },
          maxQuantity: { type: 'number', example: 20 },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['enabled', 'disabled'] },
          vendorGroupId: { type: 'number' },
          productIds: { type: 'array', items: { type: 'number' } },
          variantIds: { type: 'array', items: { type: 'number' } },
          onBehalfOfVendorId: { type: 'number', description: 'Required for admin users - vendor ID to associate with this rule' },
          shopIds: { type: 'array', items: { type: 'number' }, description: 'Shop IDs to apply this rule to (shop-specific rules)' }
        },
        required: ['name', 'type', 'value', 'minQuantity']
      },
      examples: {
        'Percentage Discount': {
          summary: '15% Discount for orders between 5-20 quantity',
          value: {
            name: 'Summer Sale 15% Off',
            type: 'discount',
            value: 15.00,
            minQuantity: 5,
            maxQuantity: 20,
            onBehalfOfVendorId: 5,
            status: 'enabled'
          }
        },
        'Fixed Price Bulk Deal': {
          summary: 'Fixed price for bulk purchases (10+ units)',
          value: {
            name: 'Bulk Buy Special',
            type: 'fixed_price',
            value: 89.99,
            minQuantity: 10,
            maxQuantity: 50,
            onBehalfOfVendorId: 5,
            status: 'enabled'
          }
        },
        'Vendor Group Fixed Price': {
          summary: 'Special fixed price for Gold Vendors',
          value: {
            name: 'Gold Vendor Pricing',
            type: 'fixed_price',
            value: 49.99,
            minQuantity: 1,
            vendorGroupId: 3,
            onBehalfOfVendorId: 5,
            status: 'enabled'
          }
        },
        'Limited Time Offer': {
          summary: 'Discount with date range',
          value: {
            name: 'Holiday Special',
            type: 'discount',
            value: 20.00,
            minQuantity: 2,
            startDate: '2025-12-01T00:00:00.000Z',
            endDate: '2025-12-31T23:59:59.000Z',
            onBehalfOfVendorId: 5,
            status: 'enabled'
          }
        },
        'Product Specific Rule': {
          summary: 'Discount for specific products only',
          value: {
            name: 'Selected Products Discount',
            type: 'discount',
            value: 10.00,
            minQuantity: 1,
            productIds: [42, 56, 78],
            onBehalfOfVendorId: 5,
            status: 'enabled'
          }
        },
        'Variant Specific Rule': {
          summary: 'Discount for specific variants only',
          value: {
            name: 'Selected Variants Discount',
            type: 'discount',
            value: 10.00,
            minQuantity: 1,
            variantIds: [15, 22, 37],
            onBehalfOfVendorId: 5,
            status: 'enabled'
          }
        },
        'Tiered Bulk Pricing': {
          summary: 'Different price points based on quantity tiers',
          description: 'Create multiple rules with different min/max quantities for tiered pricing',
          value: {
            name: 'Tier 1: Buy 5-9 Units',
            type: 'fixed_price',
            value: 45.99,
            minQuantity: 5,
            maxQuantity: 9,
            onBehalfOfVendorId: 5,
            status: 'enabled'
          }
        },
        'Limited Time Product-Specific Discount': {
          summary: 'Time-limited discount for specific products',
          value: {
            name: 'Flash Sale - Select Products',
            type: 'discount',
            value: 25.00,
            minQuantity: 1,
            startDate: '2025-06-15T00:00:00.000Z',
            endDate: '2025-06-17T23:59:59.000Z',
            productIds: [101, 102, 103],
            onBehalfOfVendorId: 5,
            status: 'enabled'
          }
        },
        'High-Volume Discount': {
          summary: 'Deep discount for very large orders',
          value: {
            name: 'Wholesale Pricing',
            type: 'discount',
            value: 40.00,
            minQuantity: 100,
            onBehalfOfVendorId: 5,
            status: 'enabled'
          }
        },
        'Combined Product and Variant Rule': {
          summary: 'Rule applying to specific products and variants',
          description: 'This creates a rule applying to both complete products and specific variants of other products',
          value: {
            name: 'Mixed Selection Discount',
            type: 'discount',
            value: 15.00,
            minQuantity: 1,
            productIds: [42, 43],
            variantIds: [101, 102, 103],
            onBehalfOfVendorId: 5,
            status: 'enabled'
          }
        },
        'Seasonal Vendor Group Discount': {
          summary: 'Time-limited special prices for vendor group',
          value: {
            name: 'Summer Partner Pricing',
            type: 'fixed_price',
            value: 39.99,
            minQuantity: 1,
            vendorGroupId: 2,
            startDate: '2025-06-01T00:00:00.000Z',
            endDate: '2025-09-01T23:59:59.000Z',
            onBehalfOfVendorId: 5,
            status: 'enabled'
          }
        },
        'Weekend Flash Sale': {
          summary: 'Short duration dramatic discount',
          description: 'Creating a dramatic discount for specific products over a weekend',
          value: {
            name: 'Weekend Flash Sale',
            type: 'discount',
            value: 70.00,
            minQuantity: 1,
            startDate: '2025-07-26T00:00:00.000Z',
            endDate: '2025-07-28T23:59:59.000Z',
            productIds: [201, 202, 203, 204],
            onBehalfOfVendorId: 5,
            status: 'enabled'
          }
        },
        'Vendor Group Bulk Deal': {
          summary: 'Special bulk pricing for specific vendor group',
          value: {
            name: 'Silver Partners Bulk Deal',
            type: 'fixed_price',
            value: 29.99,
            minQuantity: 20,
            maxQuantity: 50,
            vendorGroupId: 4,
            onBehalfOfVendorId: 5,
            status: 'enabled'
          }
        },
        'Tiered Percentage Discounts': {
          summary: 'Different discount percentages based on quantity tiers',
          description: 'Create multiple discount rules with different min/max quantities for tiered discounts',
          value: {
            name: 'Tier 1: 10% off for 3-9 units',
            type: 'discount',
            value: 10.00,
            minQuantity: 3,
            maxQuantity: 9,
            onBehalfOfVendorId: 5,
            status: 'enabled'
          }
        },
        'Vendor Group Percentage Discount': {
          summary: 'Special percentage discount for specific vendor group',
          description: 'Apply a percentage discount only for members of a specific vendor group',
          value: {
            name: 'Gold Vendor 15% Discount',
            type: 'discount',
            value: 15.00,
            minQuantity: 1,
            vendorGroupId: 3,
            onBehalfOfVendorId: 5,
            status: 'enabled'
          }
        },
        'Shop Specific Rule': {
          summary: 'Discount for a specific shop only',
          value: {
            name: 'Shop Summer Sale',
            type: 'discount',
            value: 15.00,
            minQuantity: 1,
            shopIds: [42],
            onBehalfOfVendorId: 5,
            status: 'enabled'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 201, 
      description: 'Price rule created successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Summer Discount' },
          type: { type: 'string', enum: ['discount', 'fixed_price'], example: 'discount' },
          value: { type: 'number', example: 15.00 },
          minQuantity: { type: 'number', example: 5 },
          maxQuantity: { type: 'number', example: 20, nullable: true },
          startDate: { type: 'string', format: 'date-time', example: '2025-04-01T00:00:00.000Z' },
          endDate: { type: 'string', format: 'date-time', example: '2025-04-30T23:59:59.000Z' },
          status: { type: 'string', example: 'enabled' },
          vendorGroupId: { type: 'number', example: 3, nullable: true },
          creatorType: { type: 'string', example: 'admin' },
          creatorId: { type: 'number', example: 1 },
          vendor: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 5 },
              user: {
                type: 'object',
                properties: {
                  username: { type: 'string', example: 'vendor_user' }
                }
              }
            }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Bad request - Validation failed', 
      schema: {
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Admin users must specify a vendor using onBehalfOfVendorId' },
          error: { type: 'string', example: 'Bad Request' }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' }),
    ApiResponse({ status: 401, description: 'Unauthorized - JWT token is invalid or expired' })
  );
};

/**
 * Swagger decorator for getting a single price rule by ID
 */
export const GetPriceRuleSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get price rule by id',
      description: 'Retrieve detailed information about a specific price rule'
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Price rule ID',
      required: true
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Price rule found',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Special Discount' },
          type: { type: 'string', enum: ['discount', 'fixed_price'], example: 'discount' },
          value: { type: 'number', example: 15.00 },
          minQuantity: { type: 'number', example: 3 },
          maxQuantity: { type: 'number', example: null, nullable: true },
          startDate: { type: 'string', format: 'date-time', nullable: true },
          endDate: { type: 'string', format: 'date-time', nullable: true },
          status: { type: 'string', example: 'enabled' },
          vendorGroupId: { type: 'number', example: 2, nullable: true },
          creatorType: { type: 'string', example: 'admin' },
          creatorId: { type: 'number', example: 1 },
          vendor: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 5 },
              user: {
                type: 'object',
                properties: {
                  username: { type: 'string', example: 'vendor_user' }
                }
              }
            }
          },
          products: { 
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 42 }
              }
            }
          },
          variants: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 15 }
              }
            }
          },
          shops: { 
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 42 },
                name: { type: 'string', example: 'My Shop' }
              }
            }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Price rule not found' })
  );
};

/**
 * Swagger decorator for updating a price rule
 */
export const UpdatePriceRuleSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin/Vendor] Update price rule',
      description: 'Update an existing price rule. All fields are optional.'
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Price rule ID to update',
      required: true
    }),
    ApiBearerAuth(),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['discount', 'fixed_price'] },
          value: { type: 'number' },
          minQuantity: { type: 'number' },
          maxQuantity: { type: 'number' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['enabled', 'disabled'] },
          vendorGroupId: { type: 'number' },
          productIds: { type: 'array', items: { type: 'number' } },
          variantIds: { type: 'array', items: { type: 'number' } },
          onBehalfOfVendorId: { type: 'number', description: 'Required for admin users - vendor ID to associate with this rule' },
          shopIds: { type: 'array', items: { type: 'number' }, description: 'Shop IDs to apply this rule to (shop-specific rules)' }
        }
      },
      examples: {
        'Update Discount Value': {
          summary: 'Change discount percentage',
          value: {
            value: 20.00
          }
        },
        'Update Quantity Range': {
          summary: 'Update min/max quantities',
          value: {
            minQuantity: 3,
            maxQuantity: 30
          }
        },
        'Update Date Range': {
          summary: 'Change promotion dates',
          value: {
            startDate: '2025-06-01T00:00:00.000Z',
            endDate: '2025-07-31T23:59:59.000Z'
          }
        },
        'Add Products': {
          summary: 'Add specific products to rule',
          value: {
            productIds: [42, 56, 78]
          }
        },
        'Change Rule Type': {
          summary: 'Change from discount to fixed price',
          value: {
            type: 'fixed_price',
            value: 89.99
          }
        },
        'Complete Update': {
          summary: 'Update multiple fields',
          value: {
            name: 'Updated Summer Special',
            value: 25.00,
            minQuantity: 2,
            startDate: '2025-06-01T00:00:00.000Z',
            endDate: '2025-08-31T23:59:59.000Z',
            productIds: [42, 56, 78],
            onBehalfOfVendorId: 5
          }
        },
        'Change Vendor Assignment': {
          summary: 'Admin reassigns rule to a different vendor',
          value: {
            onBehalfOfVendorId: 8
          }
        },
        'Update Shop Assignment': {
          summary: 'Assign rule to different shops',
          value: {
            shopIds: [43, 45]
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Price rule updated successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Updated Discount Rule' },
          type: { type: 'string', enum: ['discount', 'fixed_price'], example: 'discount' },
          value: { type: 'number', example: 20.00 },
          minQuantity: { type: 'number', example: 5 },
          maxQuantity: { type: 'number', example: 20, nullable: true },
          startDate: { type: 'string', format: 'date-time', nullable: true },
          endDate: { type: 'string', format: 'date-time', nullable: true },
          status: { type: 'string', example: 'enabled' },
          vendorGroupId: { type: 'number', example: 2, nullable: true },
          creatorType: { type: 'string', example: 'admin' },
          creatorId: { type: 'number', example: 1 },
          vendor: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 5 },
              user: {
                type: 'object',
                properties: {
                  username: { type: 'string', example: 'vendor_user' }
                }
              }
            }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Price rule not found' }),
    ApiResponse({ status: 400, description: 'Bad request - Validation failed' }),
    ApiResponse({ status: 403, description: 'Forbidden - No permission' }),
    ApiResponse({ status: 401, description: 'Unauthorized - JWT token is invalid or expired' })
  );
};