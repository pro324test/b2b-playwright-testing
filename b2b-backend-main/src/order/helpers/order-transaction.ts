import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductVariantService } from '../../product/product-variant.service';
import { InventoryService } from '../../inventory/inventory.service';
import { CouponService } from '../../coupon/coupon.service';
import { Prisma } from '@prisma/client';

/**
 * Execute the order creation transaction
 */
export async function executeOrderTransaction(
  prisma: PrismaService,
  userId: number,
  shopId: number,
  shopItems: any[],
  cart: any,
  subtotal: number,
  couponDiscount: number,
  totalAmount: number,
  productVariantService: ProductVariantService,
  inventoryService: InventoryService,
  couponService: CouponService,
  paymentMethod: string,
  transactionId?: string,
  notes?: string,
  address?: any // Address parameter
) {
  const couponCode = cart.appliedCouponCode;
  
  // Validate Moamalat transaction ID
  if (paymentMethod === 'moamalat' && !transactionId) {
    throw new BadRequestException('Transaction ID is required for Moamalat payments');
  }
  
  return prisma.$transaction(async (tx) => {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${userId}-${shopId}`;
    
    // Determine payment status based on payment method
    const initialPaymentStatus = paymentMethod === 'moamalat' ? 'paid' : 'unpaid';
    const initialPaidAmount = paymentMethod === 'moamalat' ? totalAmount : 0;
    
    // Order data with coupon information if applicable
    const orderData: any = {
      orderNumber,
      user: { connect: { id: userId } },
      shop: { connect: { id: shopId } },
      totalAmount,
      subtotal,
      paidAmount: initialPaidAmount,
      paymentStatus: initialPaymentStatus,
      paymentMethod,
      status: 'pending',
      notes,
      couponCode: couponCode || null,
      couponDiscount: couponDiscount > 0 ? couponDiscount : null,
      
      // Add address information properly - use the relation field instead
      ...(address && {
        userAddress: { connect: { id: address.id } },
        shippingStreet: address.street,
        shippingCity: address.city.name,
        shippingNotes: address.notes,
      }),
      
      items: {
        create: shopItems.map(item => {
          // Get applied rule IDs from the item - handle both array and legacy single value
          let appliedRuleIds: number[] = []; // Explicitly type as number array
          
          // Add from the appliedRuleIds array if it exists
          if (item.appliedRuleIds && Array.isArray(item.appliedRuleIds)) {
            appliedRuleIds = [...item.appliedRuleIds] as number[];
          }
          
          // For backward compatibility, add the single rule ID if it exists and isn't already in the array
          if (item.appliedRuleId && !appliedRuleIds.includes(item.appliedRuleId)) {
            appliedRuleIds.push(Number(item.appliedRuleId));
          }
          
          return {
            product: {
              connect: { id: item.productId }
            },
            variant: item.variantId ? {
              connect: { id: item.variantId }
            } : undefined,
            productName: item.product.name,
            quantity: item.quantity,
            basePrice: item.basePrice,
            finalPrice: item.finalPrice, // Preserves discounted price
            appliedRuleIds: appliedRuleIds, // Store all applied rule IDs
            promotionInfo: null,
            attributes: item.variant ? {
              variantId: item.variant.id,
              sku: item.variant.sku,
              attributes: item.variant.attributeValues.map(av => ({
                name: av.attribute.name,
                value: av.value
              }))
            } : undefined
          };
        }),
      },
    };

    // If coupon is applied, connect it to the coupon record
    if (couponCode) {
      try {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode }
        });
        
        if (coupon) {
          orderData.coupon = { connect: { id: coupon.id } };
        }
      } catch (error) {
        console.error('Error connecting coupon:', error);
      }
    }
    
    // Create the order
    const order = await tx.order.create({
      data: orderData,
      include: {
        items: true,
        shop: true,
      },
    });

    // Create payment record based on payment method
    if (paymentMethod === 'moamalat') {
      // Create completed payment for Moamalat with transaction ID
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          paymentMethod,
          transactionId,
          status: 'completed',
          completedAt: new Date(),
        },
      });
    } else if (paymentMethod === 'cod') {
      // Create pending payment for COD
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          paymentMethod,
          status: 'pending',
        },
      });
    }
    
    // Update inventory
    for (const item of shopItems) {
      if (item.variantId) {
        // Reduce variant stock
        await productVariantService.adjustStock(
          item.variantId,
          item.quantity,
          'remove'
        );
      } else {
        // Reduce product-level stock
        await inventoryService.adjustStock(
          item.productId,
          item.quantity,
          'remove'
        );
      }
    }
    
    // Record coupon usage if a coupon was applied
    if (couponCode) {
      try {
        await couponService.recordCouponUsage(
          couponCode,
          userId,
          order.id
        );
      } catch (error) {
        console.error('Error recording coupon usage:', error);
        // Continue with order creation even if recording coupon usage fails
      }
    }
    
    await handleCartAfterOrder(tx, cart.id, shopItems);
    
    return order;
  });
}

/**
 * Update cart after order creation
 */
export async function handleCartAfterOrder(
  tx: any,
  cartId: number,
  shopItems: any[]
) {
  // Mark these cart items as checked out by removing them
  await tx.cartItem.deleteMany({
    where: {
      id: {
        in: shopItems.map(item => item.id),
      },
    },
  });
  
  // Check if cart is empty now and mark as checked out if needed
  const remainingItems = await tx.cartItem.count({
    where: { cartId },
  });
  
  if (remainingItems === 0) {
    await tx.cart.update({
      where: { id: cartId },
      data: { 
        isCheckedOut: true,
        appliedCouponCode: null, // Clear coupon code
        couponDiscount: null      // Clear coupon discount
      },
    });
  } else {
    // If cart still has items, just remove the coupon
    // since it was applied to the items we've now checked out
    await tx.cart.update({
      where: { id: cartId },
      data: { 
        appliedCouponCode: null,
        couponDiscount: null
      },
    });
  }
}

/**
 * Calculate order totals
 */
export function calculateOrderTotals(shopItems: any[], couponDiscount: number = 0) {
  // Calculate subtotal using the item's finalPrice that includes any rule-based discounts
  const subtotal = shopItems.reduce(
    (sum, item) => sum + Number(item.finalPrice) * item.quantity,
    0,
  );
  
  // Calculate total with coupon discount 
  const totalAmount = subtotal - couponDiscount;
  
  // Log values to verify calculations
  console.log('Cart items for calculation:', JSON.stringify(shopItems.map(item => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    basePrice: item.basePrice,
    finalPrice: item.finalPrice,
    appliedRuleId: item.appliedRuleId,
    total: Number(item.finalPrice) * item.quantity
  }))));
  console.log(`Subtotal: ${subtotal}, Coupon discount: ${couponDiscount}, Total: ${totalAmount}`);
  
  return {
    subtotal,
    couponDiscount,
    totalAmount
  };
}

/**
 * Validate shop items before order creation
 */
export function validateShopItems(cart: any, shopId: number) {
  if (cart.items.length === 0) {
    throw new BadRequestException('Cart is empty');
  }

  // Filter items by shop
  const shopItems = cart.items.filter(item => item.product.shopId === shopId);
  
  if (shopItems.length === 0) {
    throw new BadRequestException(`No items from shop with ID ${shopId} in cart`);
  }
  
  return shopItems;
}

/**
 * Generate order number
 */
export function generateOrderNumber(userId: number, shopId: number): string {
  const timestamp = Date.now();
  return `ORD-${timestamp}-${userId}-${shopId}`;
}