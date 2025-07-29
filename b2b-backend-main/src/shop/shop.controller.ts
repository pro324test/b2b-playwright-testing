import { Controller, Post, Body, UseGuards, Req, Patch, Param, Get, ForbiddenException, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { RespondShopRequestDto } from './dto/respond-shop-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';

import {
  CreateShopSwagger,
  RespondShopRequestSwagger,
  GetAllShopRequestsSwagger,
  GetAllShopsPublicSwagger,
  GetAllShopsAdminSwagger,
  GetShopSwagger,
  UpdateShopSwagger,
  EnableShopSwagger,
  DisableShopSwagger,
  DeleteShopSwagger,
  GetVendorShopsSwagger,
  CheckPendingShopRequestSwagger,
  GetShopCitiesSwagger,
  GetShopsByCitySwagger
} from './shop.swagger';

@ApiTags('shop')
@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @CreateShopSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor')
  @Post()
  async createShop(@Req() req, @Body() createShopDto: CreateShopDto) {
    return this.shopService.createShop(req.user.userId, createShopDto);
  }

  @RespondShopRequestSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin')
  @Patch('respond/:id')
  async respondShopRequest(@Param('id') id: number, @Body() respondShopRequestDto: RespondShopRequestDto) {
    await this.shopService.respondShopRequest(id, respondShopRequestDto);
    return { message: `Shop request ${respondShopRequestDto.response}ed` }; // Changed from status to response
  }

  @GetAllShopRequestsSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin')
  @Get('requests')
  async getAllShopRequests(@Query() paginationDto: PaginationDto) {
    return this.shopService.getAllShopRequests(paginationDto);
  }

  @GetAllShopsPublicSwagger()
  @Get('all')
  async getAllShopsPublic(@Query() paginationDto: PaginationDto) {
    return this.shopService.getAllShopsPublic(paginationDto);
  }

  @GetAllShopsAdminSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('all/admin')
  async getAllShopsAdmin(
    @Query() paginationDto: PaginationDto,
    @Query('state') state?: 'PENDING' | 'ENABLED' | 'DISABLED' | 'REJECTED'
  ) {
    return this.shopService.getAllShopsAdmin(paginationDto, state);
  }

  @GetShopSwagger()
  @Get(':id')
  async getShop(@Param('id', ParseIntPipe) id: number) {
    return this.shopService.findOneShop(id);
  }

  @UpdateShopSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'admin', 'superadmin') // Allow access by both vendors and admins
  @Patch(':id')
  async updateShop(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShopDto: UpdateShopDto,
    @Req() req
  ) {
    // Check if the request is from an admin user (from Admin table)
    const isAdminUser = req.user.role === 'admin' || req.user.role === 'superadmin';
    
    // Pass the admin flag to the service
    return this.shopService.updateShop(id, updateShopDto, req.user.userId, isAdminUser);
  }

  @EnableShopSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin', 'vendor')  // Added 'vendor' role
  @Patch('enable/:id')
  async enableShop(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    // Check if it's a vendor request, pass the userId for ownership verification
    if (req.user.role === 'vendor') {
      await this.shopService.enableShop(id, req.user.userId);
    } else {
      // For admins, no need to check ownership
      await this.shopService.enableShop(id);
    }
    return { message: 'Shop enabled successfully' };
  }

  @DisableShopSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin', 'vendor')  // Added 'vendor' role
  @Patch('disable/:id')
  async disableShop(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    // Check if it's a vendor request, pass the userId for ownership verification
    if (req.user.role === 'vendor') {
      await this.shopService.disableShop(id, req.user.userId);
    } else {
      // For admins, no need to check ownership
      await this.shopService.disableShop(id);
    }
    return { message: 'Shop disabled successfully' };
  }

  @DeleteShopSwagger()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteShop(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    await this.shopService.deleteShop(id, req.user.userId);
    return { message: 'Shop deleted successfully' };
  }

  @GetVendorShopsSwagger()
  @Get('vendor/:id')
  @UseGuards(JwtAuthGuard)
  async getVendorShops(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Query() paginationDto: PaginationDto
  ) {
    return this.shopService.getVendorShops(id, req.user?.userId, paginationDto);
  }

  @Get('request/check')
  @UseGuards(JwtAuthGuard)
  @CheckPendingShopRequestSwagger()
  async checkPendingShopRequest(@Req() req) {
    return this.shopService.checkPendingShopRequest(req.user.userId);
  }

  @Get(':id/cities')
  @GetShopCitiesSwagger()
  async getShopCities(@Param('id', ParseIntPipe) id: number) {
    return this.shopService.getShopCities(id);
  }

  @Get('city/:cityId')
@GetShopsByCitySwagger()
async getShopsByCity(
  @Param('cityId', ParseIntPipe) cityId: number,
  @Query() paginationDto: PaginationDto
) {
  return this.shopService.getShopsInCity(cityId, paginationDto);
}
}