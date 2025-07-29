import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

// Updated PriceRule interface to include the rulePriority property
interface PriceRule {
  id: number;
  name: string;
  type: string;
  value: Prisma.Decimal | number | null;
  minQuantity: number;
  maxQuantity?: number | null;
  vendorId?: number | null;
  vendorGroupId?: number | null;
  products?: Array<{ id: number }>;
  shops?: Array<{ id: number }>;
  variants?: Array<{ id: number }>;
  ruleSource?: string;
  rulePriority?: number;  // Added this property to fix TypeScript error
  [key: string]: any; // For any other properties
}

interface PricingResult {
  basePrice: number;
  finalPrice: number;
  discount: number;
  discountPercentage: number;
  appliedRule: {
    id: number;
    name: string;
    type: string;
    value: number;
    ruleSource?: string;
  } | null;
}

interface ProductVariant {
  id: number;
  price: number | null;
  [key: string]: any; // For other properties
}

/**
 * Get all price rules applicable to a product with enhanced vendor group handling
 */
export async function getApplicableProductRules(
  prisma: PrismaService, 
  productId: number,
  userVendorGroups: number[] = []
): Promise<PriceRule[]> {
  // Get the product with shop and vendor info for cascade rules
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      shop: {
        include: {
          vendor: true
        }
      }
    }
  });

  if (!product) {
    return [];
  }

  // Get active price rules that apply to this product (all levels)
  const now = new Date();
  let priceRules = await prisma.priceRule.findMany({
    where: {
      status: 'enabled',
      OR: [
        // Product-specific rules
        { products: { some: { id: productId } } },
        // Shop-specific rules
        { shops: { some: { id: product.shopId } } },
        // Vendor-specific rules
        { vendorId: product.shop.vendorId },
        // Vendor group rules (if user belongs to vendor groups)
        ...(userVendorGroups.length > 0 ? [
          { vendorGroupId: { in: userVendorGroups } }
        ] : [])
      ],
      // Time constraints
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] }
      ]
    },
    include: {
      products: true,
      shops: true,
      variants: true
    }
  });

  // Add source information and priority level to each rule
  // Use explicit type casting to ensure TypeScript knows these properties exist
  const rulesWithPriority = priceRules.map(rule => {
    const ruleInfo = determineRuleSourceAndPriority(rule, product, userVendorGroups);
    return { 
      ...rule, 
      ruleSource: ruleInfo.source,
      rulePriority: ruleInfo.priority 
    } as PriceRule;
  });

  // Sort rules by priority (lowest number is highest priority)
  return rulesWithPriority.sort((a, b) => 
    (a.rulePriority || 999) - (b.rulePriority || 999)
  );
}

/**
 * Get all price rules applicable to a product variant with enhanced vendor group handling
 */
export async function getApplicableVariantRules(
  prisma: PrismaService, 
  variantId: number,
  userVendorGroups: number[] = []
): Promise<PriceRule[]> {
  // Get the variant with its product info
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: {
      product: {
        include: {
          shop: {
            include: {
              vendor: true
            }
          }
        }
      }
    }
  });

  if (!variant) {
    return [];
  }

  // Get active price rules that apply to this variant (all levels)
  const now = new Date();
  let priceRules = await prisma.priceRule.findMany({
    where: {
      status: 'enabled',
      OR: [
        // Variant-specific rules
        { variants: { some: { id: variantId } } },
        // Product-specific rules
        { products: { some: { id: variant.product.id } } },
        // Shop-specific rules
        { shops: { some: { id: variant.product.shopId } } },
        // Vendor-specific rules
        { vendorId: variant.product.shop.vendorId },
        // Vendor group rules (if user belongs to vendor groups)
        ...(userVendorGroups.length > 0 ? [
          { vendorGroupId: { in: userVendorGroups } }
        ] : [])
      ],
      // Time constraints
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] }
      ]
    },
    include: {
      products: true,
      shops: true,
      variants: true
    }
  });

  // Add source information and priority level to each rule
  const rulesWithPriority = priceRules.map(rule => {
    const ruleInfo = determineVariantRuleSourceAndPriority(rule, variant, userVendorGroups);
    return { 
      ...rule, 
      ruleSource: ruleInfo.source,
      rulePriority: ruleInfo.priority 
    } as PriceRule;
  });

  // Sort rules by priority (lowest number is highest priority)
  return rulesWithPriority.sort((a, b) => 
    (a.rulePriority || 999) - (b.rulePriority || 999)
  );
}

