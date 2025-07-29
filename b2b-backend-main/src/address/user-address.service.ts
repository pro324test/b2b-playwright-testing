import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
  } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
  import { CreateUserAddressDto, UpdateUserAddressDto } from './dto/user-address.dto';
  
  @Injectable()
  export class UserAddressService {
    constructor(private prisma: PrismaService) {}
  
    // Create a new user address
    async create(userId: number, createUserAddressDto: CreateUserAddressDto) {
      // Check address limit (max 3)
      const addressCount = await this.prisma.userAddress.count({
        where: { userId },
      });
  
      if (addressCount >= 3) {
        throw new BadRequestException('Maximum of 3 addresses allowed per user');
      }
  
      // Validate that city exists
      const cityExists = await this.prisma.city.findUnique({
        where: { id: createUserAddressDto.cityId },
      });
  
      if (!cityExists) {
        throw new NotFoundException(`City with ID ${createUserAddressDto.cityId} not found`);
      }
  
      // If this is the first address or isDefault is true, set it as default
      const isDefault = addressCount === 0 || createUserAddressDto.isDefault;
  
      // Use transaction to ensure we don't violate the unique constraint
      return this.prisma.$transaction(async (tx) => {
        // If setting as default, reset other addresses FIRST
        if (isDefault) {
          await tx.userAddress.updateMany({
            where: { 
              userId, 
              isDefault: true 
            },
            data: { isDefault: false },
          });
        }
  
        // Create the address AFTER resetting other defaults
        const address = await tx.userAddress.create({
          data: {
            userId,
            street: createUserAddressDto.street,
            cityId: createUserAddressDto.cityId,
            googleMapsLink: createUserAddressDto.googleMapsLink,
            latitude: createUserAddressDto.latitude,
            longitude: createUserAddressDto.longitude,
            notes: createUserAddressDto.notes,
            addressType: createUserAddressDto.addressType || 'home',
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
    }
  
    // Find all addresses for a user
    async findAll(userId: number) {
      return this.prisma.userAddress.findMany({
        where: { userId },
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
  
    // Find a specific user address
    async findOne(id: number, userId: number) {
      const address = await this.prisma.userAddress.findFirst({
        where: { id, userId },
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
        throw new NotFoundException(`Address with ID ${id} not found`);
      }
  
      return address;
    }
  
    // Update a user address
    async update(id: number, userId: number, updateUserAddressDto: UpdateUserAddressDto) {
      // Check if address exists and belongs to user
      await this.findOne(id, userId);
  
      // If updating city, validate it exists
      if (updateUserAddressDto.cityId) {
        const cityExists = await this.prisma.city.findUnique({
          where: { id: updateUserAddressDto.cityId },
        });
  
        if (!cityExists) {
          throw new NotFoundException(`City with ID ${updateUserAddressDto.cityId} not found`);
        }
      }
  
      // If setting as default, reset other addresses
      if (updateUserAddressDto.isDefault) {
        await this.prisma.userAddress.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }
  
      // Update the address
      const updated = await this.prisma.userAddress.update({
        where: { id },
        data: updateUserAddressDto,
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
    }
  
    // Set address as default
    async setDefault(id: number, userId: number) {
      // Check if address exists and belongs to user
      await this.findOne(id, userId);
  
      // Reset all default flags
      await this.prisma.userAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
  
      // Set new default
      const updated = await this.prisma.userAddress.update({
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
    }
  
    // Delete a user address
    async remove(id: number, userId: number) {
      // Check if address exists and belongs to user
      const address = await this.findOne(id, userId);
  
      // Delete the address
      await this.prisma.userAddress.delete({
        where: { id },
      });
  
      return { message: 'Address deleted successfully' };
    }
  }