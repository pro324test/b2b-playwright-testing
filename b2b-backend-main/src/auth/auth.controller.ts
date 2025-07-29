import { Controller, Request, Post, UseGuards, Body, Res, HttpStatus, Delete, Req, Get, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { TokenBlacklistService } from './token-blacklist.service';
import {
  LoginSwagger,
  SignUpSwagger,
  LogoutSwagger,
  DeleteUserSwagger,
  GetMeSwagger,
  VerifyRegistrationSwagger,
  RequestLoginOtpSwagger,
  LoginWithOtpSwagger,
  ForgotPasswordSwagger,
  ResetPasswordSwagger
} from './auth.swagger';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { VerifyRegistrationDto } from './dto/verify-registration.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  @LoginSwagger()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @SignUpSwagger()
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @LogoutSwagger()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req, @Res() res) {
    const token = req.headers.authorization.split(' ')[1];
    this.tokenBlacklistService.add(token);
    res.clearCookie('jwt', { httpOnly: true, secure: true });
    return res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
  }

  @DeleteUserSwagger()
  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  async deleteUser(@Request() req) {
    await this.authService.deleteUser(req.user.userId);
    return { message: 'User account deleted successfully' };
  }

  @GetMeSwagger()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    const user = await this.authService.getMe(req.user.userId, req.user.role);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @VerifyRegistrationSwagger()
  @Post('verify-registration')
  async verifyRegistration(@Body() verifyRegistrationDto: VerifyRegistrationDto) {
    return this.authService.verifyRegistration(verifyRegistrationDto);
  }

  @RequestLoginOtpSwagger()
  @Post('request-login-otp')
  async requestLoginOtp(@Body() requestOtpDto: RequestOtpDto) {
    return this.authService.requestLoginOtp(requestOtpDto);
  }

  @LoginWithOtpSwagger()
  @Post('login-with-otp')
  async loginWithOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.loginWithOtp(verifyOtpDto);
  }

  @ForgotPasswordSwagger()
  @Post('forgot-password')
  async forgotPassword(@Body() requestOtpDto: RequestOtpDto) {
    return this.authService.requestPasswordResetOtp(requestOtpDto);
  }

  @ResetPasswordSwagger()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}