/**
 * Calculate the best price based on applicable rules
 * Enhanced to respect priority - first use highest priority rules,
 * and only within the same priority level look for best price
 */
export function calculateBestPrice(
  basePrice: number, 
  rules: PriceRule[], 
  quantity: number = 1
): PricingResult {
  if (!rules || rules.length === 0) {
    return {
      basePrice: Number(basePrice),
      finalPrice: Number(basePrice),
      discount: 0,
      discountPercentage: 0,
      appliedRule: null
    };
  }

  // Rules should already be sorted by priority (lowest number = highest priority)
  
  // Group rules by priority
  const rulesByPriority: { [key: number]: PriceRule[] } = {};
  for (const rule of rules) {
    const priority = rule.rulePriority || 999; // Default to lowest priority if not set
    if (!rulesByPriority[priority]) {
      rulesByPriority[priority] = [];
    }
    rulesByPriority[priority].push(rule);
  }
  
  // Get the highest priority level (lowest number) that has applicable rules
  const priorities = Object.keys(rulesByPriority).map(Number).sort((a, b) => a - b);
  
  // For each priority level, starting with highest priority
  for (const priority of priorities) {
    const priorityRules = rulesByPriority[priority];
    
    let bestPrice = Number(basePrice);
    let bestRule: PriceRule | null = null;
    
    // Find the best price within this priority level
    for (const rule of priorityRules) {
      // Skip rules that don't apply to this quantity
      if (rule.minQuantity && quantity < rule.minQuantity) continue;
      if (rule.maxQuantity && quantity > rule.maxQuantity) continue;
      // Skip rules with null value
      if (rule.value === null) continue;

      let calculatedPrice: number;
      
      // Calculate price based on rule type
      switch (rule.type) {
        case 'discount':
          calculatedPrice = Number(basePrice) * (1 - Number(rule.value) / 100);
          break;
        case 'fixed_price':
          calculatedPrice = Number(rule.value);
          break;
        default:
          calculatedPrice = Number(basePrice);
      }

      // Update best price if this rule gives a better deal
      if (calculatedPrice < bestPrice) {
        bestPrice = calculatedPrice;
        bestRule = rule;
      }
    }
    
    // If we found an applicable rule at this priority level, return it
    // (don't check lower priority rules)
    if (bestRule) {
      return {
        basePrice: Number(basePrice),
        finalPrice: bestPrice,
        discount: Number(basePrice) - bestPrice,
        discountPercentage: ((Number(basePrice) - bestPrice) / Number(basePrice)) * 100,
        appliedRule: bestRule ? {
          id: bestRule.id,
          name: bestRule.name,
          type: bestRule.type,
          value: Number(bestRule.value || 0), // Ensure value is a number
          ruleSource: bestRule.ruleSource
        } : null
      };
    }
  }

  // No applicable rules found
  return {
    basePrice: Number(basePrice),
    finalPrice: Number(basePrice),
    discount: 0,
    discountPercentage: 0,
    appliedRule: null
  };
}

/**
 * Enhance product with pricing information
 * Updated to support user vendor groups
 */
