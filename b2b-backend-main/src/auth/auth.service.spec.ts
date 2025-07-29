import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AdminService } from '../admin/admin.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dto/signup.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('hashed-password')
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let adminService: AdminService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  // Mock user data
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashed-password',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    isDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

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

  // Mock vendor data 
  const mockVendor = {
    id: 1,
    userId: 1,
    isDisabled: false,
    shops: [
      { id: 1, name: 'Test Shop', status: 'enabled' }
    ],
    groups: [
      { id: 1, name: 'Premium Vendors', description: 'Vendors with premium status' }
    ]
  };

  beforeEach(async () => {
    console.log('🏗️ Setting up AuthService test environment');

    // Create mock services
    const mockUserService = {
      findOne: jest.fn(),
      findByEmail: jest.fn(),
      findOneByUsernameOrEmail: jest.fn(),
      findOneById: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      getMe: jest.fn()
    };

    const mockAdminService = {
      findOne: jest.fn(),
      getMe: jest.fn()
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-token')
    };

    const mockPrismaService = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn()
      },
      vendor: {
        findFirst: jest.fn()
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    adminService = module.get<AdminService>(AdminService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
    
    console.log('✅ Test setup complete');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    console.log('✅ AuthService is defined');
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      console.log('\n📝 Testing validateUser - successful validation');
      
      const identifier = 'testuser';
      const password = 'password';
      
      // Mock user exists
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock bcrypt compare success
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      console.log('👉 Step 1: Looking up user with identifier:', identifier);
      console.log('👉 Step 2: Validating password');
      
      const result = await service.validateUser(identifier, password);
      
      console.log('📤 User validated successfully');
      
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: identifier },
            { email: identifier },
          ],
        },
      });
      
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      
      // Password should be removed from the result
      const { password: _, ...expectedUser } = mockUser;
      expect(result).toEqual(expectedUser);
      
      console.log('✅ User validated successfully');
    });

    it('should return null for non-existent user', async () => {
      console.log('\n❌ Testing validateUser - user not found');
      
      const identifier = 'nonexistent';
      const password = 'password';
      
      // Mock user does not exist
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(null);
      
      console.log('👉 Step 1: Looking up user with identifier:', identifier);
      console.log('👉 Step 2: User not found');
      
      const result = await service.validateUser(identifier, password);
      
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: identifier },
            { email: identifier },
          ],
        },
      });
      
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
      
      console.log('✅ Null returned as expected for non-existent user');
    });

    it('should return null for incorrect password', async () => {
      console.log('\n❌ Testing validateUser - incorrect password');
      
      const identifier = 'testuser';
      const password = 'wrong-password';
      
      // Mock user exists
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock bcrypt compare failure
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      console.log('👉 Step 1: Looking up user with identifier:', identifier);
      console.log('👉 Step 2: Validating password - Incorrect');
      
      const result = await service.validateUser(identifier, password);
      
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: identifier },
            { email: identifier },
          ],
        },
      });
      
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toBeNull();
      
      console.log('✅ Null returned as expected for incorrect password');
    });
  });

  describe('login', () => {
    it('should login a user and return token with user details', async () => {
      console.log('\n📝 Testing login - successful user login');
      
      // Create a copy with optional password
      const user = { ...mockUser, password: mockUser.password as string | undefined };
      // Now we can safely delete the property
      user.password = undefined;
      
      // Mock findOneById - fix the type annotation
      (userService.findOneById as jest.Mock).mockResolvedValue(user);
      
      console.log('👉 Step 1: Creating JWT payload');
      console.log('👉 Step 2: Getting full user details');
      console.log('👉 Step 3: Generating access token');
      
      const result = await service.login(user);
      
      console.log('📤 Login response:', result);
      
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: user.username,
        sub: user.id,
        role: user.role
      });
      
      expect(userService.findOneById).toHaveBeenCalledWith(user.id);
      
      expect(result).toEqual({
        accessToken: 'mock-token',
        user: user
      });
      
      console.log('✅ Login successful');
    });

    it('should include vendor details for vendor users', async () => {
      console.log('\n📝 Testing login - vendor user login');
      
      // Create a copy with optional password
      const vendorUser = { ...mockUser, role: 'vendor', password: mockUser.password as string | undefined };
      // Now we can safely delete the property
      vendorUser.password = undefined;
      
      // Mock findOneById - fix the type annotation
      (userService.findOneById as jest.Mock).mockResolvedValue(vendorUser);
      
      // Mock vendor lookup
      (prismaService.vendor.findFirst as jest.Mock).mockResolvedValue(mockVendor);
      
      console.log('👉 Step 1: Creating JWT payload');
      console.log('👉 Step 2: Getting full user details');
      console.log('👉 Step 3: User is vendor, fetching vendor details');
      console.log('👉 Step 4: Generating access token');
      
      const result = await service.login(vendorUser);
      
      console.log('📤 Login response with vendor info:', JSON.stringify(result.user.vendor, null, 2));
      
      expect(prismaService.vendor.findFirst).toHaveBeenCalledWith({
        where: { userId: vendorUser.id },
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
              name: true,
              description: true
            }
          }
        }
      });
      
      // Expect vendor info to be included in the response
      expect(result.user).toHaveProperty('vendor');
      expect(result.user.vendor).toHaveProperty('id', mockVendor.id);
      expect(result.user.vendor).toHaveProperty('shops');
      
      console.log('✅ Vendor login successful with vendor details');
    });

    it('should throw NotFoundException if user not found', async () => {
      console.log('\n❌ Testing login - user not found');
      
      // Create a copy with optional password
      const user = { ...mockUser, id: 999, password: mockUser.password as string | undefined };
      // Now we can safely delete the property
      user.password = undefined;
      
      // Mock user not found - fix the type annotation
      (userService.findOneById as jest.Mock).mockResolvedValue(null);
      
      console.log('👉 Step 1: Creating JWT payload');
      console.log('👉 Step 2: Looking up full user details - Not found');
      
      await expect(service.login(user)).rejects.toThrow(NotFoundException);
      
      expect(userService.findOneById).toHaveBeenCalledWith(user.id);
      
      console.log('✅ NotFoundException thrown as expected');
    });
  });

  describe('signUp', () => {
    it('should create a new user and return token', async () => {
      console.log('\n📝 Testing signUp - successful registration');
      
      // Remove 'role' since it's not in SignUpDto
      const signUpDto: SignUpDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      };
      
      // Mock username and email checks
      (userService.findOne as jest.Mock).mockResolvedValue(null);
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);
      
      // Mock user creation
      const createdUser = {
        id: 2,
        username: signUpDto.username,
        email: signUpDto.email,
        firstName: signUpDto.firstName,
        lastName: signUpDto.lastName,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      (userService.create as jest.Mock).mockResolvedValue(createdUser);
      
      console.log('👉 Step 1: Checking if username already exists');
      console.log('👉 Step 2: Checking if email already exists');
      console.log('👉 Step 3: Creating new user');
      console.log('👉 Step 4: Generating access token');
      
      const result = await service.signUp(signUpDto);
      
      console.log('📤 Signup response:', result);
      
      expect(userService.findOne).toHaveBeenCalledWith(signUpDto.username);
      expect(userService.findByEmail).toHaveBeenCalledWith(signUpDto.email);
      expect(userService.create).toHaveBeenCalledWith(
        signUpDto.username,
        signUpDto.email,
        signUpDto.password,
        signUpDto.firstName,
        signUpDto.lastName
      );
      
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: createdUser.username,
        sub: createdUser.id,
        role: createdUser.role
      });
      
      expect(result).toEqual({
        accessToken: 'mock-token',
        user: createdUser
      });
      
      console.log('✅ User created and token returned successfully');
    });

    it('should throw ConflictException if username exists', async () => {
      console.log('\n❌ Testing signUp - username conflict');
      
      // Remove 'role' since it's not in SignUpDto
      const signUpDto: SignUpDto = {
        username: 'existing',
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      };
      
      // Mock username already exists
      (userService.findOne as jest.Mock).mockResolvedValue({ username: 'existing' });
      
      console.log('👉 Step 1: Checking if username already exists - Conflict found');
      
      await expect(service.signUp(signUpDto)).rejects.toThrow(ConflictException);
      
      expect(userService.create).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
      
      console.log('✅ ConflictException thrown as expected for duplicate username');
    });

    it('should throw ConflictException if email exists', async () => {
      console.log('\n❌ Testing signUp - email conflict');
      
      // Remove 'role' since it's not in SignUpDto
      const signUpDto: SignUpDto = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      };
      
      // Mock username check passes but email exists
      (userService.findOne as jest.Mock).mockResolvedValue(null);
      (userService.findByEmail as jest.Mock).mockResolvedValue({ email: 'existing@example.com' });
      
      console.log('👉 Step 1: Checking if username already exists - OK');
      console.log('👉 Step 2: Checking if email already exists - Conflict found');
      
      await expect(service.signUp(signUpDto)).rejects.toThrow(ConflictException);
      
      expect(userService.findOne).toHaveBeenCalledWith(signUpDto.username);
      expect(userService.findByEmail).toHaveBeenCalledWith(signUpDto.email);
      expect(userService.create).not.toHaveBeenCalled();
      
      console.log('✅ ConflictException thrown as expected for duplicate email');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      console.log('\n🗑️ Testing deleteUser');
      
      const userId = 1;
      
      // Mock delete success
      (userService.delete as jest.Mock).mockResolvedValue(undefined);
      
      console.log('👉 Step 1: Deleting user with ID:', userId);
      
      await service.deleteUser(userId);
      
      expect(userService.delete).toHaveBeenCalledWith(userId);
      
      console.log('✅ User deleted successfully');
    });
  });

  describe('getMe', () => {
    it('should get user profile for regular user', async () => {
      console.log('\n📝 Testing getMe - regular user');
      
      const userId = 1;
      const userRole = 'user';
      
      // Mock user profile fetch
      (userService.getMe as jest.Mock).mockResolvedValue(mockUser);
      
      console.log('👉 Step 1: Detecting user role:', userRole);
      console.log('👉 Step 2: Fetching user profile');
      
      const result = await service.getMe(userId, userRole);
      
      // Add null check
      if (result) {
        console.log('📤 User profile:', result.username);
      }
      
      expect(userService.getMe).toHaveBeenCalledWith(userId);
      expect(adminService.getMe).not.toHaveBeenCalled();
      
      expect(result).toEqual(mockUser);
      
      console.log('✅ User profile retrieved successfully');
    });

    it('should get admin profile for admin user', async () => {
      console.log('\n📝 Testing getMe - admin user');
      
      const userId = 1;
      const userRole = 'admin';
      
      // Mock admin profile fetch
      (adminService.getMe as jest.Mock).mockResolvedValue(mockAdmin);
      
      console.log('👉 Step 1: Detecting user role:', userRole);
      console.log('👉 Step 2: Fetching admin profile');
      
      const result = await service.getMe(userId, userRole);
      
      // Add null check
      if (result) {
        console.log('📤 Admin profile:', result.username);
      }
      
      expect(adminService.getMe).toHaveBeenCalledWith(userId);
      expect(userService.getMe).not.toHaveBeenCalled();
      
      expect(result).toEqual(mockAdmin);
      
      console.log('✅ Admin profile retrieved successfully');
    });
  });

  describe('Authentication flow', () => {
    it('should demonstrate a complete auth flow', async () => {
      console.log('\n🔄 Demonstrating complete authentication flow');
      
      // Remove 'role' since it's not in SignUpDto
      const signUpDto: SignUpDto = {
        username: 'flowuser',
        email: 'flow@example.com',
        password: 'password123',
        firstName: 'Flow',
        lastName: 'User'
      };
      
      (userService.findOne as jest.Mock).mockResolvedValue(null);
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);
      
      const newUser = {
        id: 3,
        username: 'flowuser',
        email: 'flow@example.com',
        firstName: 'Flow',
        lastName: 'User',
        role: 'user',
        isDisabled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      (userService.create as jest.Mock).mockResolvedValue(newUser);
      
      // 2. Login - Setup mocks
      const loginUser = { ...newUser };
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue({
        ...loginUser,
        password: 'hashed-password'
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (userService.findOneById as jest.Mock).mockResolvedValue(loginUser);
      
      // 3. Get profile - Setup mocks
      (userService.getMe as jest.Mock).mockResolvedValue(loginUser);
      
      // 4. Delete user - Setup mocks
      (userService.delete as jest.Mock).mockResolvedValue(undefined);
      
      // Execute the flow
      console.log('👉 STEP 1: SIGN UP - Creating new user account');
      const signupResult = await service.signUp(signUpDto);
      console.log('   ✓ User registered with token:', signupResult.accessToken.substring(0, 10) + '...');
      
      console.log('👉 STEP 2: LOGIN - Authenticating with credentials');
      const validatedUser = await service.validateUser('flowuser', 'password123');
      console.log('   ✓ Credentials validated successfully');
      
      const loginResult = await service.login(validatedUser!);  // Add non-null assertion
      console.log('   ✓ User logged in with token:', loginResult.accessToken.substring(0, 10) + '...');
      
      console.log('👉 STEP 3: VERIFY PROFILE - Getting authenticated user profile');
      const profile = await service.getMe(loginUser.id, loginUser.role);
      // Add null check
      if (profile) {
        console.log('   ✓ Profile retrieved:', profile.username);
      }
      
      console.log('👉 STEP 4: ACCOUNT DELETION - Deleting user account');
      await service.deleteUser(loginUser.id);
      console.log('   ✓ Account deleted successfully');
      
      // Verify all operations were called
      expect(userService.create).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalled();
      expect(userService.getMe).toHaveBeenCalled();
      expect(userService.delete).toHaveBeenCalled();
      
      console.log('✅ Complete authentication flow demonstrated successfully');
    });
  });

  describe('Error handling', () => {
    it('should demonstrate comprehensive error handling', async () => {
      console.log('\n🛡️ Testing error handling in auth flows');
      
      // Set up mocks for various error scenarios
      console.log('👉 Testing signup with duplicate username');
      (userService.findOne as jest.Mock).mockResolvedValue({ username: 'existing' });
      
      // Remove 'role' since it's not in SignUpDto
      const signUpDto: SignUpDto = {
        username: 'existing',
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User'
      };
      
      try {
        await service.signUp(signUpDto);
      } catch (error) {
        console.log('   ✓ Error correctly caught:', (error as Error).message);
        expect(error).toBeInstanceOf(ConflictException);
      }
      
      console.log('👉 Testing login with invalid user ID');
      const invalidUser = { ...mockUser, id: 999 };
      (userService.findOneById as jest.Mock).mockResolvedValue(null);
      
      try {
        await service.login(invalidUser);
      } catch (error) {
        console.log('   ✓ Error correctly caught:', (error as Error).message);
        expect(error).toBeInstanceOf(NotFoundException);
      }
      
      console.log('👉 Testing password validation failure');
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue({
        ...mockUser,
        password: 'hashed-password'
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      const validationResult = await service.validateUser('testuser', 'wrong-password');
      console.log('   ✓ Invalid password correctly returns null');
      expect(validationResult).toBeNull();
      
      console.log('✅ Error handling tests passed successfully');
    });
  });
});