import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApplyCouponDto } from '../coupon/dto/apply-coupon.dto';

export const GetCartSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[User] Get current user cart',
      description: `Retrieves the current user's shopping cart with all items, pricing details, and applied promotions.
      
The response includes:
- Basic cart information (ID, user ID, checkout status)
- All cart items with their details (products, variants, quantities)
- Applied price rules and promotions for each item
- Coupon information if applied
- Price calculations (subtotal, discounts, final total)`
    }),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 200, 
      description: 'Cart retrieved successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          userId: { type: 'number', example: 5 },
          isCheckedOut: { type: 'boolean', example: false },
          appliedCouponCode: { type: 'string', example: 'SUMMER25', nullable: true },
          couponDiscount: { type: 'number', example: 25.50, nullable: true },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 42 },
                productId: { type: 'number', example: 7 },
                variantId: { type: 'number', example: 3, nullable: true },
                quantity: { type: 'number', example: 2 },
                basePrice: { type: 'number', example: 99.99 },
                finalPrice: { type: 'number', example: 89.99 },
                hasPromotion: { type: 'boolean', example: true },
                discounts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      promotionId: { type: 'number', example: 1 },
                      promotionName: { type: 'string', example: 'Buy 2 Get 1 Free' },
                      type: { type: 'string', example: 'bogo_same' },
                      discountedQuantity: { type: 'number', example: 1 },
                      discountPercent: { type: 'number', example: 100 },
                      discountAmount: { type: 'number', example: 89.99 }
                    }
                  }
                },
                product: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Premium Cotton T-Shirt' },
                    images: { 
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          path: { type: 'string', example: 'https://example.com/tshirt.jpg' }
                        }
                      }
                    },
                    shop: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', example: 'Fashion Store' }
                      }
                    }
                  }
                },
                variant: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: { type: 'number', example: 3 },
                    sku: { type: 'string', example: 'RED-XL-001' },
                    attributeValues: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          value: { type: 'string', example: 'Red' },
                          attribute: {
                            type: 'object',
                            properties: {
                              name: { type: 'string', example: 'Color' }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          subtotal: { type: 'number', example: 179.98 },
          discount: { type: 'number', example: 25.50 },
          total: { type: 'number', example: 154.48 }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Cart not found',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Cart not found for this user' },
          error: { type: 'string', example: 'Not Found' }
        }
      }
    })
  );
};

export const AddToCartSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[User] Add item to cart',
      description: `Add a product to the user's shopping cart.

You can add:
- A simple product (using productId only)
- A specific product variant (using productId + variantId)

The system will:
- Create a cart if the user doesn't have one
- Validate product availability and stock levels
- Apply any eligible price rules automatically
- Return the updated cart with all items and totals`
    }),
    ApiBearerAuth(),
    ApiBody({
      type: CreateCartItemDto,
      examples: {
        'Add Simple Product': {
          summary: 'Adding a simple product without variants',
          description: 'Add a basic product without selecting any specific variant',
          value: {
            productId: 12,
            quantity: 1
          }
        },
        'Add Product Variant': {
          summary: 'Adding a product with specific variant selection',
          description: 'Add a product with a specific color, size, or other variant attributes',
          value: {
            productId: 7,
            variantId: 3,
            quantity: 2
          }
        },
        'Add Multiple Units': {
          summary: 'Adding multiple units of a product',
          description: 'Add several units of the same product to qualify for bulk pricing',
          value: {
            productId: 15,
            variantId: 8,
            quantity: 5
          }
        }
      }
    }),
    ApiResponse({ 
      status: 201, 
      description: 'Item added to cart successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          userId: { type: 'number', example: 5 },
          isCheckedOut: { type: 'boolean', example: false },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 42 },
                productId: { type: 'number', example: 7 },
                variantId: { type: 'number', example: 3, nullable: true },
                quantity: { type: 'number', example: 2 },
                basePrice: { type: 'number', example: 99.99 },
                finalPrice: { type: 'number', example: 89.99 }
              }
            }
          },
          subtotal: { type: 'number', example: 179.98 },
          total: { type: 'number', example: 179.98 }
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Invalid request or insufficient stock',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Not enough inventory for product variant RED-XL-001' },
          error: { type: 'string', example: 'Bad Request' }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Product or variant not found',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Product variant with ID 999 not found' },
          error: { type: 'string', example: 'Not Found' }
        }
      }
    })
  );
};