export async function enhanceProductWithPricing(
  prisma: PrismaService, 
  product: any,
  userVendorGroups: number[] = []
) {
  // Get all applicable price rules for this product
  const productRules = await getApplicableProductRules(
    prisma, 
    product.id, 
    userVendorGroups
  );
  
  // Calculate the best price for the product
  const productPricing = calculateBestPrice(product.basePrice, productRules);
  
  // Process variants if they exist
  let variantsWithPricing: any[] = [];
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    variantsWithPricing = await Promise.all(
      product.variants.map(async (variant: ProductVariant) => {
        // Get variant-specific rules
        const variantRules = await getApplicableVariantRules(
          prisma, 
          variant.id,
          userVendorGroups
        );
        
        // Use variant price if set, otherwise use product base price
        const variantBasePrice = variant.price !== null ? 
          Number(variant.price) : Number(product.basePrice);
          
        // Calculate best price for variant
        const variantPricing = calculateBestPrice(variantBasePrice, variantRules);
        
        return {
          ...variant,
          basePrice: variantBasePrice,
          finalPrice: variantPricing.finalPrice,
          discount: variantPricing.discount,
          discountPercentage: variantPricing.discountPercentage,
          appliedRule: variantPricing.appliedRule,
          priceRules: variantRules.map(rule => ({
            id: rule.id,
            name: rule.name,
            type: rule.type,
            value: Number(rule.value || 0), // Convert Decimal/null to number
            ruleSource: rule.ruleSource,
            rulePriority: rule.rulePriority
          }))
        };
      })
    );
  }

  // Return enhanced product
  return {
    ...product,
    basePrice: Number(product.basePrice),
    finalPrice: productPricing.finalPrice,
    discount: productPricing.discount,
    discountPercentage: productPricing.discountPercentage,
    appliedRule: productPricing.appliedRule,
    priceRules: productRules.map(rule => ({
      id: rule.id,
      name: rule.name,
      type: rule.type,
      value: Number(rule.value || 0), // Convert Decimal/null to number
      ruleSource: rule.ruleSource,
      rulePriority: rule.rulePriority
    })),
    variants: variantsWithPricing.length > 0 ? variantsWithPricing : product.variants
  };
}

/**
 * Determine the source and priority of a price rule for a product
 * with enhanced vendor group handling that mirrors cart-pricing.ts
 */
function determineRuleSourceAndPriority(
  rule: any, 
  product: any,
  userVendorGroups: number[] = []
): { source: string; priority: number } {
  // 3. Product + Vendor Group specific rules (priority: 3)
  const isProductSpecific = rule.products?.some((p: any) => p.id === product.id);
  const hasVendorGroup = rule.vendorGroupId && userVendorGroups.includes(rule.vendorGroupId);
  
  if (isProductSpecific && hasVendorGroup) {
    return { source: 'product+vendorGroup', priority: 3 };
  }
  
  // 4. Product-specific rules only (priority: 4)
  if (isProductSpecific && !hasVendorGroup) {
    return { source: 'product', priority: 4 };
  }
  
  // 5. Shop + Vendor Group specific rules (priority: 5)
  const isShopSpecific = rule.shops?.some((s: any) => s.id === product.shopId);
  if (isShopSpecific && hasVendorGroup) {
    return { source: 'shop+vendorGroup', priority: 5 };
  }
  
  // 6. Shop-specific rules only (priority: 6)
  if (isShopSpecific && !hasVendorGroup) {
    return { source: 'shop', priority: 6 };
  }
  
  // 7. Vendor + Vendor Group specific rules (priority: 7)
  const isVendorSpecific = rule.vendorId === product.shop.vendorId;
  if (isVendorSpecific && hasVendorGroup) {
    return { source: 'vendor+vendorGroup', priority: 7 };
  }
  
  // 8. Vendor-specific rules only (priority: 8)
  if (isVendorSpecific && !hasVendorGroup) {
    return { source: 'vendor', priority: 8 };
  }
  
  // 9. Vendor Group rules only (lowest priority: 9)
  if (hasVendorGroup) {
    return { source: 'vendorGroup', priority: 9 };
  }
  
  return { source: 'unknown', priority: 999 };
}

/**
 * Determine the source and priority of a price rule for a variant
 * with enhanced vendor group handling that mirrors cart-pricing.ts
 */
function determineVariantRuleSourceAndPriority(
  rule: any, 
  variant: any,
  userVendorGroups: number[] = []
): { source: string; priority: number } {
  // 1. Variant + Vendor Group specific rules (highest priority: 1)
  const isVariantSpecific = rule.variants?.some((v: any) => v.id === variant.id);
  const hasVendorGroup = rule.vendorGroupId && userVendorGroups.includes(rule.vendorGroupId);
  
  if (isVariantSpecific && hasVendorGroup) {
    return { source: 'variant+vendorGroup', priority: 1 };
  }
  
  // 2. Variant-specific rules only (priority: 2)
  if (isVariantSpecific && !hasVendorGroup) {
    return { source: 'variant', priority: 2 };
  }
  
  // For other rules, use the product rule determination logic
  return determineRuleSourceAndPriority(
    rule, 
    variant.product, 
    userVendorGroups
  );
}