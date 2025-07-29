// src/coupon/coupon.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam,
  ApiBody,
  ApiQuery
} from '@nestjs/swagger';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { SortDirection } from '../common/dto/pagination.dto';

export const CreateCouponSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor/Admin] Create coupon',
      description: `Create a new discount coupon for a shop.

## Coupon Types Explained  
- **percentage**: Percentage discount off order total (e.g., 25% off)  
  **خصم بنسبة مئوية من إجمالي الطلب (مثال: خصم 25%)**
- **fixed**: Fixed amount discount (e.g., $10 off)  
  **خصم بمبلغ ثابت (مثال: خصم 10 دولارات)**
- **free_shipping**: Free shipping coupon  
  **قسيمة شحن مجاني**

## Key Fields Explained  
- **value**: Amount of discount (percentage or fixed amount)  
  **قيمة الخصم (نسبة مئوية أو مبلغ ثابت)**
- **minOrderAmount**: Minimum order subtotal required to use coupon  
  **الحد الأدنى لقيمة الطلب لاستخدام القسيمة**
- **maxDiscountAmount**: Maximum discount amount when using percentage coupons  
  **الحد الأقصى لقيمة الخصم عند استخدام قسائم النسبة المئوية**
- **usageLimit**: Total times this coupon can be used across all customers  
  **عدد مرات استخدام القسيمة لجميع العملاء**
- **perUserLimit**: How many times a single user can use this coupon  
  **عدد مرات استخدام القسيمة لكل مستخدم**
- **shopIds**: Multiple shops this coupon applies to (for multi-shop coupons)  
  **معرّفات المتاجر التي تنطبق عليها القسيمة (للقسائم متعددة المتاجر)**
- **onBehalfOfVendorId**: For admin users to create coupons on behalf of a vendor  
  **للمسؤولين لإنشاء قسيمة نيابة عن بائع**
- **applicableProductIds**: Array of product IDs this coupon applies to  
  **معرّفات المنتجات التي تنطبق عليها القسيمة**
- **applicableCategoryIds**: Array of category IDs this coupon applies to  
  **معرّفات الفئات التي تنطبق عليها القسيمة**
`
    }),
    ApiBearerAuth(),
    ApiBody({ 
      type: CreateCouponDto,
      examples: {
        percentageCoupon: {
          summary: 'Percentage Discount Coupon',
          description: 'Creates a coupon that gives a percentage discount on eligible items',
          value: {
            code: 'SUMMER25',
            type: 'percentage',
            value: 25,
            minOrderAmount: 100,
            maxDiscountAmount: 50,
            startDate: '2025-06-01',
            endDate: '2025-08-31',
            description: 'Summer sale - 25% off orders over $100',
            shopIds: [1],
            usageLimit: 1000,
            perUserLimit: 1,
            applicableProductIds: [101, 102, 103],
            applicableCategoryIds: [5, 6]
          }
        },
        multiShopCoupon: {
          summary: 'Multi-Shop Coupon',
          description: 'Creates a coupon that works across multiple shops owned by the vendor',
          value: {
            code: 'VENDORSALE',
            type: 'percentage',
            value: 15,
            minOrderAmount: 50,
            startDate: '2025-06-01',
            endDate: '2025-08-31',
            description: 'Vendor-wide sale - 15% off all our shops',
            shopIds: [1, 2, 3],  // Applied to multiple shops
            usageLimit: 500,
            perUserLimit: 1
          }
        },
        adminOnBehalfOfVendor: {
          summary: 'Admin Creating Coupon for Vendor',
          description: 'Admin user creates a coupon on behalf of a specific vendor',
          value: {
            code: 'ADMINPROMO',
            type: 'percentage',
            value: 20,
            minOrderAmount: 75,
            maxDiscountAmount: 100,
            startDate: '2025-06-01',
            endDate: '2025-07-31',
            description: 'Special promotion created by admin',
            shopIds: [5, 6],
            usageLimit: 200,
            perUserLimit: 1,
            onBehalfOfVendorId: 3,  // Admin specifies which vendor to create for
            applicableProductIds: [201, 202]
          }
        },
        fixedAmountCoupon: {
          summary: 'Fixed Amount Discount Coupon',
          description: 'Creates a coupon that gives a fixed dollar amount discount',
          value: {
            code: 'SAVE10',
            type: 'fixed',
            value: 10,
            minOrderAmount: 50,
            startDate: '2025-06-01',
            endDate: '2025-08-31',
            description: '$10 off orders over $50',
            shopIds: [1],
            usageLimit: 500,
            perUserLimit: 2
          }
        },
        freeShippingCoupon: {
          summary: 'Free Shipping Coupon',
          description: 'Creates a coupon that offers free shipping on eligible orders',
          value: {
            code: 'FREESHIP',
            type: 'free_shipping',
            minOrderAmount: 75,
            startDate: '2025-06-01',
            endDate: '2025-08-31',
            description: 'Free shipping on orders over $75',
            shopIds: [1],
            usageLimit: 300,
            perUserLimit: 1
          }
        },
        productSpecificCoupon: {
          summary: 'Product-Specific Coupon',
          description: 'Creates a coupon that applies only to specific products',
          value: {
            code: 'TECH30',
            type: 'percentage',
            value: 30,
            minOrderAmount: 0,
            description: '30% off selected electronics',
            shopIds: [1],
            applicableProductIds: [201, 202, 203],
            perUserLimit: 1
          }
        }
      }
    }),
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
          shops: [                              // List of shops this coupon applies to
            { id: 1, name: 'Tech Shop' }
          ],
          applicableProducts: [
            { id: 1, name: 'Smartphone X' }
          ],
          applicableCategories: [
            { id: 1, name: 'Electronics' }
          ],
          createdAt: '2025-03-12T10:30:00Z',
          updatedAt: '2025-03-12T10:30:00Z',
          creatorType: 'admin',
          creatorId: 1,
          vendor: {
            id: 3,
            user: {
              username: 'vendor_user'
            }
          }
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Bad request - validation error or shop ownership issue' }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' }),
    ApiResponse({ status: 404, description: 'Not found - Vendor or shop not found' }),
    ApiResponse({ status: 409, description: 'Conflict - Coupon code already exists' })
  );
};

