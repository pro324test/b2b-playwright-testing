import { PromotionType } from '../dto/create-promotion.dto';

/**
 * Group cart items by shop
 */
export function groupItemsByShop(cartItems: any[]): { [key: string]: any[] } {
  const cartItemsByShop: { [key: string]: any[] } = {};
  
  if (!cartItems || cartItems.length === 0) {
    return cartItemsByShop;
  }

  for (const item of cartItems) {
    if (!item.product || !item.product.shop) continue;
    
    const shopId = item.product.shopId;
    if (!cartItemsByShop[shopId]) {
      cartItemsByShop[shopId] = [];
    }
    cartItemsByShop[shopId].push(item);
  }

  return cartItemsByShop;
}

/**
 * Group cart items by product ID
 */
export function groupItemsByProduct(cartItems: any[]): { [key: string]: any } {
  const productGroups = {};
  
  for (const item of cartItems) {
    if (!item.productId) continue;
    
    if (!productGroups[item.productId]) {
      productGroups[item.productId] = {
        items: [],
        quantity: 0
      };
    }
    
    productGroups[item.productId].items.push(item);
    productGroups[item.productId].quantity += item.quantity;
  }
  
  return productGroups;
}

/**
 * Group cart items by variant ID
 * For products without variants, uses product ID as key with 'p-' prefix
 */
export function groupItemsByVariant(cartItems: any[]): { [key: string]: any } {
  const variantGroups = {};
  
  for (const item of cartItems) {
    const key = item.variantId || `p-${item.productId}`;
    
    if (!variantGroups[key]) {
      variantGroups[key] = {
        items: [],
        quantity: 0,
        productId: item.productId
      };
    }
    
    variantGroups[key].items.push(item);
    variantGroups[key].quantity += item.quantity;
  }
  
  return variantGroups;
}

/**
 * Apply shop-specific promotions to cart items
 */
export async function applyShopPromotions(
  promotionService: any,
  cart: any
): Promise<any> {
  if (!cart.items || cart.items.length === 0) {
    return cart;
  }

  // Group items by shop
  const cartItemsByShop = groupItemsByShop(cart.items);
  
  // Apply promotions to each shop's items separately
  let processedItems: any[] = [];
  
  for (const [shopId, items] of Object.entries(cartItemsByShop)) {
    // Apply any promotions for this shop
    const itemsWithPromotions = await applyPromotionsToCart(
      promotionService,
      items, 
      parseInt(shopId)
    );
    processedItems = [...processedItems, ...itemsWithPromotions];
  }
  
  // Replace cart items with processed items (with promotions applied)
  cart.items = processedItems;
  
  return cart;
}

/**
 * Calculate promotion effects on cart totals
 */
export function calculatePromotionTotals(cart: any): any {
  if (!cart.items || cart.items.length === 0) {
    cart.subtotal = 0;
    cart.promotionDiscount = 0;
    return cart;
  }

  let subtotal = 0;
  let originalSubtotal = 0;
  
  // For each item, calculate its contribution to subtotal
  for (const item of cart.items) {
    // Original price without promotions
    const originalItemTotal = item.basePrice * item.quantity;
    originalSubtotal += originalItemTotal;
    
    // Final price after promotions
    subtotal += Number(item.finalPrice) * item.quantity;
  }
  
  // Calculate promotion discount
  cart.originalSubtotal = originalSubtotal;
  cart.subtotal = subtotal;
  cart.promotionDiscount = originalSubtotal - subtotal;
  
  return cart;
}

/**
 * Apply promotions to cart items with variant-level priority
 * This is the main function that applies promotions to cart items
 * It ensures each variant gets at most one promotion with variant-specific promotions
 * taking priority over general ones
 */
