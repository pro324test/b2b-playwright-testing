import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CouponService } from '../../coupon/coupon.service';

/**
 * Apply a coupon to a cart
 */
export async function applyCouponToCart(
  prisma: PrismaService,
  couponService: CouponService, 
  cartId: number, 
  userId: number, 
  code: string
) {
  // Verify cart exists and belongs to user
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: {
            include: {
              shop: true
            }
          }
        }
      }
    }
  });

  if (!cart) {
    throw new NotFoundException('Cart not found');
  }

  if (cart.userId !== userId) {
    throw new BadRequestException('You do not have permission to modify this cart');
  }

  if (cart.isCheckedOut) {
    throw new BadRequestException('Cannot apply coupon to checked out cart');
  }

  if (cart.items.length === 0) {
    throw new BadRequestException('Cannot apply coupon to empty cart');
  }

  // Calculate cart total (excluding existing coupon discounts)
  let cartTotal = 0;
  for (const item of cart.items) {
    cartTotal += Number(item.finalPrice) * item.quantity;
  }

  // Group items by shop
  const shopIds = [...new Set(cart.items.map(item => item.product.shopId))];
  
  // If multiple shops, verify the coupon is not shop-specific or matches one of the shops
  const shopId = shopIds.length === 1 ? shopIds[0] : undefined;

  // Validate the coupon
  const validationResult = await couponService.validateCoupon(code, userId, cartTotal, shopId);

  if (!validationResult.valid) {
    throw new BadRequestException(validationResult.message);
  }

  // Apply the coupon to the cart
  const updatedCart = await prisma.cart.update({
    where: { id: cartId },
    data: {
      appliedCouponCode: code,
      couponDiscount: validationResult.discountAmount
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
              shop: true
            }
          },
          variant: {
            include: {
              attributeValues: {
                include: {
                  attribute: true
                }
              }
            }
          }
        }
      }
    }
  });

  // Return the updated cart with coupon discount
  return {
    ...updatedCart,
    subtotal: cartTotal,
    discount: validationResult.discountAmount || 0,
    total: cartTotal - (validationResult.discountAmount || 0)
  };
}

/**
 * Remove a coupon from a cart
 */
export async function removeCouponFromCart(
  prisma: PrismaService,
  cartId: number, 
  userId: number
) {
  // Verify cart exists and belongs to user
  const cart = await prisma.cart.findUnique({
    where: { id: cartId }
  });

  if (!cart) {
    throw new NotFoundException('Cart not found');
  }

  if (cart.userId !== userId) {
    throw new BadRequestException('You do not have permission to modify this cart');
  }

  if (!cart.appliedCouponCode) {
    throw new BadRequestException('No coupon applied to this cart');
  }

  return prisma.cart.update({
    where: { id: cartId },
    data: {
      appliedCouponCode: null,
      couponDiscount: null
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
              shop: true
            }
          },
          variant: {
            include: {
              attributeValues: {
                include: {
                  attribute: true
                }
              }
            }
          }
        }
      }
    }
  });
}

/**
 * Record coupon usage for an order
 */
export async function recordCouponUsage(
  prisma: PrismaService,
  couponService: CouponService,
  couponCode: string,
  userId: number, 
  orderId: number
) {
  return couponService.recordCouponUsage(couponCode, userId, orderId);
}

/**
 * Calculate coupon discount for a cart during checkout
 */
export async function calculateCouponDiscount(
  prisma: PrismaService,
  couponService: CouponService, 
  cart: any
) {
  if (!cart.appliedCouponCode) {
    return {
      isValid: true,
      couponDiscount: 0
    };
  }
  
  // Calculate current subtotal
  let subtotal = 0;
  for (const item of cart.items) {
    subtotal += Number(item.finalPrice) * item.quantity;
  }
  
  // Get the shopId from the first item if cart has items
  const shopId = cart.items.length > 0 ? cart.items[0].product.shopId : null;
  
  // Validate coupon is still applicable
  const validationResult = await couponService.validateCoupon(
    cart.appliedCouponCode,
    cart.userId,
    subtotal,
    shopId
  );
  
  return {
    isValid: validationResult.valid,
    couponDiscount: validationResult.valid ? validationResult.discountAmount : 0,
    message: validationResult.valid ? 'Coupon applied successfully' : validationResult.message
  };
}