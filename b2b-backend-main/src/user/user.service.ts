import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { PaginationDto, SortDirection } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(username: string, email: string, password: string, firstName: string, lastName: string, phoneNumber: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber, // Add phoneNumber field
      },
      omit: { password: true },
    });
  }

  async findOne(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      omit: { password: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      omit: { password: true },
    });
  }

  async findOneByUsernameOrEmail(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
        ],
      },
      omit: { password: true },
    });
  }

  async findOneById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      omit: { password: true },
    });
  }

  async findAll(paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.ASC, 
      sortBy = 'username' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Validate sortBy field to prevent SQL injection
    const validSortFields = ['id', 'username', 'email', 'firstName', 'lastName', 'role', 'createdAt'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'username';

    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          vendor: {
            include: {
              shops: {
                select: {
                  id: true,
                  name: true,
                  status: true
                }
              }
            }
          }
        },
        omit: { password: true },
      }),
      this.prisma.user.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: users,
      meta: {
        totalItems: totalCount,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        sortBy: actualSortBy,
        sortDirection
      }
    };
  }

  async findAllVendors(paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.ASC, 
      sortBy = 'username' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Validate sortBy field to prevent SQL injection
    const validSortFields = ['id', 'username', 'email', 'firstName', 'lastName', 'createdAt'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'username';

    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: 'vendor' },
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          vendor: {
            include: {
              shops: {
                select: {
                  id: true,
                  name: true,
                  status: true
                }
              },
              groups: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        omit: { password: true },
      }),
      this.prisma.user.count({
        where: { role: 'vendor' }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: users,
      meta: {
        totalItems: totalCount,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        sortBy: actualSortBy,
        sortDirection
      }
    };
  }

  async delete(id: number) {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const data: any = { ...updateUserDto };
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    return this.prisma.user.update({
      where: { id },
      data,
      omit: { password: true },
    });
  }

  async getMe(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        vendor: {
          select: {
            id: true,
            isDisabled: true,
            shops: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
          }
        }
      },
      omit: { password: true },
    });
  }

  // New method: find specific user by ID (for admin use)
  async findUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            isDisabled: true,
            shops: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
          }
        }
      },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // New method: update any user (admin only)
  async updateUserByAdmin(id: number, updateUserAdminDto: UpdateUserAdminDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { vendor: true }
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // Check if username or email already exists
    if (updateUserAdminDto.username && updateUserAdminDto.username !== user.username) {
      const existingUser = await this.findOne(updateUserAdminDto.username);
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }
    
    if (updateUserAdminDto.email && updateUserAdminDto.email !== user.email) {
      const existingEmail = await this.findByEmail(updateUserAdminDto.email);
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }
    
    // Prepare data for update
    const data: any = { ...updateUserAdminDto };
    if (updateUserAdminDto.password) {
      data.password = await bcrypt.hash(updateUserAdminDto.password, 10);
    }
    
    // Role change handling
    if (updateUserAdminDto.role && updateUserAdminDto.role !== user.role) {
      if (!['user', 'vendor'].includes(updateUserAdminDto.role)) {
        throw new BadRequestException('Invalid role. Must be "user" or "vendor"');
      }
  
      // Case 1: Changing from user to vendor - need to create vendor record
      if (user.role === 'user' && updateUserAdminDto.role === 'vendor') {
        // Check if user already has a vendor record (edge case)
        if (user.vendor) {
          // Just update the user role, vendor record already exists
        } else {
          // Will create vendor record after user update
          const needsVendorRecord = true;
          
          // Perform operations in a transaction
          return this.prisma.$transaction(async (tx) => {
            // Update user first
            const updatedUser = await tx.user.update({
              where: { id },
              data,
              omit: { password: true },
            });
            
            // Create vendor record
            await tx.vendor.create({
              data: {
                user: { connect: { id: user.id } },
                isDisabled: false,
              }
            });
            
            return updatedUser;
          });
        }
      }
      
      // Case 2: Changing from vendor to user - check if they have vendor data
      if (user.role === 'vendor' && updateUserAdminDto.role === 'user') {
        if (user.vendor) {
          // Check if vendor has shops
          const vendorShops = await this.prisma.shop.findFirst({
            where: { vendorId: user.vendor.id }
          });
          
          if (vendorShops) {
            throw new ForbiddenException(
              'Cannot change role of user with active vendor account that has shops. ' +
              'Delete the vendor\'s shops first, then delete the vendor account.'
            );
          }
          
          // If vendor has no shops, we can delete the vendor record and change role
          return this.prisma.$transaction(async (tx) => {
            // Delete vendor record - Add a null check here to satisfy TypeScript
            if (user.vendor) { // This null check is already satisfied from outer if, but TypeScript needs it here
              await tx.vendor.delete({
                where: { id: user.vendor.id }
              });
            }
            
            // Update user
            const updatedUser = await tx.user.update({
              where: { id },
              data,
              omit: { password: true },
            });
            
            return updatedUser;
          });
        }
      }
    }
    
    // Standard update with no role change or special handling needed
    return this.prisma.user.update({
      where: { id },
      data,
      omit: { password: true },
    });
  }

  // New method: enable user
  async enableUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return this.prisma.user.update({
      where: { id },
      data: { isDisabled: false },
      omit: { password: true },
    });
  }

  // New method: disable user
  async disableUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return this.prisma.user.update({
      where: { id },
      data: { isDisabled: true },
      omit: { password: true },
    });
  }

  // New method: delete user by ID (admin only)
  async deleteUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { vendor: true }
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // If user is a vendor, prevent deletion if they have active shops or products
    if (user.vendor) {
      const vendorShops = await this.prisma.shop.findMany({
        where: { 
          vendorId: user.vendor.id,
          products: { some: {} }
        }
      });
      
      if (vendorShops.length > 0) {
        throw new ForbiddenException('Cannot delete user with active vendor account that has shops with products');
      }
    }
    
    await this.prisma.$transaction(async (tx) => {
      // If user is a vendor, delete vendor record first
      if (user.vendor) {
        // Delete shops
        await tx.shop.deleteMany({
          where: { vendorId: user.vendor.id }
        });
        
        // Delete vendor record
        await tx.vendor.delete({
          where: { id: user.vendor.id }
        });
      }
      
      // Delete user
      await tx.user.delete({
        where: { id }
      });
    });
  }
}