export const GetAllCouponsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin] Get all coupons',
      description: `Get all coupons across all shops with pagination.
      
## Response Fields Explained
- **code**: Unique coupon code customers use at checkout
- **type**: Type of discount (percentage, fixed, free_shipping)
- **value**: Amount of discount (percentage or fixed amount)
- **usageCount**: Number of times the coupon has been used
- **status**: Whether the coupon is currently active (enabled/disabled)
- **shops**: Array of shops this coupon applies to (for multi-shop coupons)`
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
      description: 'Field to sort by (id, code, type, value, startDate, endDate, status, etc.)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of coupons',
      schema: {
        example: {
          data: [
            {
              id: 1,
              code: "SUMMER25",
              type: "percentage",
              value: 25,
              status: "enabled",
              usageCount: 12,
              usageLimit: 100,
              startDate: "2025-06-01T00:00:00Z",
              endDate: "2025-08-31T23:59:59Z",
              shops: [
                { id: 1, name: "Tech Shop" }
              ]
            },
            {
              id: 2,
              code: "FREESHIP",
              type: "free_shipping",
              status: "enabled",
              usageCount: 5,
              usageLimit: 50,
              shops: [
                { id: 2, name: "Fashion Shop" }
              ]
            }
          ],
          meta: {
            totalItems: 15,
            itemsPerPage: 10,
            totalPages: 2,
            currentPage: 1,
            hasNextPage: true,
            hasPreviousPage: false,
            sortBy: "createdAt",
            sortDirection: "desc"
          }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  );
};

