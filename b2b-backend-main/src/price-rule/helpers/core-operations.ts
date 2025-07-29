import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePriceRuleDto } from '../dto/create-price-rule.dto';
import { UpdatePriceRuleDto } from '../dto/update-price-rule.dto';
import { Prisma } from '@prisma/client';

/**
 * Create a new price rule
 * @param prisma The Prisma service instance
 * @param createPriceRuleDto The data to create the price rule
 * @param creatorId ID of the creator (admin ID or user ID)
 * @param creatorType Type of creator ('admin' or 'user')
 * @param vendorId Optional vendor ID
 * @returns Created price rule
 */
export async function create(
  prisma: PrismaService, 
  createPriceRuleDto: CreatePriceRuleDto,
  creatorId: number,
  creatorType: string,
  vendorId?: number
) {
  try {
    // Add debug logs
    console.log('Creating price rule with parameters:');
    console.log('DTO:', JSON.stringify(createPriceRuleDto, null, 2));
    console.log('creatorId:', creatorId);
    console.log('creatorType:', creatorType);
    console.log('vendorId:', vendorId);
    
    // Validate date range if provided
    if (createPriceRuleDto.startDate && createPriceRuleDto.endDate) {
      if (new Date(createPriceRuleDto.startDate) > new Date(createPriceRuleDto.endDate)) {
        throw new BadRequestException('Start date must be before end date');
      }
    }
    
    // SECURITY CHECK: Handle vendor rule creation
    if (creatorType === 'user') {
      // Find this vendor's information
      const vendor = await prisma.vendor.findFirst({
        where: { userId: creatorId },
        select: { id: true }
      });
      
      if (!vendor) {
        throw new ForbiddenException('You must have a vendor profile to create price rules');
      }

      // If no vendorId was provided but the creator is a vendor, use their vendor ID
      if (!vendorId) {
        vendorId = vendor.id;
      }
      
      // If specific products/variants are provided, validate ownership
      if (createPriceRuleDto.productIds && createPriceRuleDto.productIds.length > 0) {
        const ownedProducts = await prisma.product.findMany({
          where: {
            id: { in: createPriceRuleDto.productIds },
            shop: {
              vendorId: vendor.id
            }
          },
          select: { id: true }
        });
        
        const ownedProductIds = ownedProducts.map(p => p.id);
        const unauthorizedProducts = createPriceRuleDto.productIds.filter(id => 
          !ownedProductIds.includes(id)
        );
        
        if (unauthorizedProducts.length > 0) {
          throw new ForbiddenException(
            `You don't have permission to create rules for products with IDs: ${unauthorizedProducts.join(', ')}`
          );
        }
      }
      
      if (createPriceRuleDto.variantIds && createPriceRuleDto.variantIds.length > 0) {
        const ownedVariants = await prisma.productVariant.findMany({
          where: {
            id: { in: createPriceRuleDto.variantIds },
            product: {
              shop: {
                vendorId: vendor.id
              }
            }
          },
          select: { id: true }
        });
        
        const ownedVariantIds = ownedVariants.map(v => v.id);
        const unauthorizedVariants = createPriceRuleDto.variantIds.filter(id => 
          !ownedVariantIds.includes(id)
        );
        
        if (unauthorizedVariants.length > 0) {
          throw new ForbiddenException(
            `You don't have permission to create rules for variants with IDs: ${unauthorizedVariants.join(', ')}`
          );
        }
      }

      // Validate shop ownership if shopIds are specified
      if (createPriceRuleDto.shopIds && createPriceRuleDto.shopIds.length > 0) {
        const ownedShops = await prisma.shop.findMany({
          where: {
            id: { in: createPriceRuleDto.shopIds },
            vendorId: vendor.id
          },
          select: { id: true }
        });
        
        const ownedShopIds = ownedShops.map(shop => shop.id);
        const unauthorizedShops = createPriceRuleDto.shopIds.filter(id => 
          !ownedShopIds.includes(id)
        );
        
        if (unauthorizedShops.length > 0) {
          throw new ForbiddenException(
            `You don't have permission to create rules for shops with IDs: ${unauthorizedShops.join(', ')}`
          );
        }
      }
    }

    // If we reach this point, validation has passed
    return await prisma.priceRule.create({
      data: {
        name: createPriceRuleDto.name,
        type: createPriceRuleDto.type,
        value: new Prisma.Decimal(createPriceRuleDto.value),
        minQuantity: createPriceRuleDto.minQuantity,
        maxQuantity: createPriceRuleDto.maxQuantity,
        startDate: createPriceRuleDto.startDate,
        endDate: createPriceRuleDto.endDate,
        status: 'enabled',
        
        // Ensure these are properly included as properties with values
        creatorId, // This is the key fix - make sure creatorId is passed as a value, not a type
        creatorType,
        
        // Relationships
        vendor: vendorId ? {
          connect: { id: vendorId }
        } : undefined,
        vendorGroup: createPriceRuleDto.vendorGroupId ? {
          connect: { id: createPriceRuleDto.vendorGroupId }
        } : undefined,
        products: createPriceRuleDto.productIds ? {
          connect: createPriceRuleDto.productIds.map(id => ({ id }))
        } : undefined,
        variants: createPriceRuleDto.variantIds ? {
          connect: createPriceRuleDto.variantIds.map(id => ({ id }))
        } : undefined,
        shops: createPriceRuleDto.shopIds ? {
          connect: createPriceRuleDto.shopIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        vendorGroup: true,
        vendor: true,
        products: {
          include: {
            shop: true
          }
        },
        variants: {
          include: {
            attributeValues: {
              include: {
                attribute: true
              }
            }
          }
        },
        shops: true
      }
    });
  } catch (error) {
    // Add error logging
    console.error('Error in price rule creation:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Price rule name must be unique');
      }
      if (error.code === 'P2025') {
        throw new BadRequestException('Invalid vendor group or product IDs');
      }
    }
    throw error;
  }
}

