/**
 * Process promotion information in order items
 * Parses stored promotion JSON into usable objects and adds helper flags
 */
export function processOrderPromotions(order: any) {
  if (!order?.items) return order;

  for (const item of order.items) {
    if (item.promotionInfo) {
      try {
        // Parse the stored promotion info back to object
        item.appliedPromotions = JSON.parse(item.promotionInfo);
        
        // Add a flag to indicate this item had promotions applied
        item.hasPromotion = true;
      } catch (e) {
        // If parsing fails, just continue without the promotion info
        console.error('Failed to parse promotion info:', e);
      }
    }
  }
  
  return order;
}

/**
 * Process coupon information in orders
 * Adds helper flags and formatted values for display purposes
 */
export function processOrderCoupons(order: any) {
  if (!order) return order;
  
  // Add a flag if the order had a coupon applied
  if (order.couponCode) {
    order.hasCoupon = true;
    
    // Format the discount amount for display
    if (order.couponDiscount) {
      order.formattedCouponDiscount = Number(order.couponDiscount).toFixed(2);
    }
  }
  
  return order;
}

/**
 * Process order data to enhance it with additional information
 */
export function processOrderData(order: any) {
  if (!order) return null;
  
  // Define the type for paymentInfo to allow adding properties later
  let paymentInfo: {
    paymentMethod?: string;
    paymentStatus?: string;
    paymentCreatedAt?: Date;
    paymentCompletedAt?: Date | null;
    isPaid?: boolean;
    isPending?: boolean;
    paymentDateFormatted?: string | null;
    paymentCompletedDateFormatted?: string;
    transactionId?: string;
  } = {};
  
  // Extract payment information from payments array to top level
  if (order.payments && order.payments.length > 0) {
    // Get the primary payment record (typically the first one)
    const primaryPayment = order.payments[0];
    
    // Create a payment info object with all relevant details
    paymentInfo = {
      paymentMethod: primaryPayment.paymentMethod,
      paymentStatus: primaryPayment.status,
      paymentCreatedAt: primaryPayment.createdAt,
      paymentCompletedAt: primaryPayment.completedAt,
      isPaid: primaryPayment.status === 'completed',
      isPending: primaryPayment.status === 'pending',
      paymentDateFormatted: primaryPayment.createdAt ? 
        new Date(primaryPayment.createdAt).toLocaleDateString() : null
    };
    
    // Add payment completion date if available
    if (primaryPayment.completedAt) {
      paymentInfo.paymentCompletedDateFormatted = 
        new Date(primaryPayment.completedAt).toLocaleDateString();
    }
    
    // Add transaction ID for Moamalat payments
    if (primaryPayment.paymentMethod === 'moamalat' && primaryPayment.transactionId) {
      paymentInfo.transactionId = primaryPayment.transactionId;
    }
  }
  
  // Create a new order object with payment info at the top
  const processedOrder = {
    ...paymentInfo,
    ...order
  };
  
  // Process the items
  if (processedOrder.items) {
    for (const item of processedOrder.items) {
      // Process promotion info
      if (item.promotionInfo) {
        try {
          item.appliedPromotions = JSON.parse(item.promotionInfo);
          item.hasPromotion = true;
        } catch (e) {
          console.error('Failed to parse promotion info:', e);
        }
      }
      
      // Extract main product image if available
      if (item.product?.images && item.product.images.length > 0) {
        const mainImage = item.product.images.find(img => img.imageType === 'main');
        item.product.mainImageUrl = mainImage ? mainImage.path : 
          (item.product.images.length > 0 ? item.product.images[0].path : null);
      }
      
      // Format variant attributes for better display
      if (item.variant?.attributeValues && item.variant.attributeValues.length > 0) {
        item.variant.formattedAttributes = item.variant.attributeValues.map(av => 
          `${av.attribute.name}: ${av.value}`).join(', ');
      }
    }
  }
  
  // Format monetary values
  if (processedOrder.totalAmount !== undefined) {
    processedOrder.formattedTotalAmount = Number(processedOrder.totalAmount).toFixed(2);
  }
  
  if (processedOrder.paidAmount !== undefined) {
    processedOrder.formattedPaidAmount = Number(processedOrder.paidAmount).toFixed(2);
  }
  
  return processedOrder;
}

/**
 * Process multiple orders in a collection
 * Useful for list views where many orders need processing
 */
export function processOrdersData(orders: any[]) {
  if (!orders?.length) return orders;
  
  return orders.map(order => processOrderData(order));
}

/**
 * Calculate and add summary statistics to an order
 * Includes item count, total quantity, etc.
 */
export function addOrderSummary(order: any) {
  if (!order?.items) return order;
  
  // Count unique products
  order.uniqueItemCount = order.items.length;
  
  // Count total quantity across all items
  order.totalItemQuantity = order.items.reduce(
    (sum: number, item: any) => sum + item.quantity, 
    0
  );
  
  // Calculate how many items had promotions
  order.promotedItemCount = order.items.filter(
    (item: any) => item.hasPromotion
  ).length;
  
  return order;
}

/**
 * Format monetary values in an order for display
 */
export function formatOrderAmounts(order: any) {
  if (!order) return order;
  
  // Format the total amount
  if (order.totalAmount !== undefined) {
    order.formattedTotalAmount = Number(order.totalAmount).toFixed(2);
  }
  
  // Format the paid amount
  if (order.paidAmount !== undefined) {
    order.formattedPaidAmount = Number(order.paidAmount).toFixed(2);
  }
  
  return order;
}