export const UpdateCartItemSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[User] Update cart item quantity',
      description: `Update the quantity of an existing item in the cart.
      
This will:
- Adjust the item quantity up or down
- Validate available inventory for the new quantity
- Recalculate any price rules, promotions, and discounts
- Update cart totals accordingly

NOTE: To remove an item entirely, use the Remove Item endpoint or set quantity to 0`
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Cart item ID to update',
      required: true
    }),
    ApiBody({
      type: UpdateCartItemDto,
      examples: {
        'Increase Quantity': {
          summary: 'Increase item quantity',
          description: 'Add more units of this item to the cart',
          value: {
            quantity: 5
          }
        },
        'Decrease Quantity': {
          summary: 'Decrease item quantity',
          description: 'Reduce the number of units in the cart',
          value: {
            quantity: 1
          }
        },
        'Remove From Cart': {
          summary: 'Remove item by setting quantity to zero',
          description: 'Alternative way to remove an item from the cart',
          value: {
            quantity: 0
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Cart item updated successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 42 },
          productId: { type: 'number', example: 7 },
          variantId: { type: 'number', example: 3, nullable: true },
          quantity: { type: 'number', example: 3 },
          basePrice: { type: 'number', example: 99.99 },
          finalPrice: { type: 'number', example: 89.99 },
          cart: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              subtotal: { type: 'number', example: 269.97 },
              discount: { type: 'number', example: 25.50 },
              total: { type: 'number', example: 244.47 }
            }
          }
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Invalid request or insufficient stock',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Not enough inventory for requested quantity' },
          error: { type: 'string', example: 'Bad Request' }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Cart item not found',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Cart item with ID 999 not found' },
          error: { type: 'string', example: 'Not Found' }
        }
      }
    })
  );
};

export const RemoveFromCartSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[User] Remove item from cart',
      description: `Remove a specific item completely from the shopping cart.
      
This will:
- Delete the item from the cart
- Recalculate any promotions that may be affected
- Update cart totals accordingly

NOTE: This is different from setting quantity to 0 as it completely removes the record`
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Cart item ID to remove',
      required: true
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Item removed from cart successfully',
      schema: {
        properties: {
          message: { type: 'string', example: 'Item successfully removed from cart' },
          cart: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              subtotal: { type: 'number', example: 89.99 },
              discount: { type: 'number', example: 0 },
              total: { type: 'number', example: 89.99 },
              itemCount: { type: 'number', example: 1 }
            }
          }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Cart item not found',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Cart item with ID 999 not found' },
          error: { type: 'string', example: 'Not Found' }
        }
      }
    })
  );
};

export const ClearCartSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[User] Clear all items from cart',
      description: `Remove all items from the current shopping cart.
      
This will:
- Delete all items from the cart
- Remove any applied coupons
- Reset all cart totals
- Keep the cart entity itself (just empty)

Use this when a user wants to start fresh with their shopping.`
    }),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 200, 
      description: 'Cart cleared successfully',
      schema: {
        properties: {
          message: { type: 'string', example: 'Cart cleared successfully' },
          cart: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              userId: { type: 'number', example: 5 },
              isCheckedOut: { type: 'boolean', example: false },
              items: { type: 'array', items: {}, example: [] },
              subtotal: { type: 'number', example: 0 },
              discount: { type: 'number', example: 0 },
              total: { type: 'number', example: 0 },
              appliedCouponCode: { type: 'null' },
              couponDiscount: { type: 'null' }
            }
          }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Cart not found',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Cart not found for this user' },
          error: { type: 'string', example: 'Not Found' }
        }
      }
    })
  );
};

