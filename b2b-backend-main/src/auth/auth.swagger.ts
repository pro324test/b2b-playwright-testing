import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, getSchemaPath } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserMeResponseDto } from '../user/dto/user-me-response.dto';
import { AdminMeResponseDto } from '../admin/dto/admin-me-response.dto';

export const LoginSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] User login',
      description: 'Public endpoint for user authentication'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Login successful',
      type: LoginResponseDto
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Unauthorized - Invalid credentials' 
    })
  );
};

export const SignUpSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] User signup',
      description: 'Public endpoint to create a new user account. Sends OTP for verification.'
    }),
    ApiResponse({ 
      status: 201, 
      description: 'Registration initiated. OTP sent for verification.' 
    }),
    ApiResponse({ 
      status: 409, 
      description: 'Conflict - Username, email, or phone number already exists' 
    })
  );
};

export const LogoutSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] User logout',
      description: 'Protected endpoint to logout authenticated users'
    }),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 200, 
      description: 'Logged out successfully, token invalidated' 
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Unauthorized - Invalid or missing token' 
    })
  );
};

export const DeleteUserSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Delete user account',
      description: 'Protected endpoint for users to delete their own account'
    }),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 200, 
      description: 'User account deleted successfully' 
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Unauthorized - Invalid or missing token' 
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Not Found - User account not found' 
    })
  );
};

export const GetMeSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: '[Authenticated] Get user profile',
      description: 'Get detailed information about the authenticated user'
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'User profile retrieved successfully',
      schema: {
        oneOf: [
          {
            type: 'object',
            properties: {
              id: { type: 'number', example: 5 },
              username: { type: 'string', example: 'johndoe' },
              email: { type: 'string', example: 'john@example.com' },
              firstName: { type: 'string', example: 'John' },
              lastName: { type: 'string', example: 'Doe' },
              role: { type: 'string', example: 'user' },
              vendor: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'number', example: 3 },
                  isDisabled: { type: 'boolean', example: false },
                  shops: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'number', example: 1 },
                        name: { type: 'string', example: 'Tech Shop' },
                        status: { type: 'string', example: 'enabled' }
                      }
                    }
                  }
                }
              }
            }
          },
          {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              username: { type: 'string', example: 'admin' },
              email: { type: 'string', example: 'admin@example.com' },
              firstName: { type: 'string', example: 'Admin' },
              lastName: { type: 'string', example: 'User' },
              role: { type: 'string', example: 'admin' },
              isDisabled: { type: 'boolean', example: false },
              createdAt: { type: 'string', format: 'date-time', example: '2025-01-01T00:00:00Z' }
            }
          }
        ]
      }
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'User not found' })
  );
};

export const VerifyRegistrationSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Verify registration OTP',
      description: 'Verify OTP sent during registration to complete the signup process'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Registration completed successfully. Returns auth token and user data.',
      type: LoginResponseDto
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Invalid OTP code' 
    }),
    ApiResponse({ 
      status: 404, 
      description: 'User not found' 
    })
  );
};

export const RequestLoginOtpSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Request login OTP',
      description: 'Send OTP code to registered phone number for authentication'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'OTP sent successfully', 
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'OTP sent successfully' },
          phoneNumber: { type: 'string', example: '218912345678' }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Phone number not registered' 
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Account disabled' 
    })
  );
};

export const LoginWithOtpSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Login with OTP',
      description: 'Authenticate using phone number and OTP instead of password'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Login successful',
      type: LoginResponseDto
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Invalid OTP' 
    }),
    ApiResponse({ 
      status: 404, 
      description: 'User not found' 
    })
  );
};

export const ForgotPasswordSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Request password reset',
      description: 'Send OTP to registered phone number for password reset verification'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Password reset OTP sent successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Password reset OTP sent successfully' },
          phoneNumber: { type: 'string', example: '218912345678' }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Phone number not registered' 
    })
  );
};

export const ResetPasswordSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Reset password with OTP',
      description: 'Reset password after OTP verification'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Password reset successful',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Password reset successful' },
          phoneNumber: { type: 'string', example: '218912345678' }
        }
      }
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Invalid OTP' 
    }),
    ApiResponse({ 
      status: 404, 
      description: 'User not found' 
    })
  );
};
