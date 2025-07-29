import { Injectable, Logger, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { SmsService } from '../sms/sms.service';
import { PrismaService } from '../prisma/prisma.service';
import { SmsTemplate } from '../sms/interfaces/sms.interface';
import { OtpMessages } from './otp-messages.constants';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly smsService: SmsService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Generate and send OTP
   * @param phoneNumber The phone number to send OTP to
   * @param type The type of OTP verification
   * @param lang Language for the SMS (ar or en)
   */
  async generateAndSendOTP(
    phoneNumber: string, 
    type: 'REGISTER' | 'PASSWORD_RESET' | 'LOGIN' = 'LOGIN',
    lang: string = 'ar'
  ): Promise<boolean> {
    try {
      // Invalidate any existing OTPs
      await this.invalidateExistingOTPs(phoneNumber, type);

      // Generate OTP
      const otp = this.smsService.generateOTP();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

      // Save OTP in database
      await this.prisma.otpVerification.create({
        data: {
          phoneNumber,
          otpCode: otp,
          type,
          expiresAt,
          attempts: 0
        }
      });

      // Send OTP via SMS with language preference
      const response = await this.smsService.sendTemplatedSms(
        phoneNumber,
        SmsTemplate.OTP,
        { otp },
        lang
      );

      if (!response.success) {
        throw new InternalServerErrorException({
          success: false,
          message: OtpMessages.ERROR.OTP_SEND_FAILED,
          statusCode: response.statusCode
        });
      }

      return response.success;
    } catch (error) {
      this.logger.error(`Failed to generate and send OTP: ${error.message}`, error.stack);
      
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException({
        success: false,
        message: OtpMessages.ERROR.OTP_GENERATION_ERROR,
        statusCode: 500
      });
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(phoneNumber: string, otpCode: string, type: 'REGISTER' | 'PASSWORD_RESET' | 'LOGIN' = 'LOGIN'): Promise<boolean> {
    try {
      const otpVerification = await this.prisma.otpVerification.findFirst({
        where: {
          phoneNumber,
          otpCode,
          type,
          expiresAt: { gt: new Date() },
          isVerified: false,
          attempts: { lt: 3 } // Maximum 3 attempts
        }
      });

      if (!otpVerification) {
        // Increment attempts for failed verifications
        await this.prisma.otpVerification.updateMany({
          where: { phoneNumber, type, isVerified: false },
          data: { attempts: { increment: 1 } }
        });
        
        throw new UnauthorizedException({
          success: false,
          message: OtpMessages.ERROR.OTP_INVALID,
          statusCode: 401
        });
      }

      // Mark OTP as verified
      await this.prisma.otpVerification.update({
        where: { id: otpVerification.id },
        data: { isVerified: true, verifiedAt: new Date() }
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to verify OTP: ${error.message}`, error.stack);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException({
        success: false,
        message: OtpMessages.ERROR.OTP_VERIFICATION_ERROR,
        statusCode: 500
      });
    }
  }

  /**
   * Validate OTP without marking it as used
   */
  async validateOTP(phoneNumber: string, otpCode: string, type: 'REGISTER' | 'PASSWORD_RESET' | 'LOGIN' = 'LOGIN'): Promise<boolean> {
    try {
      const otpVerification = await this.prisma.otpVerification.findFirst({
        where: {
          phoneNumber,
          otpCode,
          type,
          expiresAt: { gt: new Date() },
          isVerified: false,
          attempts: { lt: 3 } // Maximum 3 attempts
        }
      });

      if (!otpVerification) {
        throw new UnauthorizedException({
          success: false,
          message: OtpMessages.ERROR.OTP_INVALID,
          statusCode: 401
        });
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to validate OTP: ${error.message}`, error.stack);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException({
        success: false,
        message: OtpMessages.ERROR.OTP_VERIFICATION_ERROR,
        statusCode: 500
      });
    }
  }

  /**
   * Invalidate any existing OTPs for a phone number and type
   */
  async invalidateExistingOTPs(phoneNumber: string, type: 'REGISTER' | 'PASSWORD_RESET' | 'LOGIN'): Promise<void> {
    try {
      await this.prisma.otpVerification.updateMany({
        where: { 
          phoneNumber, 
          type,
          isVerified: false
        },
        data: { 
          expiresAt: new Date() // Expire any existing codes
        }
      });
    } catch (error) {
      this.logger.error(`Failed to invalidate OTPs: ${error.message}`, error.stack);
      
      throw new InternalServerErrorException({
        success: false,
        message: OtpMessages.ERROR.OTP_INVALIDATION_ERROR,
        statusCode: 500
      });
    }
  }

  /**
   * Check if phone number has been verified
   */
  async isPhoneVerified(phoneNumber: string): Promise<boolean> {
    try {
      // Check if there's any verified OTP for this phone number
      const verifiedOtp = await this.prisma.otpVerification.findFirst({
        where: {
          phoneNumber,
          isVerified: true
        }
      });

      return !!verifiedOtp;
    } catch (error) {
      this.logger.error(`Failed to check phone verification status: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Get latest OTP for testing/debugging (NOT FOR PRODUCTION)
   */
  async getLatestOtp(phoneNumber: string, type: 'REGISTER' | 'PASSWORD_RESET' | 'LOGIN' = 'LOGIN'): Promise<string | null> {
    // This method should be used only in development for testing purposes
    if (process.env.NODE_ENV === 'production') {
      this.logger.warn('getLatestOtp called in production environment');
      return null;
    }

    try {
      const latestOtp = await this.prisma.otpVerification.findFirst({
        where: {
          phoneNumber,
          type,
          isVerified: false,
          expiresAt: { gt: new Date() }
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          otpCode: true
        }
      });

      return latestOtp?.otpCode || null;
    } catch (error) {
      this.logger.error(`Failed to get latest OTP: ${error.message}`, error.stack);
      return null;
    }
  }
}