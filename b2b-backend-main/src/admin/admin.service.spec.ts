import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('hashed-password')
}));

describe('AdminService', () => {
  let service: AdminService;
  let prismaService: PrismaService;

  // Mock admin data
  const mockAdmin = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password: 'hashed-password',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Mock super admin data
  const mockSuperAdmin = {
    id: 2,
    username: 'superadmin',
    email: 'superadmin@example.com',
    password: 'hashed-password',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'superadmin',
    isDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(callback => callback(mockPrismaService)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSuperAdmin', () => {
    it('should create a super admin if none exists', async () => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaService.user.create as jest.Mock).mockResolvedValue({
        ...mockSuperAdmin,
        password: undefined
      });

      const result = await service.createSuperAdmin(
        'superadmin',
        'superadmin@example.com',
        'StrongPassword123!',
        'Super',
        'Admin'
      );

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { role: 'superadmin' },
        omit: { password: true }
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('StrongPassword123!', 10);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          username: 'superadmin',
          email: 'superadmin@example.com',
          password: 'hashed-password',
          firstName: 'Super',
          lastName: 'Admin',
          role: 'superadmin',
          isDisabled: false,
        },
        omit: { password: true },
      });

      expect(result).toEqual({
        ...mockSuperAdmin,
        password: undefined
      });
    });

    it('should throw ConflictException if super admin already exists', async () => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(mockSuperAdmin);

      await expect(
        service.createSuperAdmin(
          'superadmin',
          'superadmin@example.com',
          'StrongPassword123!',
          'Super',
          'Admin'
        )
      ).rejects.toThrow(ConflictException);

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { role: 'superadmin' },
        omit: { password: true }
      });

      expect(prismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findSuperAdmin', () => {
    it('should return the super admin if exists', async () => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue({
        ...mockSuperAdmin,
        password: undefined
      });

      const result = await service.findSuperAdmin();

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { role: 'superadmin' },
        omit: { password: true },
      });

      expect(result).toEqual({
        ...mockSuperAdmin,
        password: undefined
      });
    });

    it('should return null if super admin does not exist', async () => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.findSuperAdmin();

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { role: 'superadmin' },
        omit: { password: true },
      });

      expect(result).toBeNull();
    });
  });

  describe('createAdmin', () => {
    it('should create a regular admin', async () => {
      (prismaService.user.create as jest.Mock).mockResolvedValue({
        ...mockAdmin,
        password: undefined
      });

      const result = await service.createAdmin(
        'admin',
        'admin@example.com',
        'AdminPassword123!',
        'Admin',
        'User'
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('AdminPassword123!', 10);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          username: 'admin',
          email: 'admin@example.com',
          password: 'hashed-password',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isDisabled: false,
        },
        omit: { password: true },
      });

      expect(result).toEqual({
        ...mockAdmin,
        password: undefined
      });
    });
  });

  describe('validateAdmin', () => {
    it('should validate admin with correct credentials', async () => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(mockAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateAdmin('admin', 'correctPassword');

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: 'admin' },
            { email: 'admin' },
          ],
          role: { in: ['admin', 'superadmin'] }
        },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('correctPassword', mockAdmin.password);

      const { password, ...expectedAdmin } = mockAdmin;
      expect(result).toEqual(expectedAdmin);
    });

    it('should return null for non-existent admin', async () => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.validateAdmin('nonexistent', 'password');

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: 'nonexistent' },
            { email: 'nonexistent' },
          ],
          role: { in: ['admin', 'superadmin'] }
        },
      });

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null for incorrect password', async () => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(mockAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateAdmin('admin', 'wrongPassword');

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: 'admin' },
            { email: 'admin' },
          ],
          role: { in: ['admin', 'superadmin'] }
        },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', mockAdmin.password);
      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should find an admin by username or email', async () => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue({
        ...mockAdmin,
        password: undefined
      });

      const result = await service.findOne('admin');

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: 'admin' },
            { email: 'admin' },
          ],
          role: { in: ['admin', 'superadmin'] }
        },
        omit: { password: true },
      });

      expect(result).toEqual({
        ...mockAdmin,
        password: undefined
      });
    });

    it('should return null if admin does not exist', async () => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: 'nonexistent' },
            { email: 'nonexistent' },
          ],
          role: { in: ['admin', 'superadmin'] }
        },
        omit: { password: true },
      });

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all admins with pagination', async () => {
      const adminsList = [mockAdmin, mockSuperAdmin].map(admin => ({
        ...admin,
        password: undefined
      }));

      (prismaService.user.findMany as jest.Mock).mockResolvedValue(adminsList);
      (prismaService.user.count as jest.Mock).mockResolvedValue(2);

      const paginationDto = { page: 1, limit: 10 };
      const result = await service.findAll(paginationDto);

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { role: { in: ['admin', 'superadmin'] } },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        omit: { password: true },
      });

      expect(prismaService.user.count).toHaveBeenCalledWith({
        where: { role: { in: ['admin', 'superadmin'] } }
      });

      expect(result).toEqual({
        data: adminsList,
        meta: {
          totalCount: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      });
    });

    it('should return empty list if no admins exist', async () => {
      (prismaService.user.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.user.count as jest.Mock).mockResolvedValue(0);

      const paginationDto = { page: 1, limit: 10 };
      const result = await service.findAll(paginationDto);

      expect(prismaService.user.findMany).toHaveBeenCalled();
      expect(prismaService.user.count).toHaveBeenCalled();

      expect(result).toEqual({
        data: [],
        meta: {
          totalCount: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      });
    });

    it('should use default pagination values if none provided', async () => {
      (prismaService.user.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.user.count as jest.Mock).mockResolvedValue(0);

      const result = await service.findAll();

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { role: { in: ['admin', 'superadmin'] } },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        omit: { password: true },
      });
    });
  });

  describe('deleteAdmin', () => {
    it('should delete an admin', async () => {
      (prismaService.user.delete as jest.Mock).mockResolvedValue(undefined);

      await service.deleteAdmin(1);

      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('disableAdmin', () => {
    it('should disable an admin', async () => {
      const disabledAdmin = {
        ...mockAdmin,
        isDisabled: true,
        password: undefined
      };

      (prismaService.user.update as jest.Mock).mockResolvedValue(disabledAdmin);

      const result = await service.disableAdmin(1);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isDisabled: true },
        omit: { password: true },
      });

      expect(result).toEqual(disabledAdmin);
    });
  });

  describe('enableAdmin', () => {
    it('should enable an admin', async () => {
      const enabledAdmin = {
        ...mockAdmin,
        isDisabled: false,
        password: undefined
      };

      (prismaService.user.update as jest.Mock).mockResolvedValue(enabledAdmin);

      const result = await service.enableAdmin(1);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isDisabled: false },
        omit: { password: true },
      });

      expect(result).toEqual(enabledAdmin);
    });
  });

  describe('getMe', () => {
    it('should return the admin profile', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockAdmin,
        password: undefined
      });

      const result = await service.getMe(1);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        omit: { password: true },
      });

      expect(result).toEqual({
        ...mockAdmin,
        password: undefined
      });
    });

    it('should throw UnauthorizedException if adminId is missing', async () => {
      await expect(service.getMe(undefined as unknown as number)).rejects.toThrow(UnauthorizedException);

      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if admin not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getMe(999)).rejects.toThrow(NotFoundException);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        omit: { password: true },
      });
    });

    it('should throw UnauthorizedException if admin is disabled', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockAdmin,
        isDisabled: true,
        password: undefined
      });

      await expect(service.getMe(1)).rejects.toThrow(UnauthorizedException);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        omit: { password: true },
      });
    });
  });

  describe('login', () => {
    it('should return admin details (no token)', async () => {
      const { password, ...adminWithoutPassword } = mockAdmin;
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(adminWithoutPassword);
      const result = await service.login(adminWithoutPassword);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: adminWithoutPassword.id },
        omit: { password: true },
      });
      expect(result).toEqual({ admin: adminWithoutPassword });
    });
  });

  describe('Admin authentication flow', () => {
    it('should demonstrate a complete admin authentication flow', async () => {
      // Mock super admin doesn't exist yet
      (prismaService.user.findFirst as jest.Mock)
        .mockResolvedValueOnce(null) // For findSuperAdmin in createSuperAdmin
        .mockResolvedValueOnce(mockSuperAdmin); // For validateAdmin

      (prismaService.user.create as jest.Mock).mockResolvedValue({
        ...mockSuperAdmin,
        password: undefined
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockSuperAdmin,
        password: undefined
      });

      const regularAdmin = {
        ...mockAdmin,
        id: 3,
        username: 'regular_admin',
        password: undefined
      };

      (prismaService.user.create as jest.Mock)
        .mockResolvedValueOnce({...mockSuperAdmin, password: undefined})
        .mockResolvedValueOnce(regularAdmin);

      (prismaService.user.findMany as jest.Mock).mockResolvedValue([
        {...mockSuperAdmin, password: undefined},
        regularAdmin
      ]);
      (prismaService.user.count as jest.Mock).mockResolvedValue(2);

      // Step 1: Create super admin
      const superAdmin = await service.createSuperAdmin(
        'superadmin',
        'superadmin@example.com',
        'SuperPass123!',
        'Super',
        'Admin'
      );

      // Step 2: Validate admin credentials
      const validatedAdmin = await service.validateAdmin('superadmin', 'SuperPass123!');
      expect(validatedAdmin).not.toBeNull();
      const admin = validatedAdmin!;

      // Step 3: Login with validated admin
      const loginResult = await service.login(admin);
      expect(loginResult).toEqual({ admin });

      // Step 4: Get admin profile
      const profile = await service.getMe(admin.id);

      // Step 5: Create regular admin
      const newAdmin = await service.createAdmin(
        'regular_admin',
        'admin@example.com',
        'AdminPass123!',
        'Regular',
        'Admin'
      );

      // Step 6: Get admin list
      const adminList = await service.findAll({ page: 1, limit: 10 });

      // Verify all expected actions were performed
      expect(prismaService.user.findFirst).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(prismaService.user.create).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(prismaService.user.findUnique).toHaveBeenCalled();
      expect(prismaService.user.findMany).toHaveBeenCalled();
      expect(prismaService.user.count).toHaveBeenCalled();
    });
  });
});