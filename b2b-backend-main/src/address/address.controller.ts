import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    Query,
    ParseIntPipe,
  } from '@nestjs/common';
  import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
  import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
  import { RolesGuard } from '../common/guards/roles.guard';
  import { Roles } from '../common/decorators/roles.decorator';
  import { UserAddressService } from './user-address.service';
  import { ShopAddressService } from './shop-address.service';
  import { CreateUserAddressDto, UpdateUserAddressDto } from './dto/user-address.dto';
  import { CreateShopAddressDto, UpdateShopAddressDto } from './dto/shop-address.dto';
  import { 
    CreateUserAddressSwagger,
    GetUserAddressesSwagger,
    GetUserAddressSwagger,
    UpdateUserAddressSwagger,
    SetDefaultUserAddressSwagger,
    DeleteUserAddressSwagger,
    CreateShopAddressSwagger,
    GetShopAddressesSwagger,
    GetShopAddressSwagger,
    UpdateShopAddressSwagger,
    SetDefaultShopAddressSwagger,
    DeleteShopAddressSwagger,
  } from './address.swagger';
  
  @ApiTags('address')
  @Controller('address')
  export class AddressController {
    constructor(
      private readonly userAddressService: UserAddressService,
      private readonly shopAddressService: ShopAddressService,
    ) {}
  
    // User Address Endpoints
    
    @Post('user')
    @UseGuards(JwtAuthGuard)
    @CreateUserAddressSwagger()
    async createUserAddress(@Body() createUserAddressDto: CreateUserAddressDto, @Req() req) {
      return this.userAddressService.create(req.user.userId, createUserAddressDto);
    }
  
    @Get('user')
    @UseGuards(JwtAuthGuard)
    @GetUserAddressesSwagger()
    async getUserAddresses(@Req() req) {
      return this.userAddressService.findAll(req.user.userId);
    }
  
    @Get('user/:id')
    @UseGuards(JwtAuthGuard)
    @GetUserAddressSwagger()
    async getUserAddress(@Param('id', ParseIntPipe) id: number, @Req() req) {
      return this.userAddressService.findOne(id, req.user.userId);
    }
  
    @Patch('user/:id')
    @UseGuards(JwtAuthGuard)
    @UpdateUserAddressSwagger()
    async updateUserAddress(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateUserAddressDto: UpdateUserAddressDto,
      @Req() req,
    ) {
      return this.userAddressService.update(id, req.user.userId, updateUserAddressDto);
    }
  
    @Patch('user/:id/default')
    @UseGuards(JwtAuthGuard)
    @SetDefaultUserAddressSwagger()
    async setDefaultUserAddress(@Param('id', ParseIntPipe) id: number, @Req() req) {
      return this.userAddressService.setDefault(id, req.user.userId);
    }
  
    @Delete('user/:id')
    @UseGuards(JwtAuthGuard)
    @DeleteUserAddressSwagger()
    async removeUserAddress(@Param('id', ParseIntPipe) id: number, @Req() req) {
      return this.userAddressService.remove(id, req.user.userId);
    }
  
    // Shop Address Endpoints
  
    @Post('shop')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor')
    @CreateShopAddressSwagger()
    async createShopAddress(@Body() createShopAddressDto: CreateShopAddressDto, @Req() req) {
      return this.shopAddressService.create(createShopAddressDto, req.user.userId);
    }
  
    @Get('shop/:shopId')
    @UseGuards(JwtAuthGuard)
    @GetShopAddressesSwagger()
    async getShopAddresses(@Param('shopId', ParseIntPipe) shopId: number) {
      return this.shopAddressService.findAll(shopId);
    }
  
    @Get('shop/:shopId/:id')
    @UseGuards(JwtAuthGuard)
    @GetShopAddressSwagger()
    async getShopAddress(
      @Param('shopId', ParseIntPipe) shopId: number,
      @Param('id', ParseIntPipe) id: number,
    ) {
      return this.shopAddressService.findOne(id, shopId);
    }
  
    @Patch('shop/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor')
    @UpdateShopAddressSwagger()
    async updateShopAddress(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateShopAddressDto: UpdateShopAddressDto,
      @Body('shopId', ParseIntPipe) shopId: number,  // Extract shopId from body explicitly
      @Req() req,
    ) {
      // Now use the extracted shopId parameter instead of trying to access it from the DTO
      return this.shopAddressService.update(id, shopId, updateShopAddressDto, req.user.userId);
    }
  
    @Patch('shop/:id/default')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor')
    @SetDefaultShopAddressSwagger()
    async setDefaultShopAddress(
      @Param('id', ParseIntPipe) id: number,
      @Body('shopId', ParseIntPipe) shopId: number,
      @Req() req,
    ) {
      return this.shopAddressService.setDefault(id, shopId, req.user.userId);
    }
  
    @Delete('shop/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor')
    @DeleteShopAddressSwagger()
    async removeShopAddress(
      @Param('id', ParseIntPipe) id: number,
      @Body('shopId', ParseIntPipe) shopId: number,
      @Req() req,
    ) {
      return this.shopAddressService.remove(id, shopId, req.user.userId);
    }
  }