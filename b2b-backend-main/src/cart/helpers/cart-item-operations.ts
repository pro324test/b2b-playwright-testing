import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCartItemDto } from '../dto/create-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { InventoryService } from '../../inventory/inventory.service';

/**
 * Add a new item to a cart
 */
export async function addItemToCart(
  prisma: PrismaService,
  inventoryService: InventoryService,
  userId: number,
  cartId: number,
  createCartItemDto: CreateCartItemDto
) {
  // Validate product existence
  const product = await prisma.product.findUnique({
    where: { id: createCartItemDto.productId },
    include: {
      variants: { take: 1 }, // Just check if variants exist, no need to get all
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
  
  // Check if product has variants - if yes, require variantId
  if (product.variants && product.variants.length > 0 && !createCartItemDto.variantId) {
    throw new BadRequestException('This product has variants. Please select a specific variant.');
  }

  // Check if a variant is specified
  let hasStock = false;
  let variant: any = null;
  let basePrice = product.basePrice;
  
  if (createCartItemDto.variantId) {
    // Check variant existence and stock
    const foundVariant = await prisma.productVariant.findUnique({
      where: { id: createCartItemDto.variantId },
      include: {
        priceRules: true
      }
    });
    
    if (!foundVariant) {
      throw new NotFoundException('Product variant not found');
    }
    
    variant = foundVariant;
    
    if (variant.productId !== createCartItemDto.productId) {
      throw new BadRequestException('Variant does not belong to the specified product');
    }
    
    // Use variant price if available, otherwise use product's base price
    if (variant.price !== null && variant.price !== undefined) {
      basePrice = variant.price;
    }
    
    hasStock = variant.quantity >= createCartItemDto.quantity;
  } else {
    // Fall back to product-level inventory (only for products without variants)
    hasStock = await inventoryService.checkStock(
      createCartItemDto.productId,
      createCartItemDto.quantity
    );
  }

  if (!hasStock) {
    throw new BadRequestException('Insufficient stock');
  }

  // Check if product/variant is already in cart
  const existingItemQuery: any = {
    cartId,
    productId: createCartItemDto.productId
  };
  
  // Add variant to the query if specified
  if (createCartItemDto.variantId) {
    existingItemQuery['variantId'] = createCartItemDto.variantId;
  } else {
    existingItemQuery['variantId'] = null; // Only match items without variant
  }
  
  const existingItem = await prisma.cartItem.findFirst({
    where: existingItemQuery
  });

  if (existingItem) {
    // For variants, check variant stock
    let hasStockForUpdate = false;
    
    if (createCartItemDto.variantId && variant) {
      hasStockForUpdate = variant.quantity >= (existingItem.quantity + createCartItemDto.quantity);
    } else {
      hasStockForUpdate = await inventoryService.checkStock(
        createCartItemDto.productId,
        existingItem.quantity + createCartItemDto.quantity
      );
    }

    if (!hasStockForUpdate) {
      throw new BadRequestException('Insufficient stock for requested quantity');
    }

    return updateCartItem(
      prisma,
      existingItem.id,
      { quantity: existingItem.quantity + createCartItemDto.quantity },
      cartId
    );
  }

  // Create new cart item
  const cartItem = await prisma.cartItem.create({
    data: {
      cartId,
      productId: createCartItemDto.productId,
      variantId: createCartItemDto.variantId || null,
      quantity: createCartItemDto.quantity,
      basePrice,
      finalPrice: basePrice,  // The final price will be calculated later in calculateCartTotals
    },
    include: {
      product: {
        include: {
          images: true,
          shop: true
        }
      },
      variant: createCartItemDto.variantId ? {
        include: {
          attributeValues: {
            include: {
              attribute: true
            }
          }
        }
      } : undefined
    }
  });

  return cartItem;
}

/**
 * Update a cart item
 */
export async function updateCartItem(
  prisma: PrismaService,
  itemId: number,
  updateCartItemDto: UpdateCartItemDto,
  cartId?: number
) {
  // Find the cart item to ensure it exists and belongs to the cart
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      ...(cartId && { cartId })
    }
  });

  if (!cartItem) {
    throw new NotFoundException('Cart item not found');
  }

  if (updateCartItemDto.quantity === undefined) {
    throw new BadRequestException('Quantity is required');
  }

  // Update the cart item
  return prisma.cartItem.update({
    where: { id: itemId },
    data: {
      quantity: updateCartItemDto.quantity
      // Note: finalPrice will be recalculated in calculateCartTotals
    },
    include: {
      product: {
        include: {
          images: true,
          shop: true
        }
      },
      variant: cartItem.variantId ? {
        include: {
          attributeValues: {
            include: {
              attribute: true
            }
          }
        }
      } : undefined
    }
  });
}

/**
 * Remove a cart item
 */
export async function removeCartItem(
  prisma: PrismaService,
  itemId: number,
  cartId?: number
) {
  // Find the cart item to ensure it exists and belongs to the cart
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      ...(cartId && { cartId })
    }
  });

  if (!cartItem) {
    throw new NotFoundException('Cart item not found');
  }

  // Delete the cart item
  return prisma.cartItem.delete({
    where: { id: itemId }
  });
}

/**
 * Check stock availability for a cart item
 */
export async function checkCartItemStock(
  prisma: PrismaService, 
  inventoryService: InventoryService,
  itemId: number, 
  quantity: number
): Promise<boolean> {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId }
  });

  if (!cartItem) {
    throw new NotFoundException('Cart item not found');
  }

  if (cartItem.variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: cartItem.variantId }
    });
    
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }
    
    return variant.quantity >= quantity;
  }
  
  return inventoryService.checkStock(cartItem.productId, quantity);
}