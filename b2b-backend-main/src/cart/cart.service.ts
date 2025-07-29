import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import { ProductVariantService } from '../product/product-variant.service';
import { PriceRuleService } from '../price-rule/price-rule.service';
import { CouponService } from '../coupon/coupon.service';
import { Prisma } from '@prisma/client'; // Add this import for Prisma types

// Import all helpers using namespace pattern
import * as CartCore from './helpers/cart-core-operations';
import * as CartItems from './helpers/cart-item-operations';
import * as CartCoupons from './helpers/cart-coupon-operations';
import * as CartPricing from './helpers/cart-pricing';
import * as OrderTransaction from '../order/helpers/order-transaction';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
    private productVariantService: ProductVariantService,
    private priceRuleService: PriceRuleService,
    private couponService: CouponService
  ) {}

  /**
   * Get or create the cart for the current user
   */
  async getOrCreateCart(userId: number) {
    const cart = await CartCore.getOrCreateCart(this.prisma, userId);
    
    // Apply price rules and calculate totals
    return await CartPricing.calculateCartTotals(
      this.prisma,
      this.priceRuleService,
      this.couponService,
      cart
    );
  }

  /**
   * Get the current cart for the user
   */
  async getCurrentCart(userId: number) {
    const cart = await CartCore.getCurrentCart(this.prisma, userId);
    
    // Apply price rules and calculate totals
    return await CartPricing.calculateCartTotals(
      this.prisma,
      this.priceRuleService,
      this.couponService,
      cart
    );
  }

  /**
   * Clear all items from the cart
   */
  async clearCart(userId: number) {
    await CartCore.clearCart(this.prisma, userId);
    return this.getCurrentCart(userId);
  }

  /**
   * Get the current cart ID or create a new cart
   */
  async getCurrentCartId(userId: number): Promise<number> {
    return CartCore.getCurrentCartId(this.prisma, userId);
  }

  /**
   * Add a new item to cart
   */
  async addItemToCart(userId: number, createCartItemDto: CreateCartItemDto) {
    const cartId = await CartCore.getCurrentCartId(this.prisma, userId);
    
    // Get product details for price calculation
    const product = await this.prisma.product.findUnique({
      where: { id: createCartItemDto.productId },
      include: {
        priceRules: true,
        shop: {
          include: {
            vendor: {
              include: {
                groups: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Handle variant if specified
    let variant: any = null;
    if (createCartItemDto.variantId) {
      variant = await this.prisma.productVariant.findUnique({
        where: { id: createCartItemDto.variantId },
        include: {
          priceRules: true
        }
      });
      
      if (!variant) {
        throw new NotFoundException('Product variant not found');
      }
      
      if (variant.productId !== createCartItemDto.productId) {
        throw new BadRequestException('Variant does not belong to the specified product');
      }
    }
    
    await CartItems.addItemToCart(
      this.prisma,
      this.inventoryService,
      userId,
      cartId,
      createCartItemDto
    );
    
    // Return the updated cart with totals calculated
    return this.getCurrentCart(userId);
  }

  /**
   * Update an existing cart item
   */
  async updateCartItem(userId: number, itemId: number, updateCartItemDto: UpdateCartItemDto) {
    const cart = await CartCore.getCurrentCart(this.prisma, userId);
    
    // Check stock availability
    if (updateCartItemDto.quantity) {
      const hasStock = await CartItems.checkCartItemStock(
        this.prisma,
        this.inventoryService,
        itemId,
        updateCartItemDto.quantity
      );

      if (!hasStock) {
        throw new BadRequestException('Insufficient stock');
      }
    }
    
    await CartItems.updateCartItem(
      this.prisma,
      itemId,
      updateCartItemDto,
      cart.id
    );
    
    return this.getCurrentCart(userId);
  }

  /**
   * Remove an item from the cart
   */
  async removeCartItem(userId: number, itemId: number) {
    const cart = await CartCore.getCurrentCart(this.prisma, userId);
    
    await CartItems.removeCartItem(
      this.prisma,
      itemId,
      cart.id
    );
    
    return this.getCurrentCart(userId);
  }

  /**
   * Apply a coupon to a cart
   */
  async applyCouponToCart(cartId: number, userId: number, code: string) {
    return CartCoupons.applyCouponToCart(
      this.prisma, 
      this.couponService,
      cartId, 
      userId, 
      code
    );
  }

  /**
   * Remove a coupon from a cart
   */
  async removeCouponFromCart(cartId: number, userId: number) {
    return CartCoupons.removeCouponFromCart(
      this.prisma,
      cartId, 
      userId
    );
  }

  /**
   * Checkout cart and create order with integrated payment
   */
  async checkoutCart(userId: number, cartId: number, checkoutData: CheckoutCartDto) {
    // Verify cart ownership using helper
    await CartCore.verifyCartOwnership(this.prisma, cartId, userId);
    
    // Verify that the address exists and belongs to the user
    const address = await this.prisma.userAddress.findFirst({
      where: { 
        id: checkoutData.addressId,
        userId: userId
      },
      include: {
        city: {
          select: {
            id: true,
            name: true,
          },
        },
      }
    });
    
    if (!address) {
      throw new NotFoundException('Address not found or does not belong to you');
    }
    
    // Get the cart with items for validation
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: {
              include: {
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
        },
        user: {
          include: {
            vendor: {
              include: {
                groups: true
              }
            }
          }
        }
      }
    }) as any; // Type assertion is still needed

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Verify checkout data - items must belong to the specified shop
    const shopId = checkoutData.shopId;
    if (shopId === undefined) {
      throw new BadRequestException('Shop ID is required');
    }
    
    const shopItems = cart.items.filter((item: any) => item.product.shopId === shopId);
    
    if (shopItems.length === 0) {
      throw new BadRequestException(`No items from shop with ID ${shopId} in cart`);
    }

    // Apply price rules to shop items before checkout to ensure discounts are applied
    for (const item of shopItems) {
      // Update the base price if variant has its own price
      if (item.variant && item.variant.price !== null && item.variant.price !== undefined) {
        item.basePrice = Number(item.variant.price);
      }

      // Calculate pricing based on rules - include user's vendor groups if available
      const userVendorGroups = cart.user?.vendor?.groups?.map((vg: any) => vg.id) || [];
      
      const { finalPrice, appliedRuleId } = await CartPricing.calculateProductPrice(
        this.priceRuleService,
        item.product,
        item.variant,
        item.quantity,
        userVendorGroups
      );

      item.finalPrice = finalPrice;
      item.appliedRuleId = appliedRuleId;
      item.appliedRuleIds = appliedRuleId ? [appliedRuleId] : [];
    }

    // If there's a coupon applied, verify it's still valid
    let couponDiscount = 0; // Initialize with default value
    if (cart.appliedCouponCode) {
      const couponResult = await this.couponService.verifyCouponValidityForOrder(
        cart,
        shopId
      );

      if (!couponResult.valid) {
        throw new BadRequestException(`Coupon issue: ${couponResult.message}`);
      }
      
      couponDiscount = couponResult.couponDiscount || 0; // Ensure it's always a number
    }
    
    // Log cart shop items before transaction
    console.log("Cart shop items BEFORE transaction:", JSON.stringify(shopItems.map(item => ({
      id: item.id,
      finalPrice: item.finalPrice,
      appliedRuleIds: item.appliedRuleIds,
      appliedRuleId: item.appliedRuleId
    }))));

    // Calculate order totals
    const { subtotal, totalAmount } = OrderTransaction.calculateOrderTotals(
      shopItems, 
      couponDiscount
    );
    
    // Process the order with integrated payment
    const order = await OrderTransaction.executeOrderTransaction(
      this.prisma,
      userId,
      shopId,
      shopItems,
      cart,
      subtotal,
      couponDiscount,
      totalAmount,
      this.productVariantService,
      this.inventoryService,
      this.couponService,
      checkoutData.paymentMethod,
      checkoutData.transactionId,
      checkoutData.notes,
      address // Pass the address to the transaction
    );
    
    // Return order details with shipping address
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      total: order.totalAmount,
      paidAmount: order.paidAmount,
      shopId: checkoutData.shopId,
      orderNotes: checkoutData.notes || null,
      paymentMethod: checkoutData.paymentMethod,
      shippingAddress: {
        id: address.id,
        street: address.street,
        city: address.city.name,
        notes: address.notes || null
      }
    };
  }
}