export async function applyPromotionsToCart(
  promotionService: any, 
  cartItems: any[], 
  shopId: number
) {
  // Get all active promotions for the shop
  const activePromotions = await promotionService.findActiveShopPromotions(shopId);
  
  if (!activePromotions.length) {
    return cartItems; // No promotions to apply
  }
  
  // Create a copy of cart items to avoid mutating the input
  const processedItems = JSON.parse(JSON.stringify(cartItems));
  
  // Split promotions into variant-specific and general
  const variantSpecificPromotions = activePromotions.filter(p => 
    p.bogoRule && p.bogoRule.applyToAllVariants === false
  );
  
  const generalPromotions = activePromotions.filter(p => 
    p.bogoRule && (p.bogoRule.applyToAllVariants === true || p.bogoRule.applyToAllVariants === undefined)
  );
  
  // Create a tracking set for variant IDs that already have promotions applied
  const promotedVariants = new Set();
  
  // Create a tracking set for product IDs (for non-variant items) that have promotions applied
  const promotedProducts = new Set();
  
  // Group items by product ID and variant ID for easier processing
  const productGroups = groupItemsByProduct(processedItems);
  const variantGroups = groupItemsByVariant(processedItems);
  
  // STEP 1: First apply variant-specific promotions (higher priority)
  for (const promotion of variantSpecificPromotions) {
    if (!promotion.bogoRule || !promotion.bogoRule.applicableVariantIds?.length) continue;
    
    // Process each specified variant in this promotion
    for (const variantId of promotion.bogoRule.applicableVariantIds) {
      // Skip if this variant already has a promotion applied
      if (promotedVariants.has(variantId)) continue;
      
      // Get items with this variant ID
      const variantItems = processedItems.filter(item => item.variantId === variantId);
      if (variantItems.length === 0) continue;
      
      // Apply promotion based on type
      let promotionApplied = false;
      
      switch (promotion.type) {
        case PromotionType.BOGO_SAME:
          promotionApplied = applySameProductBogoToVariant(variantItems, promotion);
          break;
        case PromotionType.BOGO_DIFFERENT:
          promotionApplied = applyDifferentProductBogoToVariant(variantItems, promotion, processedItems);
          break;
        case PromotionType.BUY_X_GET_Y_DISCOUNT:
          promotionApplied = applyDiscountToVariant(variantItems, promotion);
          break;
      }
      
      // Mark this variant as processed if promotion was applied
      if (promotionApplied) {
        promotedVariants.add(variantId);
        
        // Also mark the product as having a promotion
        const productId = variantItems[0].productId;
        if (productId) promotedProducts.add(productId);
      }
    }
  }
  
  // STEP 2: Apply general promotions to remaining variants
  for (const promotion of generalPromotions) {
    if (!promotion.bogoRule) continue;
    
    // Get applicable product IDs
    const applicableProductIds = promotion.bogoRule.applicableProducts?.length 
      ? promotion.bogoRule.applicableProducts.map(p => p.id) 
      : Object.keys(productGroups).map(id => parseInt(id));
    
    // Process each applicable product
    for (const productId of applicableProductIds) {
      const productItems = processedItems.filter(item => item.productId === productId);
      if (productItems.length === 0) continue;
      
      // Group product items by variant
      const variantGroups = {};
      for (const item of productItems) {
        const key = item.variantId || `p-${productId}`;
        if (!variantGroups[key]) {
          variantGroups[key] = [];
        }
        variantGroups[key].push(item);
      }
      
      // Process each variant group
      for (const variantKey in variantGroups) {
        // Skip if this variant already has a promotion
        if (variantKey.startsWith('p-')) {
          // This is a product without variant
          if (promotedProducts.has(parseInt(variantKey.substring(2)))) continue;
        } else {
          // This is a variant
          if (promotedVariants.has(parseInt(variantKey))) continue;
        }
        
        const variantItems = variantGroups[variantKey];
        let promotionApplied = false;
        
        switch (promotion.type) {
          case PromotionType.BOGO_SAME:
            promotionApplied = applySameProductBogoToVariant(variantItems, promotion);
            break;
          case PromotionType.BOGO_DIFFERENT:
            promotionApplied = applyDifferentProductBogoToVariant(variantItems, promotion, processedItems);
            break;
          case PromotionType.BUY_X_GET_Y_DISCOUNT:
            promotionApplied = applyDiscountToVariant(variantItems, promotion);
            break;
        }
        
        // Mark as processed if promotion was applied
        if (promotionApplied) {
          if (variantKey.startsWith('p-')) {
            promotedProducts.add(parseInt(variantKey.substring(2)));
          } else {
            promotedVariants.add(parseInt(variantKey));
          }
        }
      }
    }
  }
  
  return processedItems;
}

/**
 * Apply BOGO_SAME promotion to a specific set of variant items
 * Returns true if promotion was applied
 */