export const GetShopCouponsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get shop coupons',
      description: `Get all coupons for a specific shop. This endpoint includes:
      
1. Coupons created specifically for this shop
2. Multi-shop coupons that include this shop
3. Vendor-wide coupons that apply to all shops of this vendor

## Common Use Cases
- Displaying available coupon codes to customers
- Showing promotional banners with active discounts
- Creating a coupon showcase on shop landing page`
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'shopId',
      type: 'number',
      description: 'Shop ID',
      required: true
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
    ApiResponse({ 
      status: 200, 
      description: 'List of shop coupons',
      schema: {
        example: {
          data: [
            {
              id: 1,
              code: "SUMMER25",
              type: "percentage",
              value: 25,
              minOrderAmount: 100,
              maxDiscountAmount: 50,
              startDate: "2025-06-01T00:00:00Z",
              endDate: "2025-08-31T23:59:59Z",
              description: "Summer discount promotion",
              status: "enabled",
              isShopSpecific: true,
              shops: [
                { id: 1, name: "Tech Shop" }
              ],
              applicableProducts: [
                { id: 1, name: "Smartphone X" }
              ],
              applicableCategories: [
                { id: 1, name: "Electronics" }
              ]
            },
            {
              id: 2,
              code: "VENDORSALE",
              type: "percentage",
              value: 15,
              minOrderAmount: 50,
              startDate: "2025-06-01T00:00:00Z",
              endDate: "2025-08-31T23:59:59Z",
              description: "Vendor-wide sale - 15% off all our shops",
              status: "enabled",
              isShopSpecific: false,
              shops: [
                { id: 1, name: "Tech Shop" },
                { id: 2, name: "Fashion Shop" },
                { id: 3, name: "Home Goods" }
              ]
            }
          ],
          meta: {
            totalItems: 5,
            itemsPerPage: 10,
            totalPages: 1,
            currentPage: 1,
            hasNextPage: false,
            hasPreviousPage: false
          }
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Bad request - Shop not found or access denied' }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  );
};

export const GetCouponByIdSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get coupon details',
      description: `Get detailed information about a specific coupon, including all shops it applies to.
      
## Field Explanations
- **shops**: Array of shops this coupon applies to (for multi-shop coupons)
- **usageCount**: Number of times this coupon has been used
- **usageLimit**: Maximum number of times this coupon can be used
- **perUserLimit**: Maximum times a single customer can use this coupon
- **applicableProducts**: List of products this coupon can be used with
- **applicableCategories**: List of categories this coupon can be used with`
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Coupon ID',
      required: true
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Coupon details',
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
          usageCount: 12,
          perUserLimit: 1,
          status: 'enabled',
          description: 'Summer discount promotion',
          shops: [
            { id: 1, name: 'Tech Shop' },
            { id: 2, name: 'Electronics Shop' }
          ],
          applicableProducts: [
            { id: 1, name: 'Smartphone X' }
          ],
          applicableCategories: [
            { id: 1, name: 'Electronics' }
          ],
          createdAt: '2025-03-12T10:30:00Z',
          updatedAt: '2025-03-12T10:30:00Z',
          creator: {
            id: 5,
            type: 'admin',
            username: 'admin_user'
          }
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Bad request - Access denied for vendor' }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' }),
    ApiResponse({ status: 404, description: 'Not found - Coupon does not exist' })
  );
};

export const UpdateCouponSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor/Admin] Update coupon',
      description: `Update coupon details. Vendors can only update their own shop's coupons.
      
## Updateable Fields
- **code**: Change coupon code (will be validated for uniqueness)
- **value**: Change discount amount/percentage
- **dates**: Adjust validity period
- **usage limits**: Change how many times coupon can be used
- **applicable products/categories**: Update which products the coupon applies to

## Multi-Shop Support
- You can add or remove shops from a coupon's applicability using the shopIds field
- All provided shops must belong to the same vendor
- Changing from single-shop to multi-shop (or vice versa) is supported`
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Coupon ID',
      required: true
    }),
    ApiBody({
      type: UpdateCouponDto,
      description: 'Fields to update',
      examples: {
        updateValue: {
          summary: 'Update discount value',
          description: 'Change the discount percentage and maximum discount amount',
          value: {
            value: 30,
            maxDiscountAmount: 60
          }
        },
        updateDates: {
          summary: 'Update validity period',
          description: 'Extend or change the coupon validity period',
          value: {
            startDate: '2025-07-01T00:00:00Z',
            endDate: '2025-09-30T23:59:59Z'
          }
        },
        updateCode: {
          summary: 'Update coupon code',
          description: 'Change the coupon code customers enter at checkout',
          value: {
            code: 'FALL30'
          }
        },
        updateShops: {
          summary: 'Update applicable shops',
          description: 'Change which shops this coupon applies to',
          value: {
            shopIds: [1, 2, 3]
          }
        },
        updateProducts: {
          summary: 'Update applicable products',
          description: 'Change which products this coupon can be applied to',
          value: {
            applicableProductIds: [101, 102, 103],
            applicableCategoryIds: []
          }
        },
        updateUsageLimits: {
          summary: 'Update usage limits',
          description: 'Change how many times the coupon can be used',
          value: {
            usageLimit: 500,
            perUserLimit: 2
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Coupon updated successfully',
      schema: {
        example: {
          id: 1,
          code: 'FALL30',
          type: 'percentage',
          value: 30,
          minOrderAmount: 100,
          maxDiscountAmount: 60,
          startDate: '2025-07-01T00:00:00Z',
          endDate: '2025-09-30T23:59:59Z',
          usageLimit: 100,
          usageCount: 12,
          perUserLimit: 1,
          status: 'enabled',
          description: 'Summer discount promotion',
          shops: [
            { id: 1, name: 'Tech Shop' },
            { id: 2, name: 'Electronics Shop' },
            { id: 3, name: 'Home Goods' }
          ],
          updatedAt: '2025-05-15T14:30:00Z'
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Bad request - validation error or access denied' }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' }),
    ApiResponse({ status: 404, description: 'Not found - Coupon does not exist' }),
    ApiResponse({ status: 409, description: 'Conflict - Coupon code already exists' })
  );
};

export const EnableCouponSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor/Admin] Enable coupon',
      description: `Enable a disabled coupon. Vendors can only enable coupons that belong to their shops.
      
When a coupon is enabled:
- It becomes available for use at checkout
- It appears in shop coupons listings
- Validation rules (dates, limits) still apply`
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Coupon ID',
      required: true
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Coupon enabled successfully',
      schema: {
        example: {
          id: 1,
          code: 'SUMMER25',
          status: 'enabled',
          updatedAt: '2025-05-15T14:30:00Z'
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Bad request - access denied' }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' }),
    ApiResponse({ status: 404, description: 'Not found - Coupon does not exist' })
  );
};

