import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { NotFoundException } from '@nestjs/common';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let tokenBlacklistService: TokenBlacklistService;

  const mockAuthService = {
    login: jest.fn(),
    signUp: jest.fn(),
    deleteUser: jest.fn(),
    getMe: jest.fn()
  };

  const mockTokenBlacklistService = {
    add: jest.fn()
  };

  // Mock user data
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'user'
  };

  // Mock token
  const mockToken = 'mock-jwt-token';

  beforeEach(async () => {
    console.log('🏗️ Setting up AuthController test environment');

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: TokenBlacklistService,
          useValue: mockTokenBlacklistService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    tokenBlacklistService = module.get<TokenBlacklistService>(TokenBlacklistService);
    
    console.log('✅ Test setup complete');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    console.log('✅ AuthController is defined');
  });

  describe('login', () => {
    it('should return login response with token', async () => {
      console.log('\n📝 Testing login endpoint');
      
      const loginDto: LoginDto = {
        identifier: 'testuser',
        password: 'password123'
      };

      const req = {
        user: mockUser
      };

      const expectedResponse = {
        accessToken: mockToken,
        user: mockUser
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);
      
      console.log('👉 Step 1: Calling login with user from request');
      
      const result = await controller.login(req, loginDto);
      
      console.log('📤 Login response:', result);
      
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(expectedResponse);
      
      console.log('✅ Login endpoint working correctly');
    });
  });

  describe('signUp', () => {
    it('should create a new user and return token', async () => {
      console.log('\n📝 Testing signup endpoint');
      
      const signUpDto: SignUpDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      };

      const expectedResponse = {
        accessToken: mockToken,
        user: {
          id: 2,
          username: 'newuser',
          email: 'new@example.com',
          firstName: 'New',
          lastName: 'User',
          role: 'user'
        }
      };

      mockAuthService.signUp.mockResolvedValue(expectedResponse);
      
      console.log('👉 Step 1: Calling signUp with user data');
      
      const result = await controller.signUp(signUpDto);
      
      console.log('📤 SignUp response:', result);
      
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
      expect(result).toEqual(expectedResponse);
      
      console.log('✅ SignUp endpoint working correctly');
    });
  });

  describe('logout', () => {
    it('should blacklist token and clear cookie', async () => {
      console.log('\n📝 Testing logout endpoint');
      
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

      console.log('👉 Step 1: Extracting token from authorization header');
      console.log('👉 Step 2: Adding token to blacklist');
      console.log('👉 Step 3: Clearing cookies and returning response');
      
      await controller.logout(req, res);
      
      expect(tokenBlacklistService.add).toHaveBeenCalledWith(mockToken);
      expect(res.clearCookie).toHaveBeenCalledWith('jwt', { httpOnly: true, secure: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
      
      console.log('✅ Logout endpoint working correctly');
    });
  });

  describe('deleteUser', () => {
    it('should delete the current user', async () => {
      console.log('\n📝 Testing deleteUser endpoint');
      
      const req = {
        user: {
          userId: 1
        }
      };

      mockAuthService.deleteUser.mockResolvedValue(undefined);
      
      console.log('👉 Step 1: Calling deleteUser with userId from request');
      
      const result = await controller.deleteUser(req);
      
      console.log('📤 DeleteUser response:', result);
      
      expect(authService.deleteUser).toHaveBeenCalledWith(req.user.userId);
      expect(result).toEqual({ message: 'User account deleted successfully' });
      
      console.log('✅ DeleteUser endpoint working correctly');
    });
  });

  describe('getMe', () => {
    it('should return the current user profile', async () => {
      console.log('\n📝 Testing getMe endpoint');
      
      const req = {
        user: {
          userId: 1,
          role: 'user'
        }
      };

      mockAuthService.getMe.mockResolvedValue(mockUser);
      
      console.log('👉 Step 1: Calling getMe with userId and role from request');
      
      const result = await controller.getMe(req);
      
      console.log('📤 GetMe response:', result);
      
      expect(authService.getMe).toHaveBeenCalledWith(req.user.userId, req.user.role);
      expect(result).toEqual(mockUser);
      
      console.log('✅ GetMe endpoint working correctly');
    });

    it('should throw NotFoundException when user not found', async () => {
      console.log('\n❌ Testing getMe endpoint with non-existent user');
      
      const req = {
        user: {
          userId: 999,
          role: 'user'
        }
      };

      mockAuthService.getMe.mockResolvedValue(null);
      
      console.log('👉 Step 1: Calling getMe with non-existent userId');
      
      await expect(controller.getMe(req)).rejects.toThrow(NotFoundException);
      
      expect(authService.getMe).toHaveBeenCalledWith(req.user.userId, req.user.role);
      
      console.log('✅ NotFoundException thrown as expected');
    });
  });

  describe('Error handling', () => {
    it('should forward errors from AuthService during signup', async () => {
      console.log('\n❌ Testing error handling in signup endpoint');
      
      const signUpDto: SignUpDto = {
        username: 'existing',
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User'
      };

      const mockError = new Error('Username already exists');
      mockAuthService.signUp.mockRejectedValue(mockError);
      
      console.log('👉 Step 1: Calling signUp with data that will cause error');
      
      await expect(controller.signUp(signUpDto)).rejects.toThrow(mockError);
      
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
      
      console.log('✅ Error properly propagated from service');
    });
  });

  describe('Authentication flow', () => {
    it('should demonstrate a complete auth flow', async () => {
      console.log('\n🔄 Demonstrating complete auth controller flow');
      
      // Setup DTOs and mock responses
      const signUpDto: SignUpDto = {
        username: 'flowuser',
        email: 'flow@example.com',
        password: 'password123',
        firstName: 'Flow',
        lastName: 'User'
      };
      
      const loginDto: LoginDto = {
        identifier: 'flowuser',
        password: 'password123'
      };

      const newUser = {
        id: 3,
        username: 'flowuser',
        email: 'flow@example.com',
        firstName: 'Flow',
        lastName: 'User',
        role: 'user'
      };

      const authResponse = {
        accessToken: 'auth-token',
        user: newUser
      };
      
      // Setup mocks
      mockAuthService.signUp.mockResolvedValue(authResponse);
      mockAuthService.login.mockResolvedValue(authResponse);
      mockAuthService.getMe.mockResolvedValue(newUser);
      mockAuthService.deleteUser.mockResolvedValue(undefined);
      
      console.log('👉 STEP 1: SIGN UP - Creating new user account');
      const signupResult = await controller.signUp(signUpDto);
      console.log('   ✓ User registered with token:', signupResult.accessToken);
      
      console.log('👉 STEP 2: LOGIN - Authenticating with credentials');
      const req = { user: newUser };
      const loginResult = await controller.login(req, loginDto);
      console.log('   ✓ User logged in with token:', loginResult.accessToken);
      
      console.log('👉 STEP 3: GET PROFILE - Retrieving user profile');
      const profileReq = { user: { userId: newUser.id, role: newUser.role } };
      const profile = await controller.getMe(profileReq);
      console.log('   ✓ Profile retrieved:', profile.username);
      
      console.log('👉 STEP 4: LOGOUT - Ending user session');
      const logoutReq = { headers: { authorization: `Bearer ${authResponse.accessToken}` } };
      const res = {
        clearCookie: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as unknown as Response;
      await controller.logout(logoutReq, res);
      console.log('   ✓ User logged out successfully');
      
      console.log('👉 STEP 5: DELETE ACCOUNT - Removing user account');
      const deleteReq = { user: { userId: newUser.id } };
      const deleteResult = await controller.deleteUser(deleteReq);
      console.log('   ✓ Account deleted successfully');
      
      // Verify all operations were called
      expect(mockAuthService.signUp).toHaveBeenCalled();
      expect(mockAuthService.login).toHaveBeenCalled();
      expect(mockAuthService.getMe).toHaveBeenCalled();
      expect(mockTokenBlacklistService.add).toHaveBeenCalled();
      expect(mockAuthService.deleteUser).toHaveBeenCalled();
      
      console.log('✅ Complete authentication flow demonstrated successfully');
    });
  });
});