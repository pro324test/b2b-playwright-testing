import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthService } from '../auth/auth.service';
import { TokenBlacklistService } from '../auth/token-blacklist.service';
import { UserService } from '../user/user.service';
import { VendorService } from '../vendor/vendor.service';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { PaginationDto } from '../common/dto/pagination.dto';

// NOTE: After migration, admin logic is based on the User table with role: 'admin' or 'superadmin'.
// All admin-related service methods and tests now operate on the User table, not a separate Admin table.

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;
  let authService: AuthService;
  let tokenBlacklistService: TokenBlacklistService;
  let userService: UserService;
  let vendorService: VendorService;

  // Mock token value for JWT tests
  const mockToken = 'mock-jwt-token';

  // Mock admin data
  const mockAdmin = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
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
    firstName: 'Super',
    lastName: 'Admin',
    role: 'superadmin',
    isDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    console.log('🏗️ Setting up AdminController test environment');
    
    // Create mock services
    const mockAdminService = {
      createSuperAdmin: jest.fn(),
      createAdmin: jest.fn(),
      validateAdmin: jest.fn(),
      login: jest.fn(),
      deleteAdmin: jest.fn(),
      disableAdmin: jest.fn(),
      enableAdmin: jest.fn(),
      findAll: jest.fn(),
      getMe: jest.fn(),
      findSuperAdmin: jest.fn()
    };

    const mockAuthService = {
      login: jest.fn()
    };

    const mockTokenBlacklistService = {
      add: jest.fn()
    };

    const mockUserService = {
      // Add any UserService methods needed here
    };

    const mockVendorService = {
      // Add any VendorService methods needed here
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: TokenBlacklistService, useValue: mockTokenBlacklistService },
        { provide: UserService, useValue: mockUserService },
        { provide: VendorService, useValue: mockVendorService },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
    authService = module.get<AuthService>(AuthService);
    tokenBlacklistService = module.get<TokenBlacklistService>(TokenBlacklistService);
    userService = module.get<UserService>(UserService);
    vendorService = module.get<VendorService>(VendorService);
    
    console.log('✅ Test setup complete');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    console.log('✅ AdminController is defined');
  });

  describe('createSuperAdmin', () => {
    it('should create a super admin if none exists', async () => {
      console.log('\n📝 Testing createSuperAdmin - successful creation');
      
      const createSuperAdminDto: CreateSuperAdminDto = {
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: 'Passw0rd!',
        firstName: 'Super',
        lastName: 'Admin'
      };
      
      // Mock super admin doesn't exist yet
      (adminService.findSuperAdmin as jest.Mock).mockResolvedValue(null);
      
      // Mock super admin creation
      (adminService.createSuperAdmin as jest.Mock).mockResolvedValue(mockSuperAdmin);
      
      console.log('👉 Step 1: Check if super admin already exists');
      console.log('👉 Step 2: Create super admin');
      
      const result = await controller.createSuperAdmin(createSuperAdminDto);
      
      console.log('📤 Created super admin:', result);
      
      expect(adminService.findSuperAdmin).toHaveBeenCalled();
      expect(adminService.createSuperAdmin).toHaveBeenCalledWith(
        createSuperAdminDto.username,
        createSuperAdminDto.email,
        createSuperAdminDto.password,
        createSuperAdminDto.firstName,
        createSuperAdminDto.lastName
      );
      
      expect(result).toEqual(mockSuperAdmin);
      
      console.log('✅ Super admin created successfully');
    });

    it('should throw ConflictException if super admin already exists', async () => {
      console.log('\n❌ Testing createSuperAdmin - super admin already exists');
      
      const createSuperAdminDto: CreateSuperAdminDto = {
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: 'Passw0rd!',
        firstName: 'Super',
        lastName: 'Admin'
      };
      
      // Mock super admin already exists
      (adminService.findSuperAdmin as jest.Mock).mockResolvedValue(mockSuperAdmin);
      
      console.log('👉 Step 1: Check if super admin already exists - Found');
      
      await expect(controller.createSuperAdmin(createSuperAdminDto))
        .rejects.toThrow(ConflictException);
      
      expect(adminService.findSuperAdmin).toHaveBeenCalled();
      expect(adminService.createSuperAdmin).not.toHaveBeenCalled();
      
      console.log('✅ ConflictException thrown as expected');
    });
  });

  describe('createAdmin', () => {
    it('should create a new admin', async () => {
      console.log('\n📝 Testing createAdmin - successful creation');
      
      const createAdminDto: CreateAdminDto = {
        username: 'admin',
        email: 'admin@example.com',
        password: 'Passw0rd!',
        firstName: 'Admin',
        lastName: 'User'
      };
      
      // Mock admin creation
      (adminService.createAdmin as jest.Mock).mockResolvedValue(mockAdmin);
      
      console.log('👉 Step 1: Create admin user');
      
      const result = await controller.createAdmin(createAdminDto);
      
      console.log('📤 Created admin:', result);
      
      expect(adminService.createAdmin).toHaveBeenCalledWith(
        createAdminDto.username,
        createAdminDto.email,
        createAdminDto.password,
        createAdminDto.firstName,
        createAdminDto.lastName
      );
      
      expect(result).toEqual(mockAdmin);
      
      console.log('✅ Admin created successfully');
    });
  });

  describe('login', () => {
    it('should login admin and return token', async () => {
      console.log('\n📝 Testing login - successful login');
      
      const loginAdminDto: LoginAdminDto = {
        identifier: 'admin',
        password: 'Passw0rd!'
      };
      
      // Mock successful validation and login
      (adminService.validateAdmin as jest.Mock).mockResolvedValue(mockAdmin);
      (authService.login as jest.Mock).mockResolvedValue({
        accessToken: mockToken,
        admin: mockAdmin
      });
      
      console.log('👉 Step 1: Validate admin credentials');
      console.log('👉 Step 2: Generate JWT token and return admin data');
      
      const result = await controller.login(loginAdminDto);
      
      console.log('📤 Login response:', result);
      
      expect(adminService.validateAdmin).toHaveBeenCalledWith(
        loginAdminDto.identifier,
        loginAdminDto.password
      );
      
      expect(authService.login).toHaveBeenCalledWith(mockAdmin);
      
      expect(result).toEqual({
        accessToken: mockToken,
        admin: mockAdmin
      });
      
      console.log('✅ Login successful');
    });

    it('should throw ConflictException with invalid credentials', async () => {
      console.log('\n❌ Testing login - invalid credentials');
      
      const loginAdminDto: LoginAdminDto = {
        identifier: 'admin',
        password: 'wrongpassword'
      };
      
      // Mock failed validation
      (adminService.validateAdmin as jest.Mock).mockResolvedValue(null);
      
      console.log('👉 Step 1: Validate admin credentials - Failed');
      
      await expect(controller.login(loginAdminDto))
        .rejects.toThrow(ConflictException);
      
      expect(adminService.validateAdmin).toHaveBeenCalledWith(
        loginAdminDto.identifier,
        loginAdminDto.password
      );
      
      expect(authService.login).not.toHaveBeenCalled();
      
      console.log('✅ ConflictException thrown as expected');
    });

    it('should throw UnauthorizedException if admin is disabled', async () => {
      console.log('\n❌ Testing login - disabled admin account');
      
      const loginAdminDto: LoginAdminDto = {
        identifier: 'admin',
        password: 'Passw0rd!'
      };
      
      // Mock validation returns disabled admin
      const disabledAdmin = { ...mockAdmin, isDisabled: true };
      (adminService.validateAdmin as jest.Mock).mockResolvedValue(disabledAdmin);
      
      console.log('👉 Step 1: Validate admin credentials - Success');
      console.log('👉 Step 2: Check if admin account is disabled - Disabled');
      
      await expect(controller.login(loginAdminDto))
        .rejects.toThrow(UnauthorizedException);
      
      expect(adminService.validateAdmin).toHaveBeenCalledWith(
        loginAdminDto.identifier,
        loginAdminDto.password
      );
      
      expect(authService.login).not.toHaveBeenCalled();
      
      console.log('✅ UnauthorizedException thrown as expected');
    });
  });

  describe('logout', () => {
    it('should blacklist token and clear cookie', async () => {
      console.log('\n📝 Testing logout - successful logout');
      
      const req = {
        headers: {
          authorization: `Bearer ${mockToken}`
        }
      };
      
      const res = {
        clearCookie: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as unknown as Response;
      
      console.log('👉 Step 1: Extract token from authorization header');
      console.log('👉 Step 2: Add token to blacklist');
      console.log('👉 Step 3: Clear cookie and return success response');
      
      await controller.logout(req, res);
      
      expect(tokenBlacklistService.add).toHaveBeenCalledWith(mockToken);
      expect(res.clearCookie).toHaveBeenCalledWith('jwt', { httpOnly: true, secure: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
      
      console.log('✅ Logout successful');
    });
  });

  describe('deleteAdmin', () => {
    it('should delete an admin', async () => {
      console.log('\n🗑️ Testing deleteAdmin - successful deletion');
      
      const adminId = 1;
      
      // Mock successful deletion
      (adminService.deleteAdmin as jest.Mock).mockResolvedValue(undefined);
      
      console.log('👉 Step 1: Delete admin with ID:', adminId);
      
      const result = await controller.deleteAdmin(adminId);
      
      console.log('📤 Delete response:', result);
      
      expect(adminService.deleteAdmin).toHaveBeenCalledWith(adminId);
      expect(result).toEqual({ message: 'Admin deleted successfully' });
      
      console.log('✅ Admin deleted successfully');
    });
  });

  describe('disableAdmin', () => {
    it('should disable an admin', async () => {
      console.log('\n🔒 Testing disableAdmin - successful disabling');
      
      const adminId = 1;
      
      // Mock successful disabling
      (adminService.disableAdmin as jest.Mock).mockResolvedValue(undefined);
      
      console.log('👉 Step 1: Disable admin with ID:', adminId);
      
      const result = await controller.disableAdmin(adminId);
      
      console.log('📤 Disable response:', result);
      
      expect(adminService.disableAdmin).toHaveBeenCalledWith(adminId);
      expect(result).toEqual({ message: 'Admin disabled successfully' });
      
      console.log('✅ Admin disabled successfully');
    });
  });

  describe('enableAdmin', () => {
    it('should enable an admin', async () => {
      console.log('\n🔓 Testing enableAdmin - successful enabling');
      
      const adminId = 1;
      
      // Mock successful enabling
      (adminService.enableAdmin as jest.Mock).mockResolvedValue(undefined);
      
      console.log('👉 Step 1: Enable admin with ID:', adminId);
      
      const result = await controller.enableAdmin(adminId);
      
      console.log('📤 Enable response:', result);
      
      expect(adminService.enableAdmin).toHaveBeenCalledWith(adminId);
      expect(result).toEqual({ message: 'Admin enabled successfully' });
      
      console.log('✅ Admin enabled successfully');
    });
  });

  describe('findAllAdmins', () => {
    it('should return all admins with pagination', async () => {
      console.log('\n📝 Testing findAllAdmins - retrieve admin list');
      
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10
      };
      
      const adminsList = {
        data: [mockAdmin, mockSuperAdmin],
        meta: {
          totalCount: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      };
      
      // Mock returning admins list
      (adminService.findAll as jest.Mock).mockResolvedValue(adminsList);
      
      console.log('👉 Step 1: Get all admins with pagination');
      
      const result = await controller.findAllAdmins(paginationDto);
      
      console.log('📤 Admins list response:', result);
      
      expect(adminService.findAll).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(adminsList);
      
      console.log('✅ Admin list retrieved successfully');
    });
  });

  describe('getMe', () => {
    it('should return the admin profile', async () => {
      console.log('\n📝 Testing getMe - retrieve admin profile');
      
      const req = {
        user: {
          adminId: 1
        }
      };
      
      // Mock returning admin profile
      (adminService.getMe as jest.Mock).mockResolvedValue(mockAdmin);
      
      console.log('👉 Step 1: Get admin profile using ID from JWT token');
      
      const result = await controller.getMe(req);
      
      console.log('📤 Admin profile response:', result);
      
      expect(adminService.getMe).toHaveBeenCalledWith(req.user.adminId);
      expect(result).toEqual(mockAdmin);
      
      console.log('✅ Admin profile retrieved successfully');
    });

    it('should throw UnauthorizedException if adminId is missing', async () => {
      console.log('\n❌ Testing getMe - invalid admin authentication');
      
      const req = {
        user: {}
      };
      
      console.log('👉 Step 1: Check for adminId in JWT token - Missing');
      
      await expect(controller.getMe(req))
        .rejects.toThrow(UnauthorizedException);
      
      expect(adminService.getMe).not.toHaveBeenCalled();
      
      console.log('✅ UnauthorizedException thrown as expected');
    });
  });

  describe('Admin authentication flow', () => {
    it('should demonstrate a complete admin flow', async () => {
      console.log('\n🔄 Demonstrating complete admin authentication flow');
      
      // 1. Create Super Admin - setup
      const createSuperAdminDto: CreateSuperAdminDto = {
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: 'SuperPassw0rd!',
        firstName: 'Super',
        lastName: 'Admin'
      };
      
      (adminService.findSuperAdmin as jest.Mock).mockResolvedValue(null);
      (adminService.createSuperAdmin as jest.Mock).mockResolvedValue(mockSuperAdmin);
      
      // 2. Login as Super Admin - setup
      const loginDto: LoginAdminDto = {
        identifier: 'superadmin',
        password: 'SuperPassw0rd!'
      };
      
      (adminService.validateAdmin as jest.Mock).mockResolvedValue(mockSuperAdmin);
      (authService.login as jest.Mock).mockResolvedValue({
        accessToken: mockToken,
        admin: mockSuperAdmin
      });
      
      // 3. Create Regular Admin - setup
      const createAdminDto: CreateAdminDto = {
        username: 'regular_admin',
        email: 'admin@example.com',
        password: 'AdminPassw0rd!',
        firstName: 'Regular',
        lastName: 'Admin'
      };
      
      const regularAdmin = {
        ...mockAdmin,
        id: 3,
        username: 'regular_admin'
      };
      
      (adminService.createAdmin as jest.Mock).mockResolvedValue(regularAdmin);
      
      // 4. Get Admin List - setup
      (adminService.findAll as jest.Mock).mockResolvedValue({
        data: [mockSuperAdmin, regularAdmin],
        meta: {
          totalCount: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      });
      
      // 5. Logout - setup
      const req = {
        headers: {
          authorization: `Bearer ${mockToken}`
        }
      };
      
      const res = {
        clearCookie: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as unknown as Response;
      
      // Execute the flow
      console.log('👉 STEP 1: CREATE SUPER ADMIN - Initial system setup');
      const superAdminResult = await controller.createSuperAdmin(createSuperAdminDto);
      console.log('   ✓ Super admin created:', superAdminResult.username);
      
      console.log('👉 STEP 2: LOGIN - Super admin authentication');
      const loginResult = await controller.login(loginDto);
      console.log('   ✓ Super admin logged in with token:', loginResult.accessToken.substring(0, 10) + '...');
      
      console.log('👉 STEP 3: CREATE ADMIN - Super admin creates a regular admin');
      const adminResult = await controller.createAdmin(createAdminDto);
      console.log('   ✓ Regular admin created:', adminResult.username);
      
      console.log('👉 STEP 4: LIST ADMINS - View all admins in the system');
      const adminList = await controller.findAllAdmins({ page: 1, limit: 10 });
      console.log('   ✓ Retrieved admin list with', adminList.data.length, 'admins');
      
      console.log('👉 STEP 5: LOGOUT - End super admin session');
      await controller.logout(req, res);
      console.log('   ✓ Super admin logged out successfully');
      
      // Verify all expected actions were performed
      expect(adminService.createSuperAdmin).toHaveBeenCalled();
      expect(adminService.validateAdmin).toHaveBeenCalled();
      expect(authService.login).toHaveBeenCalled();
      expect(adminService.createAdmin).toHaveBeenCalled();
      expect(adminService.findAll).toHaveBeenCalled();
      expect(tokenBlacklistService.add).toHaveBeenCalled();
      
      console.log('✅ Complete admin authentication flow demonstrated successfully');
    });
  });
});
