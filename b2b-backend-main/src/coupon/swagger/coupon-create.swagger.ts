import { applyDecorators } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody
} from '@nestjs/swagger';
import { CreateCouponDto } from '../dto/create-coupon.dto';

/**
 * Swagger decorator for coupon creation endpoint
 */
export const CreateCouponSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor/Admin] Create coupon',
      description: `Create a new discount coupon with flexible targeting options.
      
Coupons can be targeted at different hierarchical levels:
- Global (across all products)
- Vendor-specific (across all vendor's shops)
- Shop-specific (for a particular shop)
- Category-specific (for products in specific categories)
- Product-specific (for specific products only)

Discount types include:
- Percentage discount (e.g., 25% off)
- Fixed amount discount (e.g., $10 off)
- Free shipping`
    }),
    ApiBearerAuth(),
    ApiBody({ type: CreateCouponDto }),
    ApiResponse({ 
      status: 201, 
      description: 'Coupon created successfully',
      schema: {
        example: {
          id: 1,
          code: 'SUMMER25',
          type: 'percentage',
          value: 25,
          minOrderAmount: 100,
          maxDiscountAmount: 50,
          startDate: '2025-06-01T00:00:00Z',
          endDate: '2025-08-31T23:59:59Z',
          usageLimit: 100,
          usageCount: 0,
          perUserLimit: 1,
          status: 'enabled',
          description: 'Summer discount promotion',
          shop: {
            id: 1,
            name: 'Tech Shop'
          },
          applicableProducts: [
            { id: 1, name: 'Smartphone X' }
          ],
          applicableCategories: [
            { id: 1, name: 'Electronics' }
          ],
          createdAt: '2025-03-12T10:30:00Z',
          updatedAt: '2025-03-12T10:30:00Z'
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Bad request - validation error or shop ownership issue' }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' }),
    ApiResponse({ status: 409, description: 'Conflict - Coupon code already exists' })
  );
};