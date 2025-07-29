import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Check if user has access to a specific order (as customer or shop vendor)
 */
export async function checkOrderAccess(
  prisma: PrismaService,
  orderId: number,
  userId: number
): Promise<{ isCustomer: boolean; isVendor: boolean }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      userId: true,
      shopId: true
    }
  });

  if (!order) {
    throw new NotFoundException(`Order with ID ${orderId} not found`);
  }

  // Check if user is the customer
  const isCustomer = order.userId === userId;
  
  // Check if user is the vendor of the shop
  const shop = await prisma.shop.findFirst({
    where: {
      id: order.shopId,
      vendor: {
        userId,
      },
    },
    select: { id: true }
  });

  const isVendor = !!shop;

  if (!isCustomer && !isVendor) {
    throw new ForbiddenException('You do not have access to this order');
  }

  return { isCustomer, isVendor };
}

/**
 * Verify that user is the vendor for a shop
 */
export async function verifyVendorAccess(
  prisma: PrismaService,
  shopId: number,
  userId: number
): Promise<void> {
  const shop = await prisma.shop.findFirst({
    where: { 
      id: shopId,
      vendor: {
        userId,
      },
    },
  });

  if (!shop) {
    throw new ForbiddenException('You do not have access to this shop');
  }
}

/**
 * Verify vendor ownership of an order (for vendor-only operations)
 */
export async function verifyVendorOrderAccess(
  prisma: PrismaService,
  orderId: number,
  userId: number
): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      shop: {
        include: {
          vendor: true,
        },
      },
    },
  });

  if (!order) {
    throw new NotFoundException(`Order with ID ${orderId} not found`);
  }

  // Only the vendor of the shop can perform this action
  const isVendor = order.shop.vendor.userId === userId;
  
  if (!isVendor) {
    throw new ForbiddenException('Only the shop vendor can perform this action');
  }
}

/**
 * Check if a user can view order details (either customer or vendor)
 */
export async function canUserViewOrder(
  prisma: PrismaService,
  orderId: number, 
  userId: number
): Promise<boolean> {
  try {
    await checkOrderAccess(prisma, orderId, userId);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if a user is admin
 * Fixed to ensure return type is always boolean, never null
 */
export async function isUserAdmin(
  prisma: PrismaService,
  userId: number
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  
  // Explicitly handle the null case to ensure boolean return type
  if (!user) {
    return false;
  }
  
  return ['admin', 'superadmin'].includes(user.role);
}

/**
 * Check if user can access orders for a specific shop
 * (either vendor of the shop or admin)
 */
export async function canAccessShopOrders(
  prisma: PrismaService,
  shopId: number,
  userId: number
): Promise<boolean> {
  // Check if user is vendor of this shop
  const isVendor = await prisma.shop.findFirst({
    where: {
      id: shopId,
      vendor: {
        userId,
      },
    },
    select: { id: true }
  });
  
  if (isVendor) {
    return true;
  }
  
  // Check if user is admin
  return isUserAdmin(prisma, userId);
}