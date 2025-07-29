import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorGroupDto } from './dto/create-vendor-group.dto';
import { UpdateVendorGroupDto } from './dto/update-vendor-group.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateVendorRequestDto } from './dto/update-vendor-request.dto';
import { ManageVendorsInGroupDto } from './dto/manage-vendors-in-group.dto';
import { RequestVendorDto } from './dto/request-vendor.dto';
import { PaginationDto, SortDirection } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VendorService {
  constructor(private prisma: PrismaService) {}

  async createVendorRequest(
    userId: number,
    requestVendorDto: RequestVendorDto,
    practicePermitDocUrl: string,
    licenseDocUrl: string,
    requestedGroupId?: number
  ) {
    // Get the user with their role
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Check if user is an admin or superadmin
    if (user.role === 'admin' || user.role === 'superadmin') {
      throw new BadRequestException('Admins cannot become vendors');
    }
    
    // Check if user is already a vendor
    const existingVendor = await this.prisma.vendor.findFirst({
      where: { userId }
    });

    if (existingVendor) {
      throw new BadRequestException('User is already a vendor');
    }

    // Check if user has ANY vendor request (pending, accepted, or rejected)
    const existingRequest = await this.prisma.vendorRequest.findFirst({
      where: { userId }
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        throw new BadRequestException('You already have a pending vendor request');
      } else if (existingRequest.status === 'reject') {
        throw new BadRequestException('Your previous request was rejected. Please contact admin for more information.');
      } else {
        throw new BadRequestException('You have already submitted a vendor request');
      }
    }
    
    // If a vendor group ID is provided, verify it exists
    if (requestedGroupId) {
      const vendorGroup = await this.prisma.vendorGroup.findUnique({
        where: { id: requestedGroupId }
      });
      
      if (!vendorGroup) {
        throw new BadRequestException('Selected vendor group does not exist');
      }
    }

    // Create vendor request with a transaction
    await this.prisma.$transaction(async (tx) => {
      // Create the vendor request
      await tx.vendorRequest.create({
        data: {
          user: { connect: { id: userId } },
          status: 'pending',
          message: requestVendorDto.message || null,
          requestedGroupId: requestedGroupId || null,
        },
      });
      
      // Create vendor record (disabled until approved)
      await tx.vendor.create({
        data: {
          user: { connect: { id: userId } },
          isDisabled: true, // Disabled until request is approved
          businessName: requestVendorDto.businessName,
          practicePermitDoc: practicePermitDocUrl,
          licenseDoc: licenseDocUrl
        }
      });
      
      // Update user role to vendor (still disabled until approved)
      await tx.user.update({
        where: { id: userId },
        data: { role: 'vendor' }
      });
    });
    
    return {
      message: 'Vendor request submitted successfully',
      status: 'pending'
    };
  }

  async requestVendor(userId: number, message?: string, vendorGroupId?: number): Promise<void> {
    // Get the user with their role
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Check if user is an admin or superadmin
    if (user.role === 'admin' || user.role === 'superadmin') {
      throw new BadRequestException('Admins cannot become vendors');
    }
    
    // Check if user is already a vendor
    const existingVendor = await this.prisma.vendor.findFirst({
      where: { userId }
    });

    if (existingVendor) {
      throw new BadRequestException('User is already a vendor');
    }

    // Check if user has ANY vendor request (pending, accepted, or rejected)
    const existingRequest = await this.prisma.vendorRequest.findFirst({
      where: { userId }
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        throw new BadRequestException('You already have a pending vendor request');
      } else if (existingRequest.status === 'reject') {
        throw new BadRequestException('Your previous request was rejected. Please contact admin for more information.');
      } else {
        throw new BadRequestException('You have already submitted a vendor request');
      }
    }
    
    // If a vendor group ID is provided, verify it exists
    if (vendorGroupId) {
      const vendorGroup = await this.prisma.vendorGroup.findUnique({
        where: { id: vendorGroupId }
      });
      
      if (!vendorGroup) {
        throw new BadRequestException('Selected vendor group does not exist');
      }
    }

    // Create new vendor request
    await this.prisma.vendorRequest.create({
      data: {
        user: { connect: { id: userId } },
        status: 'pending',
        message: message || 'No message provided',
        requestedGroupId: vendorGroupId || null,
      },
    });
  }

  async updateVendorProfile(
    userId: number, 
    updateData: {
      businessName?: string;
      practicePermitDoc?: string;
      licenseDoc?: string;
    }
  ) {
    // Find the vendor record for this user
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId }
    });
    
    if (!vendor) {
      throw new NotFoundException('Vendor profile not found');
    }
    
    // Update the vendor record with the provided data
    const updatedVendor = await this.prisma.vendor.update({
      where: { id: vendor.id },
      data: updateData
    });
    
    return {
      message: 'Vendor profile updated successfully',
      vendor: {
        id: updatedVendor.id,
        businessName: updatedVendor.businessName,
        practicePermitDoc: updatedVendor.practicePermitDoc,
        licenseDoc: updatedVendor.licenseDoc,
        isDisabled: updatedVendor.isDisabled
      }
    };
  }

  async respondVendorRequest(requestId: number, status: string): Promise<void> {
    const vendorRequest = await this.prisma.vendorRequest.findUnique({
      where: { id: requestId },
      include: { 
        user: {
          omit: { password: true }
        } 
      },
    });

    if (!vendorRequest) {
      throw new NotFoundException('Vendor request not found');
    }

    if (vendorRequest.status !== 'pending') {
      throw new BadRequestException('This request has already been processed');
    }

    // Check if user is already a vendor (double-check)
    const existingVendor = await this.prisma.vendor.findFirst({
      where: { userId: vendorRequest.userId }
    });

    if (existingVendor) {
      throw new BadRequestException('User is already a vendor');
    }

    await this.prisma.$transaction(async (prisma) => {
      // Update request status
      await prisma.vendorRequest.update({
        where: { id: requestId },
        data: { 
          status, 
          respondedAt: new Date() 
        },
      });

      if (status === 'accept') {
        // Create vendor record
        const vendor = await prisma.vendor.create({
          data: {
            user: { connect: { id: vendorRequest.userId } },
            isDisabled: false,
          },
        });

        // If a group was requested, add the vendor to that group
        if (vendorRequest.requestedGroupId) {
          await prisma.vendorGroup.update({
            where: { id: vendorRequest.requestedGroupId },
            data: {
              vendors: {
                connect: { id: vendor.id }
              }
            }
          });
        }

        // Update user role
        await prisma.user.update({
          where: { id: vendorRequest.userId },
          data: { role: 'vendor' },
        });
      }
    });
  }

  async updateVendorRequest(id: number, updateVendorRequestDto: UpdateVendorRequestDto, userId: number) {
    const vendorRequest = await this.prisma.vendorRequest.findUnique({
      where: { id },
      include: { 
        user: {
          omit: { password: true }
        } 
      }
    });
    
    if (!vendorRequest) {
      throw new NotFoundException('Vendor request not found');
    }
    
    // Only allow updating message if it's your own request and status is pending
    if (vendorRequest.userId !== userId && updateVendorRequestDto.message) {
      throw new ForbiddenException('You can only update your own vendor requests');
    }
    
    if (vendorRequest.status !== 'pending' && updateVendorRequestDto.message) {
      throw new BadRequestException('Cannot update message for a request that is already processed');
    }
    
    // Only admins can change status
    if (updateVendorRequestDto.status && updateVendorRequestDto.status !== 'pending') {
      // This is effectively a respond operation, so reuse that logic
      await this.respondVendorRequest(id, updateVendorRequestDto.status);
      return this.prisma.vendorRequest.findUnique({
        where: { id },
        include: { 
          user: {
            omit: { password: true }
          }
        }
      });
    }
    
    return this.prisma.vendorRequest.update({
      where: { id },
      data: {
        message: updateVendorRequestDto.message
      },
      include: { 
        user: {
          omit: { password: true }
        }
      }
    });
  }

  async getAllVendorRequests(paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.DESC, 
      sortBy = 'createdAt' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Validate sortBy field to prevent SQL injection
    const validSortFields = ['id', 'status', 'createdAt', 'respondedAt'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    // Get all vendor requests with user details
    const [requests, totalCount] = await Promise.all([
      this.prisma.vendorRequest.findMany({
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: { 
          user: {
            omit: { password: true }
          }
        },
      }),
      this.prisma.vendorRequest.count()
    ]);
    
    // For each request, get the associated vendor record to include document information
    const enhancedRequests = await Promise.all(
      requests.map(async (request) => {
        // Look up vendor record for this user to get document URLs
        const vendorRecord = await this.prisma.vendor.findFirst({
          where: { userId: request.userId },
          select: {
            businessName: true,
            practicePermitDoc: true,
            licenseDoc: true
          }
        });
        
        // Return enhanced request with document information
        return {
          ...request,
          businessName: vendorRecord?.businessName || null,
          practicePermitDoc: vendorRecord?.practicePermitDoc || null, 
          licenseDoc: vendorRecord?.licenseDoc || null
        };
      })
    );

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: enhancedRequests,
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

  async enableVendor(vendorId: number): Promise<void> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { 
        shops: true,
        user: {
          omit: { password: true }
        }
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    await this.prisma.$transaction([
      this.prisma.vendor.update({
        where: { id: vendorId },
        data: { isDisabled: false },
      }),
      this.prisma.shop.updateMany({
        where: { vendorId },
        data: { status: 'enabled' },
      }),
    ]);
  }

  async disableVendor(vendorId: number): Promise<void> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { 
        shops: true,
        user: {
          omit: { password: true }
        }
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    await this.prisma.$transaction([
      this.prisma.vendor.update({
        where: { id: vendorId },
        data: { isDisabled: true },
      }),
      this.prisma.shop.updateMany({
        where: { vendorId },
        data: { status: 'disabled' },
      }),
    ]);
  }

  async findOneVendor(id: number) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        user: {
          omit: { password: true }
        },
        shops: true,
        groups: true
      }
    });
    
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
    
    return vendor;
  }

  async findAllVendors(paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.ASC, 
      sortBy = 'createdAt' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Validate sortBy field to prevent SQL injection
    const validSortFields = ['id', 'isDisabled', 'createdAt', 'updatedAt'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [vendors, totalCount] = await Promise.all([
      this.prisma.vendor.findMany({
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: { 
          user: {
            omit: { password: true }
          },
          shops: true,
        },
      }),
      this.prisma.vendor.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: vendors,
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

  async updateVendor(id: number, updateVendorDto: UpdateVendorDto) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: { shops: true }
    });
    
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
    
    const updatedVendor = await this.prisma.vendor.update({
      where: { id },
      data: updateVendorDto,
      include: {
        user: {
          omit: { password: true }
        },
        shops: true,
        groups: true
      }
    });
    
    // If isDisabled is explicitly set, update shop statuses accordingly
    if (updateVendorDto.isDisabled !== undefined) {
      await this.prisma.shop.updateMany({
        where: { vendorId: id },
        data: { 
          status: updateVendorDto.isDisabled ? 'disabled' : 'enabled'
        }
      });
    }
    
    return updatedVendor;
  }

  async deleteVendor(vendorId: number): Promise<void> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { 
        shops: true,
        user: true
      }
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    // Check if vendor has shops with products
    const shopsWithProducts = await this.prisma.shop.findMany({
      where: { 
        vendorId,
        products: { some: {} } 
      },
      include: { products: { select: { id: true } } }
    });

    if (shopsWithProducts.length > 0) {
      throw new ForbiddenException('Cannot delete vendor with active products. Disable the vendor instead.');
    }

    // First find all vendor groups that contain this vendor
    const vendorGroupsWithVendor = await this.prisma.vendorGroup.findMany({
      where: {
        vendors: {
          some: { id: vendorId }
        }
      }
    });

    await this.prisma.$transaction(async (tx) => {
      // Remove vendor from any groups
      for (const group of vendorGroupsWithVendor) {
        await tx.vendorGroup.update({
          where: { id: group.id },
          data: {
            vendors: {
              disconnect: { id: vendorId }
            }
          }
        });
      }

      // Delete all shops
      await tx.shop.deleteMany({
        where: { vendorId },
      });

      // Delete vendor record
      await tx.vendor.delete({
        where: { id: vendorId }
      });

      // Update user role back to regular user
      await tx.user.update({
        where: { id: vendor.userId },
        data: { role: 'user' }
      });
    });
  }

  async createVendorGroup(createVendorGroupDto: CreateVendorGroupDto) {
    const existingGroup = await this.prisma.vendorGroup.findUnique({
      where: { name: createVendorGroupDto.name },
    });

    if (existingGroup) {
      throw new ConflictException('Group name already exists');
    }

    return this.prisma.vendorGroup.create({
      data: createVendorGroupDto,
    });
  }

  async findOneVendorGroup(id: number) {
    const vendorGroup = await this.prisma.vendorGroup.findUnique({
      where: { id },
      include: {
        vendors: {
          include: { 
            user: {
              omit: { password: true }
            },
            shops: true
          }
        },
        priceRules: true
      }
    });
    
    if (!vendorGroup) {
      throw new NotFoundException(`Vendor group with ID ${id} not found`);
    }
    
    return vendorGroup;
  }

  async updateVendorGroup(id: number, updateVendorGroupDto: UpdateVendorGroupDto) {
    const { vendorIds, ...data } = updateVendorGroupDto;

    // Check if the group exists
    const vendorGroup = await this.prisma.vendorGroup.findUnique({
      where: { id }
    });
    
    if (!vendorGroup) {
      throw new NotFoundException(`Vendor group with ID ${id} not found`);
    }

    return this.prisma.vendorGroup.update({
      where: { id },
      data: {
        ...data,
        vendors: vendorIds ? {
          set: vendorIds.map(id => ({ id })),
        } : undefined,
      },
      include: { 
        vendors: {
          include: {
            user: {
              omit: { password: true }
            }
          }
        } 
      },
    });
  }

  async manageVendorsInGroup(id: number, manageVendorsDto: ManageVendorsInGroupDto) {
    const vendorGroup = await this.prisma.vendorGroup.findUnique({
      where: { id },
      include: {
        vendors: true
      }
    });
    
    if (!vendorGroup) {
      throw new NotFoundException(`Vendor group with ID ${id} not found`);
    }

    // Check if all vendors exist
    const vendors = await this.prisma.vendor.findMany({
      where: {
        id: {
          in: manageVendorsDto.vendorIds
        }
      }
    });

    if (vendors.length !== manageVendorsDto.vendorIds.length) {
      throw new BadRequestException('One or more vendor IDs do not exist');
    }
    
    let operation;
    
    switch (manageVendorsDto.operation) {
      case 'add':
        operation = {
          connect: manageVendorsDto.vendorIds.map(id => ({ id }))
        };
        break;
      case 'remove':
        operation = {
          disconnect: manageVendorsDto.vendorIds.map(id => ({ id }))
        };
        break;
      case 'set':
        operation = {
          set: manageVendorsDto.vendorIds.map(id => ({ id }))
        };
        break;
    }
    
    return this.prisma.vendorGroup.update({
      where: { id },
      data: {
        vendors: operation
      },
      include: { 
        vendors: {
          include: {
            user: {
              omit: { password: true }
            },
            shops: true
          } 
        }
      },
    });
  }

  async deleteVendorGroup(id: number) {
    const vendorGroup = await this.prisma.vendorGroup.findUnique({
      where: { id },
      include: {
        vendors: true,
        priceRules: true
      }
    });
    
    if (!vendorGroup) {
      throw new NotFoundException(`Vendor group with ID ${id} not found`);
    }
    
    // Check if this group is used by any price rules
    if (vendorGroup.priceRules.length > 0) {
      throw new ForbiddenException('Cannot delete vendor group that has active price rules');
    }
    
    return this.prisma.vendorGroup.delete({
      where: { id }
    });
  }

  async getAllVendorGroups(paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.ASC, 
      sortBy = 'name' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Validate sortBy field to prevent SQL injection
    const validSortFields = ['id', 'name', 'createdAt', 'updatedAt'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';

    const [groups, totalCount] = await Promise.all([
      this.prisma.vendorGroup.findMany({
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          vendors: {
            include: { 
              user: {
                omit: { password: true }
              },
              shops: {
                select: {
                  id: true,
                  name: true
                },
                take: 3 // Limit to 3 shops per vendor for better performance
              }
            },
            take: 5 // Limit to 5 vendors per group for better performance
          }
        }
      }),
      this.prisma.vendorGroup.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: groups,
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

  async checkVendorRequest(userId: number) {
    // Check if user is already a vendor
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId }
    });

    if (vendor) {
      return {
        hasRequest: false,
        status: 'already_vendor', // Special status to indicate user is already a vendor
        createdAt: null,
        message: null,
        requestedGroupId: null,
        businessName: vendor.businessName,
        practicePermitDoc: vendor.practicePermitDoc,
        licenseDoc: vendor.licenseDoc
      };
    }

    // Check for vendor request
    const vendorRequest = await this.prisma.vendorRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!vendorRequest) {
      return {
        hasRequest: false,
        status: null,
        createdAt: null,
        message: null,
        requestedGroupId: null,
        businessName: null,
        practicePermitDoc: null,
        licenseDoc: null
      };
    }
    
    // Get vendor info for this request
    const pendingVendor = await this.prisma.vendor.findFirst({
      where: { userId }
    });

    return {
      hasRequest: true,
      status: vendorRequest.status,
      createdAt: vendorRequest.createdAt,
      message: vendorRequest.message,
      requestedGroupId: vendorRequest.requestedGroupId,
      businessName: pendingVendor?.businessName || null,
      practicePermitDoc: pendingVendor?.practicePermitDoc || null,
      licenseDoc: pendingVendor?.licenseDoc || null
    };
  }
}