function applySameProductBogoToVariant(variantItems: any[], promotion: any): boolean {
  const { bogoRule } = promotion;
  if (!bogoRule || !bogoRule.sameProduct) return false;
  
  // Calculate total quantity of this variant
  let totalQuantity = 0;
  for (const item of variantItems) {
    totalQuantity += item.quantity;
  }
  
  // Check if there's enough quantity to qualify
  const qualifySets = Math.floor(totalQuantity / bogoRule.buyQuantity);
  if (qualifySets === 0) return false;
  
  // Calculate free items with max redemption limit
  const freeItemsToApply = Math.min(
    qualifySets * bogoRule.getQuantity,
    bogoRule.maxRedemptionsPerOrder || Number.MAX_SAFE_INTEGER
  );
  
  // Sort items by price (ascending)
  variantItems.sort((a, b) => a.basePrice - b.basePrice);
  
  // Apply discounts
  let remainingFreeItems = freeItemsToApply;
  let anyPromotionApplied = false;
  
  // Track which items have already received a discount
  const processedItems = new Set();
  
  for (const item of variantItems) {
    // Skip if this item already has this promotion applied
    if (processedItems.has(item.id)) continue;
    
    if (remainingFreeItems <= 0) break;
    
    const discountQty = Math.min(item.quantity, remainingFreeItems);
    const discountPercent = bogoRule.discountPercent || 100;
    const discountAmount = (item.basePrice * discountQty) * (discountPercent / 100);
    
    // Initialize discounts array if not exists
    if (!item.discounts) {
      item.discounts = [];
    } else {
      // Check if this promotion is already applied to this item
      const existingDiscountIndex = item.discounts.findIndex(d => d.promotionId === promotion.id);
      if (existingDiscountIndex >= 0) {
        // Update existing discount instead of adding a new one
        item.discounts[existingDiscountIndex].discountedQuantity += discountQty;
        item.discounts[existingDiscountIndex].discountAmount += discountAmount;
        processedItems.add(item.id);
        remainingFreeItems -= discountQty;
        anyPromotionApplied = true;
        continue;
      }
    }
    
    // Add promotion discount
    item.discounts.push({
      promotionId: promotion.id,
      promotionName: promotion.name,
      type: 'BOGO_SAME',
      discountedQuantity: discountQty,
      discountPercent: discountPercent,
      discountAmount: discountAmount
    });
    
    // Update item's total price
    item.finalPrice = item.finalPrice 
      ? item.finalPrice - discountAmount
      : (item.basePrice * item.quantity) - discountAmount;
      
    // Mark as part of a promotion
    item.hasPromotion = true;
    anyPromotionApplied = true;
    
    // Mark this item as processed
    processedItems.add(item.id);
    
    remainingFreeItems -= discountQty;
  }
  
  return anyPromotionApplied;
}

/**
 * Apply BOGO_DIFFERENT promotion to a specific variant
 */
function applyDifferentProductBogoToVariant(
  variantItems: any[],
  promotion: any,
  allCartItems: any[]
): boolean {
  const { bogoRule } = promotion;
  if (!bogoRule || bogoRule.sameProduct || !bogoRule.freeProductId) return false;
  
  // Calculate total quantity of this variant
  let totalQuantity = 0;
  for (const item of variantItems) {
    totalQuantity += item.quantity;
  }
  
  // Check if there's enough quantity to qualify
  const qualifySets = Math.floor(totalQuantity / bogoRule.buyQuantity);
  if (qualifySets === 0) return false;
  
  // Find free product items in the cart
  const freeProductItems = allCartItems.filter(
    item => item.productId === bogoRule.freeProductId
  );
  
  if (freeProductItems.length === 0) return false;
  
  // Calculate free items with max redemption limit
  const freeItemsToApply = Math.min(
    qualifySets * bogoRule.getQuantity,
    bogoRule.maxRedemptionsPerOrder || Number.MAX_SAFE_INTEGER
  );
  
  // Sort free product items by price (ascending)
  freeProductItems.sort((a, b) => a.basePrice - b.basePrice);
  
  // Apply discounts
  let remainingFreeItems = freeItemsToApply;
  let anyPromotionApplied = false;
  
  // Track which items have already received a discount
  const processedItems = new Set();
  
  for (const item of freeProductItems) {
    // Skip if this item already has this promotion applied
    if (processedItems.has(item.id)) continue;
    
    if (remainingFreeItems <= 0) break;
    
    const discountQty = Math.min(item.quantity, remainingFreeItems);
    const discountPercent = bogoRule.discountPercent || 100;
    const discountAmount = (item.basePrice * discountQty) * (discountPercent / 100);
    
    // Initialize discounts array if not exists
    if (!item.discounts) {
      item.discounts = [];
    } else {
      // Check if this promotion is already applied to this item
      const existingDiscountIndex = item.discounts.findIndex(d => d.promotionId === promotion.id);
      if (existingDiscountIndex >= 0) {
        // Update existing discount instead of adding a new one
        item.discounts[existingDiscountIndex].discountedQuantity += discountQty;
        item.discounts[existingDiscountIndex].discountAmount += discountAmount;
        processedItems.add(item.id);
        remainingFreeItems -= discountQty;
        anyPromotionApplied = true;
        continue;
      }
    }
    
    // Add promotion discount
    item.discounts.push({
      promotionId: promotion.id,
      promotionName: promotion.name,
      type: 'BOGO_DIFFERENT',
      discountedQuantity: discountQty,
      discountPercent: discountPercent,
      discountAmount: discountAmount
    });
    
    // Update item's total price
    item.finalPrice = item.finalPrice 
      ? item.finalPrice - discountAmount
      : (item.basePrice * item.quantity) - discountAmount;
      
    // Mark as part of a promotion
    item.hasPromotion = true;
    anyPromotionApplied = true;
    
    // Mark this item as processed
    processedItems.add(item.id);
    
    remainingFreeItems -= discountQty;
  }
  
  return anyPromotionApplied;
}