/**
 * Find a price rule by ID
 * @param prisma The Prisma service instance
 * @param id The price rule ID
 * @returns Found price rule
 * @throws NotFoundException if price rule not found
 */
export async function findOne(prisma: PrismaService, id: number) {
  const priceRule = await prisma.priceRule.findUnique({
    where: { id },
    include: {
      vendorGroup: true,
      products: {
        include: {
          shop: true
        }
      },
      variants: {
        include: {
          attributeValues: {
            include: {
              attribute: true
            }
          },
          product: true
        }
      }
    }
  });

  if (!priceRule) {
    throw new NotFoundException(`Price rule with ID ${id} not found`);
  }

  return priceRule;
}

/**
 * Update an existing price rule
 * @param prisma The Prisma service instance
 * @param id The price rule ID
 * @param updatePriceRuleDto The update data
 * @param currentUserId ID of the user making the update
 * @param currentUserType Type of user ('admin' or 'user')
 * @param currentUserRole Role of the user (optional for additional permissions)
 * @param newVendorId Optional new vendor ID
 * @returns Updated price rule
 */
export async function update(
  prisma: PrismaService, 
  id: number, 
  updatePriceRuleDto: UpdatePriceRuleDto,
  currentUserId: number,
  currentUserType: string,
  currentUserRole?: string,
  newVendorId?: number
) {
  try {
    // First verify the price rule exists
    const existingRule = await findOne(prisma, id);
    
    // Check permissions - allow admin, creator, or associated vendor
    const isAdmin = currentUserType === 'admin' || (currentUserRole && ['admin', 'superadmin'].includes(currentUserRole));
    const isOwner = currentUserType === existingRule.creatorType && currentUserId === existingRule.creatorId;
    
    // NEW: Allow vendors to update rules associated with their vendor ID
    let isAssociatedVendor = false;
    if (currentUserType === 'user' && currentUserRole === 'vendor') {
      // Get vendor ID for this user
      const vendor = await prisma.vendor.findFirst({
        where: { userId: currentUserId },
        select: { id: true }
      });
      
      if (vendor && existingRule.vendorId === vendor.id) {
        isAssociatedVendor = true;
      }
    }
    
    
    if (!isAdmin && !isOwner && !isAssociatedVendor) {
      throw new ForbiddenException('You do not have permission to update this price rule');
    }

    // Validate date range if provided
    if (updatePriceRuleDto.startDate && updatePriceRuleDto.endDate) {
      if (new Date(updatePriceRuleDto.startDate) > new Date(updatePriceRuleDto.endDate)) {
        throw new BadRequestException('Start date must be before end date');
      }
    }
    
    // SECURITY CHECK: If user is a vendor (not admin), verify they own the shops
    if (currentUserType === 'user' && currentUserRole === 'vendor' && !isAdmin) {
      // Perform ownership verification checks...
      
      // Verify shop ownership
      if (updatePriceRuleDto.shopIds && updatePriceRuleDto.shopIds.length > 0) {
        const vendor = await prisma.vendor.findFirst({
          where: { userId: currentUserId }
        });
        
        if (!vendor) {
          throw new ForbiddenException('Vendor profile not found');
        }
        
        const ownedShops = await prisma.shop.findMany({
          where: {
            id: { in: updatePriceRuleDto.shopIds },
            vendorId: vendor.id
          },
          select: { id: true }
        });
        
        const ownedShopIds = ownedShops.map(s => s.id);
        const unauthorizedShops = updatePriceRuleDto.shopIds.filter(id => 
          !ownedShopIds.includes(id)
        );
        
        if (unauthorizedShops.length > 0) {
          throw new ForbiddenException(
            `You don't have permission to create rules for shops with IDs: ${unauthorizedShops.join(', ')}`
          );
        }
      }
    }

    // Check for shop ownership if shopIds are specified for vendors
    if (currentUserType === 'user' && updatePriceRuleDto.shopIds && updatePriceRuleDto.shopIds.length > 0) {
      const vendor = await prisma.vendor.findFirst({
        where: { userId: currentUserId }
      });
      
      // Add null check for vendor
      if (!vendor) {
        throw new ForbiddenException('Vendor profile not found');
      }
      
      const ownedShops = await prisma.shop.findMany({
        where: {
          id: { in: updatePriceRuleDto.shopIds },
          vendorId: vendor.id // Now TypeScript knows vendor is not null
        },
        select: { id: true }
      });
      
      // Verify all shops belong to this vendor
      if (ownedShops.length !== updatePriceRuleDto.shopIds.length) {
        throw new ForbiddenException('You can only assign rules to shops you own');
      }
    }

    // Prepare update data object, carefully handling each field
    const updateData = {
      // Only include fields that are explicitly provided (not undefined)
      ...(updatePriceRuleDto.name !== undefined && { name: updatePriceRuleDto.name }),
      ...(updatePriceRuleDto.type !== undefined && { type: updatePriceRuleDto.type }),
      // Handle decimal values properly - convert number to Prisma.Decimal only if provided
      ...(updatePriceRuleDto.value !== undefined && { 
        value: new Prisma.Decimal(updatePriceRuleDto.value) 
      }),
      ...(updatePriceRuleDto.minQuantity !== undefined && { minQuantity: updatePriceRuleDto.minQuantity }),
      ...(updatePriceRuleDto.maxQuantity !== undefined && { maxQuantity: updatePriceRuleDto.maxQuantity }),
      ...(updatePriceRuleDto.startDate !== undefined && { startDate: updatePriceRuleDto.startDate }),
      ...(updatePriceRuleDto.endDate !== undefined && { endDate: updatePriceRuleDto.endDate }),
      ...(updatePriceRuleDto.status !== undefined && { status: updatePriceRuleDto.status }),
      // Handle relationships
      ...(newVendorId && { 
        vendor: {
          connect: { id: newVendorId }
        }
      }),
      ...(updatePriceRuleDto.vendorGroupId !== undefined && {
        vendorGroup: updatePriceRuleDto.vendorGroupId ? {
          connect: { id: updatePriceRuleDto.vendorGroupId }
        } : {
          disconnect: true
        }
      }),
      // Handle product and variant relationships
      ...(updatePriceRuleDto.productIds !== undefined && {
        products: {
          set: updatePriceRuleDto.productIds.map(id => ({ id }))
        }
      }),
      ...(updatePriceRuleDto.variantIds !== undefined && {
        variants: {
          set: updatePriceRuleDto.variantIds.map(id => ({ id }))
        }
      }),
      // Add shop connections if specified
      shops: updatePriceRuleDto.shopIds ? {
        set: updatePriceRuleDto.shopIds.map(id => ({ id }))
      } : undefined,
    };

    return await prisma.priceRule.update({
      where: { id },
      data: updateData,
      include: {
        vendorGroup: true,
        products: {
          include: {
            shop: true
          }
        },
        variants: {
          include: {
            attributeValues: {
              include: {
                attribute: true
              }
            },
            product: true
          }
        }
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new BadRequestException('Invalid vendor group or product IDs');
      }
    }
    
    // Enhanced error logging for debugging
    console.error('Price rule update error:', error);
    throw error;
  }
}