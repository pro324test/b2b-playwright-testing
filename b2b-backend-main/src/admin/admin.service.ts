import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, SortDirection } from '../common/dto/pagination.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService
  ) {}

  async createSuperAdmin(username: string, email: string, password: string, firstName: string, lastName: string, phoneNumber: string) {
    const existingSuperAdmin = await this.findSuperAdmin();
    if (existingSuperAdmin) {
      throw new ConflictException('Super admin has already been created');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber, // Add phone number
        role: 'superadmin',
        isDisabled: false,
      },
      omit: { password: true },
    });
  }

  async findSuperAdmin() {
    return this.prisma.user.findFirst({
      where: { role: 'superadmin' },
      omit: { password: true },
    });
  }

  async createAdmin(username: string, email: string, password: string, firstName: string, lastName: string, phoneNumber: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber, // Add phone number
        role: 'admin',
        isDisabled: false,
      },
      omit: { password: true },
    });
  }

  async validateAdmin(identifier: string, password: string) {
    // For authentication, we need to get the password, so we don't use omit here
    const admin = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
          { phoneNumber: identifier }, // Add phone number as identifier
        ],
        role: { in: ['admin', 'superadmin'] },
      },
    });
    if (admin && await bcrypt.compare(password, admin.password)) {
      const { password, ...result } = admin;
      return result;
    }
    return null;
  }

  async findOne(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
          { phoneNumber: identifier }, // Add phone number as identifier
        ],
        role: { in: ['admin', 'superadmin'] },
      },
      omit: { password: true },
    });
  }

  async findAll(paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.DESC, 
      sortBy = 'createdAt' 
    } = paginationDto || {};
    const skip = (page - 1) * limit;
    const validSortFields = ['id', 'username', 'email', 'firstName', 'lastName', 'createdAt', 'role'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const [admins, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: { in: ['admin', 'superadmin'] } },
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortDirection.toLowerCase() },
        omit: { password: true },
      }),
      this.prisma.user.count({ where: { role: { in: ['admin', 'superadmin'] } } })
    ]);
    const totalPages = Math.ceil(totalCount / limit);
    return {
      data: admins,
      meta: {
        totalCount,
        page,
        limit,
        totalPages
      }
    };
  }

  async deleteAdmin(id: number) {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async disableAdmin(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { isDisabled: true },
      omit: { password: true },
    });
  }

  async enableAdmin(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { isDisabled: false },
      omit: { password: true },
    });
  }

  async getMe(adminId: number) {
    if (!adminId) {
      throw new UnauthorizedException('Admin ID not found in token');
    }
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      omit: { password: true },
    });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    if (admin.role !== 'admin' && admin.role !== 'superadmin') {
      throw new UnauthorizedException('Not an admin account');
    }
    if (admin.isDisabled) {
      throw new UnauthorizedException('Admin account is disabled');
    }
    return admin;
  }

  async login(admin: any) {
    // Only return admin details, no token
    const adminDetails = await this.prisma.user.findUnique({
      where: { id: admin.id },
      omit: { password: true },
    });
    return { admin: adminDetails };
  }
}