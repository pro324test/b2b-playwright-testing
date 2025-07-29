import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PriceRuleService } from '../../price-rule/price-rule.service';

/**
 * Get the current active cart for a user, or create a new one if none exists
 */
export async function getOrCreateCart(prisma: PrismaService, userId: number) {
  let cart = await prisma.cart.findFirst({
    where: {
      userId,
      isCheckedOut: false
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
              priceRules: true,
              shop: true
            }
          },
          variant: {
            include: {
              attributeValues: {
                include: {
                  attribute: true
                }
              },
              priceRules: true // Include variant price rules
            }
          }
        }
      }
    }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
        isCheckedOut: false
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                priceRules: true,
                shop: true
              }
            },
            variant: {
              include: {
                attributeValues: {
                  include: {
                    attribute: true
                  }
                },
                priceRules: true
              }
            }
          }
        }
      }
    });
  }

  return cart;
}

/**
 * Get the current active cart for a user
 */
export async function getCurrentCart(prisma: PrismaService, userId: number) {
  const cart = await prisma.cart.findFirst({
    where: {
      userId,
      isCheckedOut: false
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
              shop: true,
              priceRules: true
            }
          },
          variant: {
            include: {
              attributeValues: {
                include: {
                  attribute: true
                }
              },
              priceRules: true
            }
          }
        }
      }
    }
  });

  if (!cart) {
    throw new NotFoundException('No active cart found');
  }

  return cart;
}

/**
 * Clear all items from a user's cart
 */
export async function clearCart(prisma: PrismaService, userId: number) {
  const cart = await getCurrentCart(prisma, userId);
  
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id }
  });

  // Return the empty cart
  return await getCurrentCart(prisma, userId);
}

/**
 * Get the current cart ID or create a new cart if none exists
 */
export async function getCurrentCartId(prisma: PrismaService, userId: number): Promise<number> {
  const cart = await prisma.cart.findFirst({
    where: {
      userId,
      isCheckedOut: false
    },
    select: { id: true }
  });

  if (!cart) {
    const newCart = await prisma.cart.create({
      data: {
        userId,
        isCheckedOut: false
      },
      select: { id: true }
    });
    return newCart.id;
  }

  return cart.id;
}

/**
 * Check if a cart belongs to the specified user
 */
export async function verifyCartOwnership(prisma: PrismaService, cartId: number, userId: number) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId }
  });

  if (!cart) {
    throw new NotFoundException('Cart not found');
  }

  if (cart.userId !== userId) {
    throw new BadRequestException('You do not have permission to access this cart');
  }

  return cart;
}

/**
 * Mark a cart as checked out
 */
export async function markCartCheckedOut(prisma: PrismaService, cartId: number) {
  return prisma.cart.update({
    where: { id: cartId },
    data: { 
      isCheckedOut: true,
      appliedCouponCode: null,
      couponDiscount: null 
    }
  });
}