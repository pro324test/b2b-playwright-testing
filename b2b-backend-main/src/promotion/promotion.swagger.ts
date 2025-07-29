import { applyDecorators } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody, 
  ApiParam,
  ApiQuery 
} from '@nestjs/swagger';
import { CreatePromotionDto, PromotionType } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { SortDirection } from '../common/dto/pagination.dto';

export const CreatePromotionSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor Only] Create a promotion',
      description: `Create a new promotional offer for your shop. 
      
## Promotion Types
- **bogo_same**: Buy X of same product, get Y of same product free (or at discount)
- **bogo_different**: Buy X of specified products, get Y of another product free (or at discount)
- **buy_x_get_y_discount**: Buy X products, get Y products at discount percentage

## Key Terms
- **buyQuantity**: How many items customer must purchase to trigger the promotion
- **getQuantity**: How many items will receive the discount or free offer
- **discountPercent**: Percentage discount applied (100% = free, 50% = half price)
- **sameProduct**: Whether the discounted items must be the same as purchased items
- **freeProductId**: ID of the specific product to give as free/discounted (only for bogo_different)
- **maxRedemptionsPerOrder**: Maximum number of times this promotion can be applied in one order
- **applicableProductIds/applicableCategoryIds**: Which products or categories the promotion applies to

## Note
You must specify which products/categories the promotion applies to using applicableProductIds or applicableCategoryIds.`
    }),
    ApiBearerAuth(),
    ApiBody({
      type: CreatePromotionDto,
      examples: {
        'Buy 2 Get 1 Free (Same Product)': {
          summary: 'Buy 2 Get 1 Free (Same Product)',
          description: 'Customer buys 2 of any applicable product, gets 1 of same product free. This is the classic "Buy 2, Get 1 Free" promotion where the free item is the same product that was purchased.',
          value: {
            name: "Buy 2 Get 1 Free",
            description: "Summer sale - buy 2 items, get 1 free!",
            type: "bogo_same",
            startDate: "2025-06-01",
            endDate: "2025-08-31",
            shopId: 1,
            bogoRule: {
              buyQuantity: 2,             // Customer must buy 2 items
              getQuantity: 1,             // Customer gets 1 item free
              sameProduct: true,          // The free item must be the same product
              discountPercent: 100,       // 100% discount means completely free
              maxRedemptionsPerOrder: 3,  // This promotion can be used up to 3 times per order
              applicableProductIds: [1, 2, 3],     // Applies to products with IDs 1, 2, 3
              applicableCategoryIds: [5]           // Applies to products in category with ID 5
            }
          }
        },
        'Buy From Category, Get Specific Product Free': {
          summary: 'Buy From Category, Get Specific Product Free',
          description: 'Customer buys products from a specific category, gets a different product free. This promotion is useful for cross-selling or promoting specific items.',
          value: {
            name: "Buy 2 From Summer Collection, Get Free Sunglasses",
            description: "Buy any 2 items from summer collection, get a free pair of sunglasses",
            type: "bogo_different",
            startDate: "2025-06-01",
            endDate: "2025-08-31",
            shopId: 1,
            bogoRule: {
              buyQuantity: 2,             // Customer must buy 2 items
              getQuantity: 1,             // Customer gets 1 item free
              sameProduct: false,         // The free item is different from what's purchased
              freeProductId: 42,          // Product ID 42 (sunglasses) is the free item
              discountPercent: 100,       // 100% discount means completely free
              applicableCategoryIds: [5]  // Applies when buying from category ID 5
            }
          }
        },
        'Buy 3 Get 1 at 50% Off': {
          summary: 'Buy 3 Get 1 at 50% Off',
          description: `Customer buys 3 of any applicable product, gets 1 at half price. This is a partial discount promotion that encourages higher quantity purchases.
  
  ## How It Works
  - When a customer adds 3 or more eligible products to their cart
  - The system automatically applies a 50% discount to the lowest-priced item
  - For example, if they buy 3 shirts at $20 each, the 3rd shirt would cost only $10
  - If they buy 6 items, they would get 2 items at 50% off (with maxRedemptionsPerOrder set to 2)
  - Unlike a "free" promotion, this gives a partial discount, making it more economical for the store while still providing customer value
  
  ## Use Cases
  - Incentivize customers to add more items to their cart
  - Move inventory without giving items away completely free
  - Offer a more moderate promotion when full "buy one get one free" would be too costly`,
          value: {
            name: "Buy 3 Get 1 Half Price",
            description: "Purchase 3 items, get another at half price!",
            type: "buy_x_get_y_discount",
            startDate: "2025-06-01",
            shopId: 1,
            bogoRule: {
              buyQuantity: 3,             // Customer must buy 3 items
              getQuantity: 1,             // Customer gets discount on 1 item
              sameProduct: true,          // The discounted item is the same product
              discountPercent: 50,        // 50% discount (half price)
              applicableProductIds: [10, 11, 12, 13]  // Applies to products with these IDs
            }
          }
        },
        'Buy 2 Get 1 Free (Specific Variants Only)': {
          summary: 'Buy 2 Get 1 Free (Specific Variants Only)',
          description: `Promotion that applies only to specific variants of products.
  
## Detailed Explanation of Variant-Specific Promotions

### What are Variant-Specific Promotions?
A variant-specific promotion targets only particular variants (specific colors, sizes, styles) of products rather than all variants of a product. For example, a promotion might apply only to "Red" and "Blue" t-shirts, but not to "Green" or "Black" t-shirts of the same model.

### How the applyToAllVariants Flag Works:
- **When applyToAllVariants = true**: The promotion applies to all variants of the specified product(s)
- **When applyToAllVariants = false**: The promotion applies ONLY to the specific variants listed in applicableVariantIds

### Key Implementation Details:
1. When processing cart items, the system checks each item's variantId against the applicableVariantIds list
2. Items are grouped by variant for promotion calculation purposes
3. Each qualifying variant group is treated separately for calculating "sets"
4. The total number of redemptions across all variants is limited by maxRedemptionsPerOrder

### Example Scenarios Explained:

#### Scenario 1: Customer buys qualifying variants only
- Customer cart: 2 Red T-shirts + 2 Blue T-shirts
- Promotion: "Buy 2 Get 1 Free" with applicableVariantIds = [101, 102] (Red and Blue)
- Result:
  * System processes Red T-shirts: 2 items = 1 set → 1 free Red T-shirt
  * System processes Blue T-shirts: 2 items = 1 set → 1 free Blue T-shirt
  * Total: 2 free T-shirts (1 Red, 1 Blue)
- Note: Each variant type is evaluated independently as long as maxRedemptionsPerOrder allows

#### Scenario 2: Customer buys mix of qualifying and non-qualifying variants
- Customer cart: 2 Red T-shirts + 2 Green T-shirts
- Promotion: "Buy 2 Get 1 Free" with applicableVariantIds = [101, 102] (Red and Blue only)
- Result:
  * System processes Red T-shirts: 2 items = 1 set → 1 free Red T-shirt
  * System processes Green T-shirts: These don't qualify at all (not in applicableVariantIds)
  * Total: 1 free T-shirt (Red only)
- Note: Green T-shirts are completely ignored for promotion calculations

#### Scenario 3: maxRedemptionsPerOrder limits total redemptions
- Customer cart: 4 Red T-shirts + 4 Blue T-shirts
- Promotion: "Buy 2 Get 1 Free" with applicableVariantIds = [101, 102] and maxRedemptionsPerOrder = 1
- Result:
  * System determines Red T-shirts qualify for 2 sets → potentially 2 free Red T-shirts
  * System determines Blue T-shirts qualify for 2 sets → potentially 2 free Blue T-shirts
  * However, maxRedemptionsPerOrder = 1 limits the total free items to 1
  * System typically selects the lowest-priced eligible variant for the free item
  * Total: Only 1 free T-shirt (either Red or Blue, whichever is cheaper)
- Note: Without the maxRedemptionsPerOrder limit, the customer would receive 4 free T-shirts

### Common Use Cases:
- Clearing specific color variants that aren't selling well
- Promoting new or seasonal colors while excluding standard colors
- Creating exclusivity by limiting promotions to premium variants
- Pushing customers toward specific variants based on inventory levels

### Cart Processing Logic:
1. Group items by variant ID
2. For each variant in applicableVariantIds:
   a. Calculate qualifying sets based on quantity and buyQuantity
   b. Calculate potential free items based on getQuantity
3. Apply limits based on maxRedemptionsPerOrder across all variants
4. Apply discounts to the lowest-priced eligible items first`,
          value: {
            name: "Selected Colors - Buy 2 Get 1 Free",
            description: "Buy 2 of selected colors, get 1 free! Only applies to Red and Blue variants.",
            type: "bogo_same",
            startDate: "2025-06-01",
            endDate: "2025-08-31",
            shopId: 1,
            bogoRule: {
              buyQuantity: 2,
              getQuantity: 1,
              sameProduct: true,
              discountPercent: 100,
              maxRedemptionsPerOrder: 3,
              applyToAllVariants: false,
              applicableVariantIds: [101, 102],  // Only Red and Blue variants
              applicableProductIds: [1]          // Only applies to Product #1
            }
          }
        }
      }
    }),
    ApiResponse({ 
      status: 201, 
      description: 'Promotion created successfully',
      schema: {
        example: {
          id: 1,
          name: "Buy 2 Get 1 Free",
          description: "Summer sale - buy 2 items, get 1 free!",
          type: "bogo_same",
          status: "enabled",
          startDate: "2025-06-01T00:00:00.000Z",
          endDate: "2025-08-31T23:59:59.000Z",
          shopId: 1,
          shop: {
            id: 1,
            name: "Fashion Shop"
          },
          bogoRule: {
            id: 1,
            buyQuantity: 2,             // Customer must buy 2 items
            getQuantity: 1,             // Customer gets 1 item free
            sameProduct: true,          // The free item must be the same product
            discountPercent: 100,       // 100% discount means completely free
            maxRedemptionsPerOrder: 3,  // This promotion can be used up to 3 times per order
            applicableProducts: [
              { id: 1, name: "Summer T-Shirt" },
              { id: 2, name: "Beach Shorts" },
              { id: 3, name: "Sun Hat" }
            ],
            applicableCategories: [
              { id: 5, name: "Summer Collection" }
            ]
          },
          createdAt: "2025-03-15T10:30:00.000Z",
          updatedAt: "2025-03-15T10:30:00.000Z"
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Bad request - Invalid data' }),
    ApiResponse({ status: 403, description: 'Forbidden - You can only create promotions for your own shops' }),
    ApiResponse({ status: 404, description: 'Not found - Shop or products not found' })
  );
};

export const GetAllPromotionsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Get all promotions',
      description: `List all promotional offers across all shops with pagination.

## Response Fields Explained
- **buyQuantity**: Number of items customer must purchase to qualify
- **getQuantity**: Number of items that will receive the discount
- **discountPercent**: Percentage discount (100% = free, 50% = half-price)
- **sameProduct**: Whether discounted items are the same as purchased items`
    }),
    ApiBearerAuth(),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (starts from 1)'
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Items per page'
    }),
    ApiQuery({
      name: 'sortDirection',
      required: false,
      enum: SortDirection,
      description: 'Sort direction (asc or desc)'
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by (id, name, type, startDate, endDate, createdAt)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Promotions retrieved successfully',
      schema: {
        example: {
          data: [
            {
              id: 1,
              name: "Buy 2 Get 1 Free",
              description: "Summer promotion",
              type: "bogo_same",         // Buy X get Y of same product
              status: "enabled",
              startDate: "2025-06-01T00:00:00.000Z",
              endDate: "2025-08-31T23:59:59.000Z",
              shopId: 5,
              shop: {
                id: 5,
                name: "Fashion Store"
              },
              bogoRule: {
                buyQuantity: 2,          // Customer must buy 2 items
                getQuantity: 1,          // Customer gets 1 item free
                discountPercent: 100,    // 100% discount (free)
                sameProduct: true        // Free item is same product
              },
              createdAt: "2025-03-01T10:30:00.000Z",
              updatedAt: "2025-03-01T10:30:00.000Z"
            },
            {
              id: 2,
              name: "Buy 3 Get 1 Half Price",
              description: "Spring collection deal",
              type: "buy_x_get_y_discount",  // Buy X get Y at discount
              status: "enabled",
              startDate: "2025-04-01T00:00:00.000Z",
              endDate: "2025-05-31T23:59:59.000Z",
              shopId: 3,
              shop: {
                id: 3,
                name: "Home Goods"
              },
              bogoRule: {
                buyQuantity: 3,          // Customer must buy 3 items
                getQuantity: 1,          // Customer gets discount on 1 item
                discountPercent: 50,     // 50% discount (half price)
                sameProduct: true        // Discounted item is same product
              },
              createdAt: "2025-03-10T14:15:00.000Z",
              updatedAt: "2025-03-10T14:15:00.000Z"
            }
          ],
          meta: {
            totalItems: 25,
            itemsPerPage: 10,
            currentPage: 1,
            totalPages: 3,
            hasNextPage: true,
            hasPreviousPage: false,
            sortBy: "createdAt",
            sortDirection: "desc"
          }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  );
};

export const GetShopPromotionsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get shop promotions',
      description: `Get all promotions for a specific shop. This endpoint is public and can be used to show active promotions to customers.
      
## Promotion Types Explained
- **bogo_same**: "Buy One Get One" where customer buys X items, gets Y of the same items free/discounted
- **bogo_different**: Customer buys specific products, gets different product free/discounted
- **buy_x_get_y_discount**: Customer buys X items, gets Y items at a percentage discount

## Response Fields Explained
- **applicableProducts**: List of products this promotion applies to
- **applicableCategories**: List of categories this promotion applies to
- **freeProduct**: For bogo_different, the specific product given as reward
- **discountPercent**: Percentage off (100% = free, 50% = half price)`
    }),
    ApiParam({
      name: 'shopId',
      required: true,
      type: Number,
      description: 'Shop ID'
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (starts from 1)'
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Items per page'
    }),
    ApiQuery({
      name: 'sortDirection',
      required: false,
      enum: SortDirection,
      description: 'Sort direction (asc or desc)'
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by (id, name, type, startDate, endDate, createdAt)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Shop promotions retrieved successfully',
      schema: {
        example: {
          data: [
            {
              id: 1,
              name: "Buy 2 Get 1 Free",
              type: "bogo_same",           // Buy X get Y of same product free
              status: "enabled",
              startDate: "2025-06-01T00:00:00.000Z",
              endDate: "2025-08-31T23:59:59.000Z",
              description: "Summer special offer!",
              bogoRule: {
                buyQuantity: 2,            // Customer must buy 2 items
                getQuantity: 1,            // Customer gets 1 item free
                discountPercent: 100,      // 100% discount (completely free)
                applicableProducts: [      // This promotion applies to these products:
                  { id: 101, name: "Summer T-Shirt" },
                  { id: 102, name: "Beach Shorts" }
                ],
                applicableCategories: [    // And to all products in this category:
                  { id: 5, name: "Summer Collection" }
                ]
              }
            },
            {
              id: 2,
              name: "Buy From Jeans, Get Free Shirt",
              type: "bogo_different",      // Buy X get a different product
              status: "enabled",
              startDate: "2025-05-01T00:00:00.000Z",
              endDate: "2025-07-15T23:59:59.000Z",
              description: "Perfect match promotion",
              bogoRule: {
                buyQuantity: 1,           // Customer must buy 1 item
                getQuantity: 1,           // Customer gets 1 free item
                discountPercent: 100,     // 100% discount (completely free)
                sameProduct: false,       // Free item is different from purchased items
                freeProductId: 205,       // The specific product that will be free
                freeProduct: {            // Details about the free product
                  id: 205,
                  name: "Classic White Shirt"
                },
                applicableCategories: [   // Promotion applies when buying from this category
                  { id: 8, name: "Jeans & Pants" }
                ]
              }
            }
          ],
          meta: {
            totalItems: 8,
            itemsPerPage: 10,
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false
          }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Shop not found' })
  );
};

export const GetOnePromotionSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get promotion details',
      description: `Get detailed information about a specific promotion including applicable products and categories.
      
## Field Explanations
- **maxRedemptionsPerOrder**: Maximum number of times promotion can apply in one order (e.g., max 3 free items). This is a crucial setting that controls how many times the discount can be claimed in a single purchase.

  ### Examples with Different Product Variants
  For a "Buy 2 Get 1 Free" promotion with maxRedemptionsPerOrder=3:
  
  #### Example 1: Single Product Type, Multiple Variants
  - Customer buys 8 t-shirts (same product, different variants like colors/sizes)
    * 2 Red Small + 2 Blue Medium + 2 Black Large + 2 White XL
    * Gets 3 free t-shirts (not 4) due to maxRedemptionsPerOrder=3
    * System typically selects the cheapest 3 variants for the free items
  
  #### Example 2: Multiple Products in Same Category
  - Customer buys various items from the "Summer Collection" category:
    * 2 T-shirts + 2 Shorts + 2 Tank tops + 2 Hats = 8 items total
    * Gets 3 free items (not 4) due to maxRedemptionsPerOrder=3
    * Free items would be the 3 cheapest items from their purchase
  
  #### Example 3: Buy X Get Different Product
  - For a "Buy 1 Jeans, Get 1 Shirt Free" with maxRedemptionsPerOrder=2:
    * Customer buys 5 pairs of jeans (different styles/sizes)
    * Customer gets only 2 free shirts (not 5) due to maxRedemptionsPerOrder=2
    
  #### Example 4: Variant-Specific Promotion with applyToAllVariants=false
  - If a promotion applies only to specific variants with applyToAllVariants=false:
    * Promotion might apply only to "Red" and "Blue" t-shirt variants
    * Customer buys 2 Red shirts, 2 Blue shirts, 2 Green shirts, 2 Black shirts
    * Only the Red and Blue shirts qualify for the promotion
    * Customer gets 1 Red shirt free and 1 Blue shirt free (cheapest of each variant)
    * The Green and Black shirts don't qualify for any discount
  
  #### Example 5: Size-Based Variants
  - For a promotion on t-shirts available in S, M, L, XL sizes:
    * Customer buys 2 t-shirts size S, 2 size M, 2 size L, 2 size XL
    * With applyToAllVariants=true: All count as the same product
      - Customer gets 3 free t-shirts (due to maxRedemptionsPerOrder=3)
    * With applyToAllVariants=false and only M,L specified:
      - Only M and L sizes qualify
      - Customer gets 1 size M and 1 size L free
  
  #### Example 6: Color and Size Matrix
  - For a product with both color and size variants (3 colors × 4 sizes = 12 variants):
    * With applyToAllVariants=true: All 12 variants are treated as the same product
    * With applyToAllVariants=false: Only the explicitly specified variants qualify
    * For example, if only "Red-M" and "Blue-L" variants are included in promotion:
      - Customer must buy those exact variants to qualify
      - "Red-L" or "Blue-M" would not qualify

  ### Technical Implementation 
  - When calculating discounts, the system:
    1. Groups eligible items by product/variant
    2. Calculates how many "sets" qualify for promotion (e.g., how many sets of 2 items)
    3. Limits the total redemptions to maxRedemptionsPerOrder
    4. Typically applies discounts to the lowest-priced eligible items
  
  ### Business Purpose
  - Prevents excessive discounting on large orders
  - Controls the financial impact of the promotion
  - Encourages purchases while maintaining profit margins
  - Can be set to different values based on promotion goals:
    - Lower values (1-2): More conservative approach
    - Higher values (3-5): More generous for customers
    - Unlimited (null): No upper limit on discounts in a single order

- **applyToAllVariants**: Whether promotion applies to all variants of a product
  * When true: All variants of eligible products qualify for the promotion
  * When false: Only specific variants that are explicitly included qualify
  * Example: If true, all colors and sizes of t-shirts qualify; if false, only specific combinations qualify
  
- **sameProduct**: Whether the discounted items must be the same as the items purchased
- **discountPercent**: Percentage discount applied (100% = free, 50% = half price)`
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: Number,
      description: 'Promotion ID'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Promotion found',
      schema: {
        example: {
          id: 1,
          name: "Buy 2 Get 1 Free",
          description: "Summer promotion",
          type: "bogo_same",
          status: "enabled",
          startDate: "2025-06-01T00:00:00.000Z",
          endDate: "2025-08-31T23:59:59.000Z",
          shopId: 5,
          shop: {
            id: 5,
            name: "Fashion Store",
            logoUrl: "https://example.com/shops/fashion-store/logo.png"
          },
          bogoRule: {
            id: 1,
            buyQuantity: 2,                // Customer must buy 2 items
            getQuantity: 1,                // Customer gets 1 item free
            discountPercent: 100,          // 100% discount (completely free)
            sameProduct: true,             // Free item must be same as purchased
            maxRedemptionsPerOrder: 3,     // Limit of 3 free items per order
            applyToAllVariants: true,      // All product variants are eligible
            applicableProducts: [          // Promotion applies to these products:
              {
                id: 7,
                name: "Cotton T-Shirt",
                basePrice: 19.99,
                images: [
                  { url: "https://example.com/products/tshirt.jpg", imageType: "main" }
                ]
              },
              {
                id: 8,
                name: "Jeans",
                basePrice: 49.99,
                images: [
                  { url: "https://example.com/products/jeans.jpg", imageType: "main" }
                ]
              }
            ],
            applicableCategories: [        // And to all products in these categories:
              { id: 3, name: "Apparel" },
              { id: 4, name: "Summer Collection" }
            ]
          },
          createdAt: "2025-02-15T10:30:00.000Z",
          updatedAt: "2025-02-15T10:30:00.000Z"
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Promotion not found' })
  );
};

export const UpdatePromotionSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Update a promotion',
      description: 'Update an existing promotion. Vendors can only update their own promotions.'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      required: true,
      type: Number,
      description: 'Promotion ID'
    }),
    ApiBody({
      type: UpdatePromotionDto,
      examples: {
        'Update Basic Info': {
          summary: 'Update basic promotion info',
          description: 'Update name, description, and dates',
          value: {
            name: "Updated Promotion Name",
            description: "New description text",
            startDate: "2025-07-01",
            endDate: "2025-09-30"
          }
        },
        'Update BOGO Rule': {
          summary: 'Update BOGO rule details',
          description: 'Change the quantities and discount',
          value: {
            bogoRule: {
              buyQuantity: 3,
              getQuantity: 2,
              discountPercent: 50,
              maxRedemptionsPerOrder: 2
            }
          }
        },
        'Update Applicable Products': {
          summary: 'Change which products the promotion applies to',
          description: 'Replace the list of applicable products',
          value: {
            bogoRule: {
              applicableProductIds: [5, 6, 7, 8],
              applicableCategoryIds: []
            }
          }
        },
        'Change to Different Product': {
          summary: 'Change from same-product to different-product promotion',
          description: 'Switch to giving a specific product as the reward',
          value: {
            type: "bogo_different",
            bogoRule: {
              sameProduct: false,
              freeProductId: 42
            }
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Promotion updated successfully',
      schema: {
        example: {
          id: 1,
          name: "Updated Promotion Name",
          description: "New description text",
          type: "bogo_same",
          status: "enabled",
          startDate: "2025-07-01T00:00:00.000Z",
          endDate: "2025-09-30T23:59:59.000Z",
          shopId: 5,
          // Rest of response similar to Get One response
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Not allowed or not your promotion' }),
    ApiResponse({ status: 404, description: 'Promotion not found' }),
    ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  );
};

export const EnablePromotionSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Enable a promotion',
      description: 'Enable a disabled promotion. Vendors can only enable their own promotions.'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      required: true,
      type: Number,
      description: 'Promotion ID'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Promotion enabled successfully',
      schema: {
        example: {
          id: 1,
          name: "Buy 2 Get 1 Free",
          status: "enabled",
          // Other promotion details...
          updatedAt: "2025-03-20T14:30:00.000Z"
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Not allowed or not your promotion' }),
    ApiResponse({ status: 404, description: 'Promotion not found' })
  );
};

export const DisablePromotionSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Disable a promotion',
      description: 'Disable an enabled promotion. Vendors can only disable their own promotions.'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      required: true,
      type: Number,
      description: 'Promotion ID'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Promotion disabled successfully',
      schema: {
        example: {
          id: 1,
          name: "Buy 2 Get 1 Free",
          status: "disabled",
          // Other promotion details...
          updatedAt: "2025-03-20T14:30:00.000Z"
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Not allowed or not your promotion' }),
    ApiResponse({ status: 404, description: 'Promotion not found' })
  );
};

export const DeletePromotionSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Delete a promotion',
      description: 'Permanently delete an existing promotion. Vendors can only delete their own promotions.'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      required: true,
      type: Number,
      description: 'Promotion ID'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Promotion deleted successfully',
      schema: {
        example: {
          message: "Promotion deleted successfully"
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Not allowed or not your promotion' }),
    ApiResponse({ status: 404, description: 'Promotion not found' })
  );
};

export const GetActiveProductPromotionsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get promotions for product',
      description: `Get all active promotions applicable to a specific product. 
      
This endpoint returns simplified promotion details that are relevant for displaying to customers.

## Field Explanations
- **type**: The promotion type (bogo_same, bogo_different, buy_x_get_y_discount)  
- **buyQuantity**: How many items customer must buy to qualify
- **getQuantity**: How many items receive the discount
- **discountPercent**: Percentage discount (100% = free, 50% = half price)`
    }),
    ApiParam({
      name: 'productId',
      required: true,
      type: Number,
      description: 'Product ID'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Product promotions retrieved successfully',
      schema: {
        example: {
          productId: 101,
          promotions: [
            {
              id: 1,
              name: "Buy 2 Get 1 Free",
              type: "bogo_same",              // Buy X get Y of same product free
              description: "Buy 2 of this product, get 1 free!",
              buyQuantity: 2,                 // Must buy 2 items
              getQuantity: 1,                 // Get 1 item free
              discountPercent: 100            // 100% discount (completely free)
            },
            {
              id: 3,
              name: "Buy 3 Get 1 Half Price",
              type: "buy_x_get_y_discount",   // Buy X get Y at discount
              description: "Buy 3, get another at 50% off!",
              buyQuantity: 3,                 // Must buy 3 items
              getQuantity: 1,                 // Get discount on 1 item
              discountPercent: 50             // 50% discount (half price)
            }
          ]
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Product not found' })
  );
};