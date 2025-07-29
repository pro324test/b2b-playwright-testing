import { ConflictException, Injectable, NotFoundException, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SignUpDto } from './dto/signup.dto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AdminService } from '../admin/admin.service';
import { OtpService } from '../otp/otp.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { VerifyRegistrationDto } from './dto/verify-registration.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

// In-memory store for pending registrations (phoneNumber -> registration data)
const pendingRegistrations = new Map<string, any>();

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private adminService: AdminService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private otpService: OtpService
  ) {}

  async validateUser(identifier: string, password: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
          { phoneNumber: identifier },
        ],
      },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      username: user.username, 
      sub: user.id,
      role: user.role 
    };

    const userDetails = await this.userService.findOneById(user.id);
    if (!userDetails) {
      throw new NotFoundException('User not found');
    }

    let vendorInfo: any = undefined;
    if (user.role === 'vendor') {
      const vendor = await this.prisma.vendor.findFirst({
        where: { userId: user.id },
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

      if (vendor) {
        vendorInfo = {
          id: vendor.id,
          isDisabled: vendor.isDisabled,
          shops: vendor.shops.map(shop => ({
            id: shop.id,
            name: shop.name,
            status: shop.status
          }))
        };
      }
    }

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        ...userDetails,
        vendor: vendorInfo
      }
    };
  }

  async signUp(signUpDto: SignUpDto) {
    const { username, email, phoneNumber, password, firstName, lastName } = signUpDto;

    // Check if username exists
    const existingUser = await this.userService.findOne(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Check if email exists (if provided)
    if (email) {
      const existingEmail = await this.userService.findByEmail(email);
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check if phone number exists
    const existingPhone = await this.prisma.user.findFirst({
      where: { phoneNumber }
    });

    if (existingPhone) {
      throw new ConflictException('Phone number already exists');
    }

    // Hash the password and store registration data in memory
    const hashedPassword = await bcrypt.hash(password, 10);
    pendingRegistrations.set(phoneNumber, {
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      firstName,
      lastName,
    });

    // Generate and send OTP for verification
    await this.otpService.generateAndSendOTP(phoneNumber, 'REGISTER');

    return {
      success: true,
      message: 'Registration initiated. Please verify your phone number with the OTP sent.',
      phoneNumber,
    };
  }

  async verifyRegistration(verifyRegistrationDto: VerifyRegistrationDto) {
    const { phoneNumber, otpCode } = verifyRegistrationDto;

    // Verify the OTP
    const isVerified = await this.otpService.verifyOTP(phoneNumber, otpCode, 'REGISTER');
    if (!isVerified) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Get registration data from memory
    const regData = pendingRegistrations.get(phoneNumber);
    if (!regData) {
      throw new NotFoundException('No pending registration found for this phone number');
    }

    // Create user in DB
    const user = await this.prisma.user.create({
      data: {
        ...regData,
      }
    });

    // Remove from pending registrations
    pendingRegistrations.delete(phoneNumber);

    // Generate token now that the user is verified
    const payload = { 
      username: user.username, 
      sub: user.id,
      role: user.role 
    };

    // Get full user details
    const userDetails = await this.userService.findOneById(user.id);

    // Return token and user data
    return {
      accessToken: this.jwtService.sign(payload),
      user: userDetails
    };
  }

  async requestLoginOtp(requestOtpDto: RequestOtpDto) {
    const { phoneNumber, lang } = requestOtpDto;

    // Verify phone number exists in the system
    const user = await this.prisma.user.findFirst({
      where: { phoneNumber }
    });

    if (!user) {
      throw new NotFoundException('Phone number not registered');
    }

    if (user.isDisabled) {
      throw new ForbiddenException('Your account has been disabled');
    }

    // Generate and send OTP
    const success = await this.otpService.generateAndSendOTP(phoneNumber, 'LOGIN', lang);

    return {
      success,
      message: 'OTP sent successfully',
      phoneNumber
    };
  }

  async loginWithOtp(verifyOtpDto: VerifyOtpDto) {
    const { phoneNumber, otpCode } = verifyOtpDto;

    // Verify OTP
    const isVerified = await this.otpService.verifyOTP(phoneNumber, otpCode, 'LOGIN');
    if (!isVerified) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Find user by phone number
    const user = await this.prisma.user.findFirst({
      where: { phoneNumber }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isDisabled) {
      throw new ForbiddenException('Your account has been disabled');
    }

    // Use existing login logic by reusing the login method
    return this.login(user);
  }

  async requestPasswordResetOtp(requestOtpDto: RequestOtpDto) {
    const { phoneNumber, lang } = requestOtpDto;

    // Check if user with this phone number exists
    const user = await this.prisma.user.findFirst({
      where: { phoneNumber }
    });

    if (!user) {
      throw new NotFoundException('Phone number not registered');
    }

    // Generate and send OTP
    const success = await this.otpService.generateAndSendOTP(phoneNumber, 'PASSWORD_RESET', lang);

    return {
      success,
      message: 'Password reset OTP sent successfully',
      phoneNumber
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { phoneNumber, otpCode, newPassword } = resetPasswordDto;

    // Verify OTP
    const isVerified = await this.otpService.verifyOTP(phoneNumber, otpCode, 'PASSWORD_RESET');
    if (!isVerified) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Find user by phone number
    const user = await this.prisma.user.findFirst({
      where: { phoneNumber }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return {
      success: true,
      message: 'Password reset successful',
      phoneNumber
    };
  }

  async deleteUser(userId: number): Promise<void> {
    await this.userService.delete(userId);
  }

  async getMe(userId: number, role: string) {
    if (role.includes('admin')) {
      return this.adminService.getMe(userId);
    } else {
      return this.userService.getMe(userId);
    }
  }
}