export const CheckoutCartSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[User] Create order with integrated payment',
      description: `Complete checkout process with integrated payment handling.
      
This endpoint handles the entire checkout flow in one step:
- Validates all items and their inventory levels 
- Applies any discounts and coupons
- Processes payment based on method
- Creates the order record with shipping information
- Updates inventory
- Marks the cart items as checked out`
    }),
    ApiBearerAuth(),
    ApiBody({
      schema: {
        type: 'object',
        required: ['shopId', 'paymentMethod', 'addressId'],
        properties: {
          shopId: { 
            type: 'number',
            description: 'The shop ID to checkout items from',
            example: 5
          },
          paymentMethod: { 
            type: 'string',
            description: 'Payment method to use',
            example: 'moamalat',
            enum: ['cod', 'moamalat']
          },
          addressId: {
            type: 'number', 
            description: 'The ID of the user address to use for shipping',
            example: 1
          },
          transactionId: {
            type: 'string',
            description: 'Transaction ID (required for Moamalat payments)',
            example: 'TXN123456789'
          },
          notes: { 
            type: 'string',
            description: 'Optional customer notes for the order',
            example: 'Please deliver to the back entrance'
          }
        }
      },
      examples: {
        'Moamalat Payment': {
          summary: 'Checkout with Moamalat payment',
          value: {
            shopId: 5,
            paymentMethod: 'moamalat',
            addressId: 1,
            transactionId: 'TXN123456789',
            notes: 'Please deliver to the back entrance'
          }
        },
        'Cash on Delivery': {
          summary: 'Checkout with cash payment on delivery',
          value: {
            shopId: 5,
            paymentMethod: 'cod',
            addressId: 1,
            notes: 'Call before delivery'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Checkout completed successfully',
      schema: {
        properties: {
          orderId: { type: 'number', example: 42 },
          orderNumber: { type: 'string', example: 'ORD-1647859412345-5-1' },
          paymentStatus: { type: 'string', example: 'paid', enum: ['paid', 'unpaid'] },
          total: { type: 'number', example: 174.49 },
          paidAmount: { type: 'number', example: 174.49 },
          shopId: { type: 'number', example: 5 },
          orderNotes: { type: 'string', example: 'Please deliver to the back entrance', nullable: true },
          paymentMethod: { type: 'string', example: 'moamalat', enum: ['cod', 'moamalat'] },
          shippingAddress: { 
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              street: { type: 'string', example: '123 Main Street' },
              city: { type: 'string', example: 'Los Angeles' },
              notes: { type: 'string', example: 'Ring the doorbell twice', nullable: true }
            }
          }
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Invalid request parameters or business rules violated',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { 
            type: 'string', 
            example: 'Address not found or does not belong to you' 
          },
          error: { type: 'string', example: 'Bad Request' }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Cart or address not found',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Address not found or does not belong to you' },
          error: { type: 'string', example: 'Not Found' }
        }
      }
    })
  );
};

export const ApplyCouponToCartSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[User] Apply coupon to cart',
      description: `Apply a coupon code to the current cart for additional discounts.
      
The system will:
- Validate the coupon code exists and is active
- Check all coupon eligibility criteria (min purchase, expiration, usage limits)
- Apply the discount to eligible items or the entire cart
- Recalculate cart totals with the coupon discount applied

NOTE: Only one coupon can be applied to a cart at a time`
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Cart ID to apply coupon to',
      required: true
    }),
    ApiBody({
      type: ApplyCouponDto,
      description: 'Coupon code to apply to the cart',
      examples: {
        'Percentage Discount': {
          summary: 'Apply percentage discount coupon',
          description: '25% off entire cart',
          value: {
            couponCode: 'SUMMER25'
          }
        },
        'Fixed Amount Discount': {
          summary: 'Apply fixed amount discount coupon',
          description: '$10 off entire order',
          value: {
            couponCode: '10DOLLAROFF'
          }
        },
        'Free Shipping': {
          summary: 'Apply free shipping coupon',
          description: 'Removes shipping fees',
          value: {
            couponCode: 'FREESHIP'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Coupon applied successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          userId: { type: 'number', example: 5 },
          appliedCouponCode: { type: 'string', example: 'SUMMER25' },
          couponDiscount: { type: 'number', example: 25.50 },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                productId: { type: 'number' },
                quantity: { type: 'number' },
                basePrice: { type: 'number' },
                finalPrice: { type: 'number' }
              }
            }
          },
          subtotal: { type: 'number', example: 100 },
          discount: { type: 'number', example: 25.50 },
          total: { type: 'number', example: 74.50 },
          message: { type: 'string', example: 'Coupon SUMMER25 applied successfully for 25% off' }
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Invalid coupon or cart state',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { 
            type: 'string', 
            example: 'Coupon SUMMER25 is expired or not valid for this cart'
          },
          error: { type: 'string', example: 'Bad Request' }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Cart or coupon not found',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Coupon with code INVALID not found' },
          error: { type: 'string', example: 'Not Found' }
        }
      }
    })
  );
};

export const RemoveCouponFromCartSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[User] Remove coupon from cart',
      description: `Remove the currently applied coupon from the shopping cart.
      
This will:
- Remove any coupon discount from the cart
- Clear the coupon code reference
- Recalculate cart totals without the coupon discount

Use this endpoint when a user wants to try a different coupon or proceed without one.`
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Cart ID to remove coupon from',
      required: true
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Coupon removed successfully',
      schema: {
        properties: {
          message: { type: 'string', example: 'Coupon removed successfully' },
          cart: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              userId: { type: 'number', example: 5 },
              appliedCouponCode: { type: 'null' },
              couponDiscount: { type: 'null' },
              subtotal: { type: 'number', example: 179.98 },
              discount: { type: 'number', example: 0 },
              total: { type: 'number', example: 179.98 }
            }
          }
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'No coupon applied to cart',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'No coupon is currently applied to this cart' },
          error: { type: 'string', example: 'Bad Request' }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Cart not found',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Cart with ID 999 not found' },
          error: { type: 'string', example: 'Not Found' }
        }
      }
    })
  );
};