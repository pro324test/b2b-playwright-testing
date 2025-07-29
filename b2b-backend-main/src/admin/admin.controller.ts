import { Controller, Post, Get, Body, ConflictException, UseGuards, Res, HttpStatus, Req, Param, Delete, Patch, NotFoundException, UnauthorizedException, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { TokenBlacklistService } from '../auth/token-blacklist.service';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { VendorService } from '../vendor/vendor.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthService } from '../auth/auth.service';
import {
  CreateSuperAdminSwagger,
  CreateAdminSwagger,
  LoginAdminSwagger,
  LogoutAdminSwagger,
  DeleteAdminSwagger,
  DisableAdminSwagger,
  EnableAdminSwagger,
  GetAllAdminsSwagger,
  GetMeSwagger
} from './admin.swagger';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private tokenBlacklistService: TokenBlacklistService,
    private userService: UserService,
    private vendorService: VendorService,
  ) {}

  @CreateSuperAdminSwagger()
  @Post('create-super-admin')
  async createSuperAdmin(@Body() createSuperAdminDto: CreateSuperAdminDto) {
    const existingSuperAdmin = await this.adminService.findSuperAdmin();
    if (existingSuperAdmin) {
      throw new ConflictException('Super admin has already been created');
    }
    return this.adminService.createSuperAdmin(
      createSuperAdminDto.username,
      createSuperAdminDto.email,
      createSuperAdminDto.password,
      createSuperAdminDto.firstName,
      createSuperAdminDto.lastName,
      createSuperAdminDto.phoneNumber // Add phoneNumber parameter
    );
  }

  @CreateAdminSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Post('create')
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createAdmin(
      createAdminDto.username,
      createAdminDto.email,
      createAdminDto.password,
      createAdminDto.firstName,
      createAdminDto.lastName,
      createAdminDto.phoneNumber // Add phoneNumber parameter
    );
  }

  @LoginAdminSwagger()
  @Post('login')
  async login(@Body() loginAdminDto: LoginAdminDto) {
    // Check if login is by phone or identifier
    const identifier = loginAdminDto.identifier 
    if (!identifier) {
      throw new ConflictException('Username, email or phone number is required');
    }
    
    const admin = await this.adminService.validateAdmin(identifier, loginAdminDto.password);
    if (!admin) {
      throw new ConflictException('Invalid credentials');
    }
    
    if (admin.isDisabled) {
      throw new UnauthorizedException('Admin account is disabled');
    }

    return this.authService.login(admin);
  }

  @LogoutAdminSwagger()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req, @Res() res) {
    const token = req.headers.authorization.split(' ')[1];
    this.tokenBlacklistService.add(token);
    res.clearCookie('jwt', { httpOnly: true, secure: true });
    return res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
  }

  @DeleteAdminSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Delete('delete/:id')
  async deleteAdmin(@Param('id') id: number) {
    await this.adminService.deleteAdmin(id);
    return { message: 'Admin deleted successfully' };
  }

  @DisableAdminSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Patch('disable/:id')
  async disableAdmin(@Param('id') id: number) {
    await this.adminService.disableAdmin(id);
    return { message: 'Admin disabled successfully' };
  }

  @EnableAdminSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Patch('enable/:id')
  async enableAdmin(@Param('id') id: number) {
    await this.adminService.enableAdmin(id);
    return { message: 'Admin enabled successfully' };
  }

  @GetAllAdminsSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('admins')
  async findAllAdmins(@Query() paginationDto: PaginationDto) {
    return this.adminService.findAll(paginationDto);
  }

  @GetMeSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('me')
  async getMe(@Req() req) {
    if (!req.user?.adminId) {
      throw new UnauthorizedException('Invalid admin authentication');
    }
    
    return this.adminService.getMe(req.user.adminId);
  }
}