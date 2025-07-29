import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShopAddressDto, UpdateShopAddressDto } from './dto/shop-address.dto';

@Injectable()
export class ShopAddressService {
  constructor(private prisma: PrismaService) {}

  // Create a new shop address
  async create(createShopAddressDto: CreateShopAddressDto, userId: number) {
    // Check if the shop exists and belongs to the vendor
    const shop = await this.prisma.shop.findUnique({
      where: { id: createShopAddressDto.shopId },
      include: { vendor: true },
    });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${createShopAddressDto.shopId} not found`);
    }

    // Check if user is the shop owner
    if (shop.vendor.userId !== userId) {
      throw new ForbiddenException('You do not have permission to manage this shop');
    }

    // Validate that city exists
    const cityExists = await this.prisma.city.findUnique({
      where: { id: createShopAddressDto.cityId },
    });

    if (!cityExists) {
      throw new NotFoundException(`City with ID ${createShopAddressDto.cityId} not found`);
    }

    // Count existing addresses (no limit, but for future reference)
    const addressCount = await this.prisma.shopAddress.count({
      where: { shopId: createShopAddressDto.shopId },
    });

    // If this is the first address or isDefault is true, set it as default
    const isDefault = addressCount === 0 || createShopAddressDto.isDefault;

    // Use transaction to ensure atomicity
    try {
      return await this.prisma.$transaction(async (tx) => {
        // If setting as default, reset other addresses
        if (isDefault) {
          await tx.shopAddress.updateMany({
            where: { 
              shopId: createShopAddressDto.shopId,
              isDefault: true 
            },
            data: { isDefault: false },
          });
        }

        // Create the address
        const address = await tx.shopAddress.create({
          data: {
            shopId: createShopAddressDto.shopId,
            street: createShopAddressDto.street,
            cityId: createShopAddressDto.cityId,
            googleMapsLink: createShopAddressDto.googleMapsLink,
            latitude: createShopAddressDto.latitude,
            longitude: createShopAddressDto.longitude,
            notes: createShopAddressDto.notes,
            isDefault,
          },
          include: {
            city: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return address;
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Another address is already set as default for this shop');
      }
      throw error;
    }
  }

  // Find all addresses for a shop
  async findAll(shopId: number) {
    return this.prisma.shopAddress.findMany({
      where: { shopId },
      include: {
        city: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { isDefault: 'desc' }, // Default address first
    });
  }

  // Find a specific shop address
  async findOne(id: number, shopId: number) {
    const address = await this.prisma.shopAddress.findFirst({
      where: { id, shopId },
      include: {
        city: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found for shop ${shopId}`);
    }

    return address;
  }

  // Update a shop address
  async update(id: number, shopId: number, updateShopAddressDto: UpdateShopAddressDto, userId: number) {
    // Check if address exists 
    const address = await this.prisma.shopAddress.findFirst({
      where: { id, shopId },
      include: {
        shop: {
          include: { vendor: true }
        }
      },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found for shop ${shopId}`);
    }
    
    // Check if user has permission
    if (address.shop.vendor.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this address');
    }

    // If updating city, validate it exists
    if (updateShopAddressDto.cityId) {
      const cityExists = await this.prisma.city.findUnique({
        where: { id: updateShopAddressDto.cityId },
      });

      if (!cityExists) {
        throw new NotFoundException(`City with ID ${updateShopAddressDto.cityId} not found`);
      }
    }

    // Use transaction to ensure atomicity
    try {
      return await this.prisma.$transaction(async (tx) => {
        // If setting as default, reset other addresses
        if (updateShopAddressDto.isDefault) {
          await tx.shopAddress.updateMany({
            where: { 
              shopId, 
              isDefault: true,
              id: { not: id } // Don't update the current address
            },
            data: { isDefault: false },
          });
        }

        // Update the address
        const updated = await tx.shopAddress.update({
          where: { id },
          data: updateShopAddressDto,
          include: {
            city: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return updated;
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Another address is already set as default for this shop');
      }
      throw error;
    }
  }

  // Set address as default
  async setDefault(id: number, shopId: number, userId: number) {
    // Check if address exists
    const address = await this.prisma.shopAddress.findFirst({
      where: { id, shopId },
      include: {
        shop: {
          include: { vendor: true }
        }
      },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found for shop ${shopId}`);
    }
    
    // Check if user has permission
    if (address.shop.vendor.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this address');
    }

    // Use transaction to ensure atomicity
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Reset all default flags except current address
        await tx.shopAddress.updateMany({
          where: { 
            shopId, 
            isDefault: true,
            id: { not: id } // Don't update the current address
          },
          data: { isDefault: false },
        });

        // Set new default
        const updated = await tx.shopAddress.update({
          where: { id },
          data: { isDefault: true },
          include: {
            city: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return updated;
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Another address is already set as default for this shop');
      }
      throw error;
    }
  }

  // Delete a shop address
  async remove(id: number, shopId: number, userId: number) {
    // Check if address exists
    const address = await this.prisma.shopAddress.findFirst({
      where: { id, shopId },
      include: {
        shop: {
          include: { vendor: true }
        }
      },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found for shop ${shopId}`);
    }
    
    // Check if user has permission
    if (address.shop.vendor.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this address');
    }

    // Delete the address
    await this.prisma.shopAddress.delete({
      where: { id },
    });

    return { message: 'Shop address deleted successfully' };
  }

  // Helper method to check if user has permission to manage shop
  async checkShopOwnership(shopId: number, userId: number) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      include: { vendor: true },
    });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${shopId} not found`);
    }

    if (shop.vendor.userId !== userId) {
      throw new ForbiddenException('You do not have permission to manage addresses for this shop');
    }

    return true;
  }
}