export const DisableCouponSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor/Admin] Disable coupon',
      description: `Disable an active coupon. Vendors can only disable coupons that belong to their shops.
      
When a coupon is disabled:
- It cannot be used at checkout
- It won't appear in public coupon listings
- Usage statistics are preserved
- It can be re-enabled later`
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Coupon ID',
      required: true
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Coupon disabled successfully',
      schema: {
        example: {
          id: 1,
          code: 'SUMMER25',
          status: 'disabled',
          updatedAt: '2025-05-15T14:30:00Z'
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Bad request - access denied' }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' }),
    ApiResponse({ status: 404, description: 'Not found - Coupon does not exist' })
  );
};

export const DeleteCouponSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor/Admin] Delete coupon',
      description: `Permanently delete a coupon. Vendors can only delete coupons that belong to their shops.
      
Warning: This action is irreversible. Consider disabling coupons instead of deleting them to preserve order history.`
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Coupon ID',
      required: true
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Coupon deleted successfully',
      schema: {
        example: {
          message: "Coupon deleted successfully"
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Bad request - access denied' }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' }),
    ApiResponse({ status: 404, description: 'Not found - Coupon does not exist' })
  );
};

export const ApplyCouponSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Apply coupon to cart',
      description: `Apply a coupon code to the current cart. The system will validate:
      
- If the coupon code is valid and active
- If the coupon is within its validity period
- If the minimum order amount is met
- If the coupon can be applied to the items in the cart
- If the coupon applies to the shop(s) of the items in the cart
- If the user has already used this coupon (per-user limits)
- If the coupon has reached its usage limit

## Product and Category Applicability Rules

### How Product and Category Restrictions Work
When a coupon has both product and category restrictions, the system implements an **OR logic**:

- **applicableProductIds**: Specific products that qualify for the coupon discount
- **applicableCategoryIds**: All products in these categories qualify
- **When both are specified**: Items qualify if they EITHER match a product ID OR belong to a specified category

### Detailed Examples

#### Example 1: Product-Only Restriction
- Coupon with: \`applicableProductIds: [101, 102, 103]\`, \`applicableCategoryIds: []\`
- Result: Only products with IDs 101, 102, and 103 qualify for the discount
- Other products in the cart won't contribute to minimum order amount or receive discounts

#### Example 2: Category-Only Restriction
- Coupon with: \`applicableProductIds: []\`, \`applicableCategoryIds: [5, 6]\`
- Result: All products belonging to categories 5 and 6 qualify
- Products from other categories won't contribute to minimum order amount

#### Example 3: Combined Product AND Category Restrictions
- Coupon with: \`applicableProductIds: [101, 102, 103]\`, \`applicableCategoryIds: [5, 6]\`
- Result: Products qualify if:
  * They have IDs 101, 102, or 103 **OR**
  * They belong to categories 5 or 6
- Example cart:
  * Product 101 (category 3): Qualifies (specific product)
  * Product 104 (category 5): Qualifies (category match)
  * Product 105 (category 7): Does NOT qualify (no match)

### Calculation Logic
1. System identifies all qualifying items in cart based on product IDs and categories
2. Only qualifying items contribute to the "minimum order amount" requirement
3. For percentage discounts, the discount applies only to qualifying items
4. For fixed amount discounts, the entire discount applies if qualifying items meet threshold

### Technical Implementation
- The system first checks both product IDs and categories for each cart item
- If either check passes, the item is marked as eligible
- Items failing both checks are excluded from coupon calculations
- The \`OR\` logic maximizes customer benefit by including more products`
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'cartId',
      type: 'number',
      description: 'Cart ID',
      required: true
    }),
    ApiBody({
      type: ApplyCouponDto,
      examples: {
        couponCode: {
          summary: 'Apply coupon',
          description: 'Apply a coupon code to the cart',
          value: {
            code: 'SUMMER25'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Coupon applied successfully',
      schema: {
        example: {
          id: 1,
          appliedCouponCode: 'SUMMER25',
          couponDiscount: 25.5,
          subtotal: 102,
          discount: 25.5,
          total: 76.5,
          items: [
            {
              id: 1,
              productId: 101,
              name: "Smartphone X",
              quantity: 1,
              price: 102,
              finalPrice: 76.5
            }
          ]
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Bad request - Invalid coupon or cart',
      schema: {
        example: {
          statusCode: 400,
          message: "This coupon requires a minimum order of $100",
          error: "Bad Request"
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' }),
    ApiResponse({ status: 404, description: 'Not found - Cart or coupon not found' })
  );
};

export const RemoveCouponSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Remove coupon from cart',
      description: `Remove an applied coupon from the cart. This will:
      
- Remove the coupon code from the cart
- Recalculate the cart total without the discount
- Not affect the coupon's usage limit until checkout`
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'cartId',
      type: 'number',
      description: 'Cart ID',
      required: true
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Coupon removed successfully',
      schema: {
        example: {
          id: 1,
          appliedCouponCode: null,
          couponDiscount: null,
          subtotal: 102,
          discount: 0,
          total: 102,
          items: [
            {
              id: 1,
              productId: 101,
              name: "Smartphone X",
              quantity: 1,
              price: 102,
              finalPrice: 102
            }
          ]
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Bad request - No coupon applied to cart' }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' }),
    ApiResponse({ status: 404, description: 'Not found - Cart not found' })
  );
};

export const GetVendorCouponsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin/Vendor] Get vendor coupons',
      description: `Get all coupons for a specific vendor across all their shops. 
      
This includes:
1. Single-shop coupons for any of the vendor's shops
2. Multi-shop coupons that span multiple shops owned by the vendor
3. Vendor-wide coupons

## Coupon Types and Use Cases

### Percentage Discount Coupons
- **How they work**: Apply a percentage discount to eligible items or entire cart
- **Best for**: Seasonal promotions, holiday sales, encouraging higher cart values
- **Example**: "SUMMER25" - 25% off orders over $100 (with $50 maximum discount cap)
- **Typical application**: Applied to entire cart or specific categories

### Fixed Amount Coupons
- **How they work**: Apply a specific dollar amount off the purchase
- **Best for**: Clear value proposition to customers, easier to manage financially
- **Example**: "SAVE10" - $10 off any order over $50
- **Typical application**: Applied to entire cart, good for orders near the minimum threshold

### Free Shipping Coupons
- **How they work**: Remove shipping costs from the order
- **Best for**: Removing purchase barriers, competing with free shipping offerings
- **Example**: "FREESHIP" - Free shipping on orders over $75
- **Special considerations**: Can be combined with regional shipping rules

## Strategic Multi-Shop Usage
- **Cross-selling opportunities**: Encourage customers to shop across multiple stores under the same vendor
- **Consistent branding**: Apply the same promotional strategy across all vendor shops
- **Consolidated reporting**: Track coupon usage across all vendor's properties in one place

## Best Practices
- Use distinct coupon codes for each campaign to track effectiveness
- Set appropriate usage limits based on margin and expected uptake
- Consider timing (seasonal, day of week, time of day) for coupon validity
- Apply minimum order thresholds to maintain profitable transactions

For vendors, this shows only their own coupons.
For admins, this shows any vendor's coupons.`
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'vendorId',
      type: 'number',
      description: 'Vendor ID',
      required: true
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
    ApiResponse({ 
      status: 200, 
      description: 'List of vendor coupons',
      schema: {
        example: {
          data: [
            {
              id: 1,
              code: "SUMMER25",
              type: "percentage",
              value: 25,
              status: "enabled",
              usageCount: 12,
              usageLimit: 100,
              shops: [
                { id: 1, name: "Tech Shop" }
              ]
            },
            {
              id: 2,
              code: "FREESHIP",
              type: "free_shipping",
              status: "enabled",
              usageCount: 5,
              usageLimit: 50,
              shops: [
                { id: 2, name: "Fashion Shop" }
              ]
            }
          ],
          meta: {
            totalItems: 5,
            itemsPerPage: 10,
            totalPages: 1,
            currentPage: 1,
            hasNextPage: false,
            hasPreviousPage: false,
            sortBy: "createdAt",
            sortDirection: "desc"
          }
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Bad request - Vendor not found or access denied' }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  );
};