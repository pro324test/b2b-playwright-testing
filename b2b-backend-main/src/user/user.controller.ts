import { Controller, Get, UseGuards, Patch, Body, Req, NotFoundException, Param, ParseIntPipe, Delete, Query, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { 
  GetAllUsersSwagger, 
  UpdateUserSwagger, 
  GetMeSwagger, 
  GetUserByIdSwagger, 
  UpdateUserByAdminSwagger, 
  EnableUserSwagger,
  DisableUserSwagger,
  DeleteUserSwagger,
  GetAllVendorUsersSwagger
} from './user.swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GetAllUsersSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('all')
  async findAllUsers(@Query() paginationDto: PaginationDto) {
    return this.userService.findAll(paginationDto);
  }

  @GetAllVendorUsersSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('vendors')
  async findAllVendorUsers(@Query() paginationDto: PaginationDto) {
    return this.userService.findAllVendors(paginationDto);
  }

  @UpdateUserSwagger()
  @UseGuards(JwtAuthGuard)
  @Patch('update')
  async updateUser(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    // Explicitly check that we're using the token owner's ID
    const userId = req.user.userId;
    
    // Check if this is an admin token - we need to prevent admins from
    // accidentally updating their own profile when they meant to update another user
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      throw new BadRequestException(
        'Admins should use the /user/:id endpoint to update other users. ' +
        'This endpoint is only for users to update their own profiles.'
      );
    }
    
    return this.userService.updateUser(userId, updateUserDto);
  }

  @GetMeSwagger()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    const user = await this.userService.getMe(req.user.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // New endpoint to get a specific user by ID
  @GetUserByIdSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findUserById(id);
  }

  // New endpoint to update any user (admin only)
  @UpdateUserByAdminSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch(':id')
  async updateUserByAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserAdminDto: UpdateUserAdminDto
  ) {
    return this.userService.updateUserByAdmin(id, updateUserAdminDto);
  }

  // New endpoint to enable a user
  @EnableUserSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch(':id/enable')
  async enableUser(@Param('id', ParseIntPipe) id: number) {
    await this.userService.enableUser(id);
    return { message: 'User enabled successfully' };
  }

  // New endpoint to disable a user
  @DisableUserSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch(':id/disable')
  async disableUser(@Param('id', ParseIntPipe) id: number) {
    await this.userService.disableUser(id);
    return { message: 'User disabled successfully' };
  }

  // New endpoint to delete a user
  @DeleteUserSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.userService.deleteUserById(id);
    return { message: 'User deleted successfully' };
  }
}