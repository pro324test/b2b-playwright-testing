import { PrismaService } from '../../prisma/prisma.service';
import { PriceRuleService } from '../../price-rule/price-rule.service';
import { CouponService } from '../../coupon/coupon.service';

/**
 * Calculate cart totals including price rules and coupons
 */
export async function calculateCartTotals(
  prisma: PrismaService,
  priceRuleService: PriceRuleService,
  couponService: CouponService,
  cart: any
) {
  // First apply price rules to each item
  for (const item of cart.items) {
    // Update the base price if variant has its own price
    if (item.variant && item.variant.price !== null && item.variant.price !== undefined) {
      item.basePrice = Number(item.variant.price);
    }

    // Calculate pricing based on rules - include user's vendor groups if available
    const userVendorGroups = cart.user?.vendorGroups?.map(vg => vg.id) || [];
    
    const { finalPrice, appliedRuleId } = await calculateProductPrice(
      priceRuleService,
      item.product,
      item.variant,
      item.quantity,
      userVendorGroups
    );

    item.finalPrice = finalPrice;
    item.appliedRuleId = appliedRuleId;
  }
  
  // Calculate subtotal after price rules
  let subtotal = 0;
  for (const item of cart.items) {
    subtotal += Number(item.finalPrice) * item.quantity;
  }
  cart.subtotal = subtotal;
  
  // Apply coupon discount if exists
  if (cart.appliedCouponCode) {
    // Always recalculate the coupon discount when there's a coupon code
    try {
      // Get the shopId from the first item (assumption: coupon applies to specific shop)
      const shopId = cart.items.length > 0 ? cart.items[0].product.shopId : null;
      
      // Validate the coupon and get the discount amount
      const validationResult = await couponService.validateCoupon(
        cart.appliedCouponCode,
        cart.userId,
        subtotal,
        shopId
      );
      
      if (validationResult.valid) {
        cart.couponDiscount = validationResult.discountAmount;
        
        // Update the discount in the database
        await prisma.cart.update({
          where: { id: cart.id },
          data: { couponDiscount: validationResult.discountAmount }
        });
      } else {
        // Coupon has become invalid, remove it
        await prisma.cart.update({
          where: { id: cart.id },
          data: { 
            appliedCouponCode: null,
            couponDiscount: null
          }
        });
        cart.appliedCouponCode = null;
        cart.couponDiscount = null;
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      // If there's an error with the coupon, remove it
      cart.appliedCouponCode = null;
      cart.couponDiscount = null;
    }
  }
  
  // Final total calculation with coupon discount
  cart.discount = cart.couponDiscount || 0;
  cart.total = subtotal - cart.discount;
  
  return cart;
}

/**
 * Calculate the price of a product with all applicable rules
 */
export async function calculateProductPrice(
  priceRuleService: PriceRuleService,
  product: any, 
  variant: any, 
  quantity: number,
  userVendorGroups: number[] = []
) {
  // Determine base price
  const basePrice = variant && variant.price !== null && variant.price !== undefined 
    ? Number(variant.price) 
    : Number(product.basePrice);
  
  // Check rules in order of specificity, starting with most specific
  
  // 1. Variant + Vendor Group specific rules (highest priority)
  if (variant && userVendorGroups.length > 0) {
    try {
      const variantRules = await priceRuleService.findActiveRulesForVariant(variant.id);
      if (variantRules?.data?.length > 0) {
        // Find rules that are both variant-specific AND for this user's vendor group
        const variantVendorGroupRules = variantRules.data.filter(rule => 
          rule.vendorGroupId && userVendorGroups.includes(rule.vendorGroupId)
        );
        
        if (variantVendorGroupRules.length > 0) {
          // We have variant + vendor group specific rules
          return findBestPriceRule(variantVendorGroupRules, basePrice, quantity);
        }
      }
    } catch (error) {
      console.log('Error fetching variant + vendor group price rules:', error);
    }
  }
  
  // 2. Variant-only specific rules
  if (variant) {
    try {
      const variantRules = await priceRuleService.findActiveRulesForVariant(variant.id);
      if (variantRules?.data?.length > 0) {
        // Find rules that are variant-specific but NOT vendor group specific
        const variantOnlyRules = variantRules.data.filter(rule => !rule.vendorGroupId);
        
        if (variantOnlyRules.length > 0) {
          return findBestPriceRule(variantOnlyRules, basePrice, quantity);
        }
      }
    } catch (error) {
      console.log('Error fetching variant price rules:', error);
    }
  }
  
  // 3. Product + Vendor Group specific rules
  if (userVendorGroups.length > 0) {
    try {
      const productRules = await priceRuleService.findActiveRulesForProduct(product.id);
      if (productRules?.data?.length > 0) {
        // Find rules that are product-specific AND for this user's vendor group
        const productVendorGroupRules = productRules.data.filter(rule => 
          rule.products?.some(p => p.id === product.id) &&
          rule.vendorGroupId && 
          userVendorGroups.includes(rule.vendorGroupId)
        );
        
        if (productVendorGroupRules.length > 0) {
          return findBestPriceRule(productVendorGroupRules, basePrice, quantity);
        }
      }
    } catch (error) {
      console.log('Error fetching product + vendor group price rules:', error);
    }
  }
  
  // 4. Product-specific rules (no vendor group)
  try {
    const productRules = await priceRuleService.findActiveRulesForProduct(product.id);
    if (productRules?.data?.length > 0) {
      const specificProductRules = productRules.data.filter(rule => 
        rule.products?.some(p => p.id === product.id) && !rule.vendorGroupId
      );
      
      if (specificProductRules.length > 0) {
        return findBestPriceRule(specificProductRules, basePrice, quantity);
      }
    }
  } catch (error) {
    console.log('Error fetching product-specific price rules:', error);
  }
  
  // 5. Shop + Vendor Group specific rules
  if (userVendorGroups.length > 0) {
    try {
      const productRules = await priceRuleService.findActiveRulesForProduct(product.id);
      if (productRules?.data?.length > 0) {
        const shopVendorGroupRules = productRules.data.filter(rule => 
          rule.shops?.some(s => s.id === product.shopId) &&
          rule.vendorGroupId && 
          userVendorGroups.includes(rule.vendorGroupId)
        );
        
        if (shopVendorGroupRules.length > 0) {
          return findBestPriceRule(shopVendorGroupRules, basePrice, quantity);
        }
      }
    } catch (error) {
      console.log('Error fetching shop + vendor group price rules:', error);
    }
  }
  
  // 6. Shop-specific rules (no vendor group)
  try {
    const productRules = await priceRuleService.findActiveRulesForProduct(product.id);
    if (productRules?.data?.length > 0) {
      const shopRules = productRules.data.filter(rule => 
        rule.shops?.some(s => s.id === product.shopId) && !rule.vendorGroupId
      );
      
      if (shopRules.length > 0) {
        return findBestPriceRule(shopRules, basePrice, quantity);
      }
    }
  } catch (error) {
    console.log('Error fetching shop-specific price rules:', error);
  }
  
  // 7. Vendor + Vendor Group specific rules
  if (userVendorGroups.length > 0) {
    try {
      const productRules = await priceRuleService.findActiveRulesForProduct(product.id);
      if (productRules?.data?.length > 0) {
        const vendorVendorGroupRules = productRules.data.filter(rule => 
          rule.vendorId === product.shop.vendorId &&
          rule.vendorGroupId && 
          userVendorGroups.includes(rule.vendorGroupId)
        );
        
        if (vendorVendorGroupRules.length > 0) {
          return findBestPriceRule(vendorVendorGroupRules, basePrice, quantity);
        }
      }
    } catch (error) {
      console.log('Error fetching vendor + vendor group price rules:', error);
    }
  }
  
  // 8. Vendor-specific rules (no vendor group)
  try {
    const productRules = await priceRuleService.findActiveRulesForProduct(product.id);
    if (productRules?.data?.length > 0) {
      const vendorRules = productRules.data.filter(rule => 
        rule.vendorId === product.shop.vendorId && !rule.vendorGroupId
      );
      
      if (vendorRules.length > 0) {
        return findBestPriceRule(vendorRules, basePrice, quantity);
      }
    }
  } catch (error) {
    console.log('Error fetching vendor-specific price rules:', error);
  }
  
  // 9. Vendor Group rules only (lowest priority)
  if (userVendorGroups.length > 0) {
    try {
      let vendorGroupRules: any[] = [];
      
      for (const groupId of userVendorGroups) {
        const groupRules = await priceRuleService.findActiveRulesForVendorGroup(groupId);
        if (groupRules?.data?.length > 0) {
          // Only get rules that are pure vendor group rules (not tied to product, shop, etc.)
          const pureVendorGroupRules = groupRules.data.filter(rule => 
            !rule.products?.length && 
            !rule.shops?.length && 
            !rule.variants?.length &&
            !rule.vendorId
          );
          vendorGroupRules = [...vendorGroupRules, ...pureVendorGroupRules];
        }
      }
      
      if (vendorGroupRules.length > 0) {
        return findBestPriceRule(vendorGroupRules, basePrice, quantity);
      }
    } catch (error) {
      console.log('Error fetching vendor group price rules:', error);
    }
  }
  
  // No applicable rules found
  return { finalPrice: basePrice, appliedRuleId: null };
}

/**
 * Find the best price rule for a product
 */
export function findBestPriceRule(rules: any[], basePrice: number, quantity: number) {
  // Default to base price if no rules apply
  let finalPrice = basePrice;
  let appliedRuleId = null;
  
  // Find the rule that gives the best price for the customer
  if (rules && rules.length > 0) {
    let bestPrice = basePrice;
    
    for (const rule of rules) {
      // Check if quantity meets rule criteria
      if (quantity >= rule.minQuantity && (!rule.maxQuantity || quantity <= rule.maxQuantity)) {
        let calculatedPrice;
        
        switch (rule.type) {
          case 'discount':
            // Apply percentage discount
            calculatedPrice = basePrice - (basePrice * (rule.value / 100));
            break;
          case 'fixed_price':
            // Direct price override for bulk purchases
            calculatedPrice = rule.value;
            break;
          default:
            calculatedPrice = basePrice;
        }
        
        // Keep the best (lowest) price
        if (calculatedPrice < bestPrice) {
          bestPrice = calculatedPrice;
          appliedRuleId = rule.id;
        }
      }
    }
    
    finalPrice = bestPrice;
  }
  
  return { 
    finalPrice, 
    appliedRuleId 
  };
}