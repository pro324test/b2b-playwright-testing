import { PrismaService } from '../../prisma/prisma.service';
import { PromotionService } from '../../promotion/promotion.service';

/**
 * Group cart items by shop to prepare for applying shop-specific promotions
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
 * Apply shop-specific promotions to cart items
 */
export async function applyShopPromotions(
  promotionService: PromotionService,
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
    const itemsWithPromotions = await promotionService.applyPromotionsToCart(
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
 * Get available promotions for a shop
 */
export async function getAvailablePromotions(
  promotionService: PromotionService,
  shopId: number
): Promise<any[]> {
  return promotionService.findActiveShopPromotions(shopId);
}

/**
 * Validate if a product is eligible for a specific promotion
 */
export function checkProductPromotionEligibility(
  product: any,
  promotion: any
): boolean {
  if (!promotion.bogoRule) {
    return false;
  }
  
  // Check if product is in the applicable products list
  const applicableProductIds = promotion.bogoRule.applicableProducts?.map(p => p.id) || [];
  
  if (applicableProductIds.length === 0) {
    // If no specific products are listed, check if categories match
    const applicableCategoryIds = promotion.bogoRule.applicableCategories?.map(c => c.id) || [];
    if (applicableCategoryIds.length === 0) {
      return true; // No restrictions, all products are eligible
    }
    
    // Check if the product belongs to any of the applicable categories
    return product.categories?.some(cat => applicableCategoryIds.includes(cat.id)) || false;
  }
  
  // Check if product is directly listed
  return applicableProductIds.includes(product.id);
}