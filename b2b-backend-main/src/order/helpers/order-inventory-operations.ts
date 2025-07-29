import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryService } from '../../inventory/inventory.service';
import { ProductVariantService } from '../../product/product-variant.service';

/**
 * Check if all items in an order have sufficient inventory
 * @returns true if all items have sufficient stock, throws exception otherwise
 */
export async function validateInventoryForOrder(
  inventoryService: InventoryService,
  productVariantService: ProductVariantService,
  items: any[]
): Promise<boolean> {
  for (const item of items) {
    let hasStock = false;
    
    if (item.variantId) {
      // Check variant stock
      hasStock = await productVariantService.checkStock(
        item.variantId,
        item.quantity
      );
    } else {
      // Check product-level stock
      hasStock = await inventoryService.checkStock(
        item.productId,
        item.quantity
      );
    }

    if (!hasStock) {
      throw new BadRequestException(
        `Not enough inventory for product: ${item.product.name}`,
      );
    }
  }
  
  return true;
}

/**
 * Adjust inventory levels for all items in an order
 * @param operation 'add' increases inventory, 'remove' decreases inventory
 */
export async function adjustInventoryForOrderItems(
  inventoryService: InventoryService,
  productVariantService: ProductVariantService,
  items: any[],
  operation: 'add' | 'remove' = 'remove'
): Promise<void> {
  for (const item of items) {
    if (item.variantId) {
      // Adjust variant stock
      await productVariantService.adjustStock(
        item.variantId,
        item.quantity,
        operation
      );
    } else {
      // Adjust product-level stock
      await inventoryService.adjustStock(
        item.productId,
        item.quantity,
        operation
      );
    }
  }
}

/**
 * Reserve inventory for pending orders
 * Creates database records to track reservations
 */
export async function reserveInventory(
  prisma: PrismaService,
  inventoryService: InventoryService,
  productVariantService: ProductVariantService,
  items: any[],
  reservedFor: string,
  expirationMinutes: number = 15
): Promise<string> {
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + expirationMinutes);
  
  // First validate that we have enough inventory
  await validateInventoryForOrder(inventoryService, productVariantService, items);
  
  // Create reservations and reduce inventory in a transaction
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      // Create reservation record
      await tx.inventoryReservation.create({
        data: {
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
          reservedFor,
          expiresAt: expiration,
        }
      });
      
      // Reduce inventory
      if (item.variantId) {
        await productVariantService.adjustStock(
          item.variantId,
          item.quantity,
          'remove'
        );
      } else {
        await inventoryService.adjustStock(
          item.productId,
          item.quantity,
          'remove'
        );
      }
    }
  });
  
  return reservedFor;
}

/**
 * Release reserved inventory if checkout fails or reservation expires
 */
export async function releaseReservedInventory(
  prisma: PrismaService,
  inventoryService: InventoryService,
  productVariantService: ProductVariantService,
  reservedFor: string
): Promise<void> {
  // Find all active reservations for this identifier
  const reservations = await prisma.inventoryReservation.findMany({
    where: {
      reservedFor,
      isReleased: false
    }
  });
  
  if (!reservations.length) return;
  
  // Process each reservation in a transaction
  await prisma.$transaction(async (tx) => {
    for (const reservation of reservations) {
      // Return inventory
      if (reservation.variantId) {
        await productVariantService.adjustStock(
          reservation.variantId, 
          reservation.quantity, 
          'add'
        );
      } else {
        await inventoryService.adjustStock(
          reservation.productId, 
          reservation.quantity, 
          'add'
        );
      }
      
      // Mark as released
      await tx.inventoryReservation.update({
        where: { id: reservation.id },
        data: { isReleased: true }
      });
    }
  });
}

/**
 * Clean up expired reservations and return inventory
 * This should be called on a schedule (e.g., every 5 minutes)
 */
export async function cleanupExpiredReservations(
  prisma: PrismaService,
  inventoryService: InventoryService,
  productVariantService: ProductVariantService
): Promise<number> {
  const now = new Date();
  
  // Find expired and unreleased reservations
  const expiredReservations = await prisma.inventoryReservation.findMany({
    where: {
      expiresAt: { lt: now },
      isReleased: false
    }
  });
  
  if (!expiredReservations.length) return 0;
  
  // Process each reservation in a transaction
  await prisma.$transaction(async (tx) => {
    for (const reservation of expiredReservations) {
      // Return inventory
      if (reservation.variantId) {
        await productVariantService.adjustStock(
          reservation.variantId, 
          reservation.quantity, 
          'add'
        );
      } else {
        await inventoryService.adjustStock(
          reservation.productId, 
          reservation.quantity, 
          'add'
        );
      }
      
      // Mark as released
      await tx.inventoryReservation.update({
        where: { id: reservation.id },
        data: { isReleased: true }
      });
    }
  });
  
  return expiredReservations.length;
}

/**
 * Convert cart items to completed orders (mark reservations as consumed)
 * Call this when an order is successfully completed
 */
export async function consumeReservations(
  prisma: PrismaService,
  reservedFor: string
): Promise<void> {
  // Simply mark all reservations for this cart/session as released
  // The inventory has already been deducted
  await prisma.inventoryReservation.updateMany({
    where: {
      reservedFor,
      isReleased: false
    },
    data: {
      isReleased: true
    }
  });
}