/**
 * Apply BUY_X_GET_Y_DISCOUNT promotion to a specific variant
 */
function applyDiscountToVariant(variantItems: any[], promotion: any): boolean {
  const { bogoRule } = promotion;
  if (!bogoRule) return false;
  
  // Calculate total quantity of this variant
  let totalQuantity = 0;
  for (const item of variantItems) {
    totalQuantity += item.quantity;
  }
  
  // Check if there's enough quantity to qualify
  const qualifySets = Math.floor(totalQuantity / bogoRule.buyQuantity);
  if (qualifySets === 0) return false;
  
  // Calculate discount items with max redemption limit
  const discountItemsToApply = Math.min(
    qualifySets * bogoRule.getQuantity,
    bogoRule.maxRedemptionsPerOrder || Number.MAX_SAFE_INTEGER
  );
  
  // Sort items by price (ascending)
  variantItems.sort((a, b) => a.basePrice - b.basePrice);
  
  // Apply discounts
  let remainingDiscountItems = discountItemsToApply;
  let anyPromotionApplied = false;
  
  // Track which items have already received a discount
  const processedItems = new Set();
  
  for (const item of variantItems) {
    // Skip if this item already has this promotion applied
    if (processedItems.has(item.id)) continue;
    
    if (remainingDiscountItems <= 0) break;
    
    const discountQty = Math.min(item.quantity, remainingDiscountItems);
    const discountPercent = bogoRule.discountPercent || 50;
    const discountAmount = (item.basePrice * discountQty) * (discountPercent / 100);
    
    // Initialize discounts array if not exists
    if (!item.discounts) {
      item.discounts = [];
    } else {
      // Check if this promotion is already applied to this item
      const existingDiscountIndex = item.discounts.findIndex(d => d.promotionId === promotion.id);
      if (existingDiscountIndex >= 0) {
        // Update existing discount instead of adding a new one
        item.discounts[existingDiscountIndex].discountedQuantity += discountQty;
        item.discounts[existingDiscountIndex].discountAmount += discountAmount;
        processedItems.add(item.id);
        remainingDiscountItems -= discountQty;
        anyPromotionApplied = true;
        continue;
      }
    }
    
    // Add promotion discount
    item.discounts.push({
      promotionId: promotion.id,
      promotionName: promotion.name,
      type: 'BUY_X_GET_Y_DISCOUNT',
      discountedQuantity: discountQty,
      discountPercent: discountPercent,
      discountAmount: discountAmount
    });
    
    // Update item's total price
    item.finalPrice = item.finalPrice 
      ? item.finalPrice - discountAmount
      : (item.basePrice * item.quantity) - discountAmount;
      
    // Mark as part of a promotion
    item.hasPromotion = true;
    anyPromotionApplied = true;
    
    // Mark this item as processed
    processedItems.add(item.id);
    
    remainingDiscountItems -= discountQty;
  }
  
  return anyPromotionApplied;
}