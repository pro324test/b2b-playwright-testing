// src/coupon/coupon.controller.ts
import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    UseGuards, 
    Query, 
    ParseIntPipe, 
    Req, 
    BadRequestException,
    NotFoundException,
    ForbiddenException
  } from '@nestjs/common';
  import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
  import { CouponService } from './coupon.service';
  import { CreateCouponDto } from './dto/create-coupon.dto';
  import { UpdateCouponDto } from './dto/update-coupon.dto';
  import { ApplyCouponDto } from './dto/apply-coupon.dto';
  import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
  import { RolesGuard } from '../common/guards/roles.guard';
  import { Roles } from '../common/decorators/roles.decorator';
  import { PaginationDto } from '../common/dto/pagination.dto';
  import { PrismaService } from '../prisma/prisma.service';
  import {
    CreateCouponSwagger,
    GetAllCouponsSwagger,
    GetShopCouponsSwagger,
    GetCouponByIdSwagger,
    UpdateCouponSwagger,
    EnableCouponSwagger,
    DisableCouponSwagger,
    DeleteCouponSwagger,
    ApplyCouponSwagger,
    RemoveCouponSwagger,
    GetVendorCouponsSwagger
  } from './coupon.swagger';
  
  @ApiTags('coupons')
  @Controller('coupons')
  @ApiBearerAuth()
  export class CouponController {
    constructor(
      private readonly couponService: CouponService,
      private readonly prisma: PrismaService
    ) {}
  
    @Post()
    @CreateCouponSwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor', 'admin', 'superadmin')
    async create(@Body() createCouponDto: CreateCouponDto, @Req() req) {
      let vendorId: number | undefined;
    
      // For admin users - must specify a vendor
      if (req.user.role === 'admin' || req.user.role === 'superadmin') {
        // Admins MUST specify a vendor
        if (!createCouponDto.onBehalfOfVendorId) {
          throw new BadRequestException('Admin users must specify a vendor using onBehalfOfVendorId');
        }
        
        // Validate the vendor exists
        const vendor = await this.prisma.vendor.findUnique({
          where: { id: createCouponDto.onBehalfOfVendorId }
        });
        
        if (!vendor) {
          throw new NotFoundException(`Vendor with ID ${createCouponDto.onBehalfOfVendorId} not found`);
        }
        
        vendorId = vendor.id;
      } 
      // For vendor users - determine their vendor ID
      else if (req.user.role === 'vendor') {
        // Get the vendor record for this user
        const vendor = await this.prisma.vendor.findFirst({
          where: { userId: req.user.userId }
        });
        
        if (!vendor) {
          throw new BadRequestException('Vendor profile not found');
        }
        
        vendorId = vendor.id;
    
        // If shop is specified, validate ownership
        if (createCouponDto.shopIds && createCouponDto.shopIds.length > 0) {
          // Check if the vendor owns the first shop in the array
          const shop = await this.prisma.shop.findFirst({
            where: {
              id: createCouponDto.shopIds[0],
              vendor: {
                userId: req.user.userId
              }
            }
          });
          
          if (!shop) {
            throw new BadRequestException('You can only create coupons for your own shops');
          }
        }
      }
      
      return this.couponService.create(createCouponDto, req.user.userId, req.user.role, vendorId);
    }
  
    @Get()
    @GetAllCouponsSwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    async findAll(@Query() paginationDto: PaginationDto) {
      return this.couponService.findAll(undefined, undefined, paginationDto);
    }

    @Get('vendor/:vendorId')
    @GetVendorCouponsSwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin', 'vendor')
    async findVendorCoupons(
      @Param('vendorId', ParseIntPipe) vendorId: number,
      @Query() paginationDto: PaginationDto,
      @Req() req
    ) {
      // If vendor, check if they are requesting their own coupons
      if (req.user.role === 'vendor') {
        const vendor = await this.prisma.vendor.findFirst({
          where: {
            userId: req.user.userId
          }
        });
        
        if (!vendor || vendor.id !== vendorId) {
          throw new ForbiddenException('You can only view your own coupons');
        }
      }
      
      return this.couponService.findAll(undefined, vendorId, paginationDto);
    }
  
    @Get('shop/:shopId')
    @GetShopCouponsSwagger()
    @UseGuards(JwtAuthGuard)
    async findShopCoupons(
      @Param('shopId', ParseIntPipe) shopId: number,
      @Query() paginationDto: PaginationDto,
      @Req() req
    ) {
      // If vendor, check if they own the shop
      if (req.user.role === 'vendor') {
        const shop = await this.prisma.shop.findFirst({
          where: {
            id: shopId,
            vendor: {
              userId: req.user.userId
            }
          }
        });
        
        if (!shop) {
          throw new BadRequestException('You can only view coupons for your own shops');
        }
      }
      
      return this.couponService.findAll(shopId, undefined, paginationDto);
    }
  
    @Get(':id')
    @GetCouponByIdSwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor', 'admin', 'superadmin')
    async findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
      const coupon = await this.couponService.findOne(id);
      
      // If vendor, check if they own the shop associated with coupon
      if (req.user.role === 'vendor' && coupon.shopId) {
        const shop = await this.prisma.shop.findFirst({
          where: {
            id: coupon.shopId,
            vendor: {
              userId: req.user.userId
            }
          }
        });
        
        if (!shop) {
          throw new BadRequestException('You can only view coupons for your own shops');
        }
      }
      
      return coupon;
    }
  
    @Patch(':id')
    @UpdateCouponSwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor', 'admin', 'superadmin')
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateCouponDto: UpdateCouponDto,
      @Req() req
    ) {
      // Get current coupon to check ownership
      const coupon = await this.couponService.findOne(id);
      
      // If vendor, check if they own the shop associated with coupon
      if (req.user.role === 'vendor') {
        // Current shop check
        if (coupon.shopId) {
          const currentShop = await this.prisma.shop.findFirst({
            where: {
              id: coupon.shopId,
              vendor: {
                userId: req.user.userId
              }
            }
          });
          
          if (!currentShop) {
            throw new BadRequestException('You can only update coupons for your own shops');
          }
        }
        
        // Target shop check if changing shop
        if (updateCouponDto.shopIds && updateCouponDto.shopIds.length > 0 && 
          (!coupon.shopId || !updateCouponDto.shopIds.includes(coupon.shopId))) {
        // Check if the vendor owns the first shop in the array
        const shop = await this.prisma.shop.findFirst({
          where: {
            id: updateCouponDto.shopIds[0],
            vendor: {
              userId: req.user.userId
            }
          }
        });
      }
      }
      
      return this.couponService.update(id, updateCouponDto);
    }
  
    @Patch(':id/enable')
    @EnableCouponSwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor', 'admin', 'superadmin')
    async enable(@Param('id', ParseIntPipe) id: number, @Req() req) {
      // Get current coupon to check ownership
      const coupon = await this.couponService.findOne(id);
      
      // If vendor, check if they own the shop associated with coupon
      if (req.user.role === 'vendor' && coupon.shopId) {
        const shop = await this.prisma.shop.findFirst({
          where: {
            id: coupon.shopId,
            vendor: {
              userId: req.user.userId
            }
          }
        });
        
        if (!shop) {
          throw new BadRequestException('You can only enable coupons for your own shops');
        }
      }
      
      return this.couponService.enable(id);
    }
  
    @Patch(':id/disable')
    @DisableCouponSwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor', 'admin', 'superadmin')
    async disable(@Param('id', ParseIntPipe) id: number, @Req() req) {
      // Get current coupon to check ownership
      const coupon = await this.couponService.findOne(id);
      
      // If vendor, check if they own the shop associated with coupon
      if (req.user.role === 'vendor' && coupon.shopId) {
        const shop = await this.prisma.shop.findFirst({
          where: {
            id: coupon.shopId,
            vendor: {
              userId: req.user.userId
            }
          }
        });
        
        if (!shop) {
          throw new BadRequestException('You can only disable coupons for your own shops');
        }
      }
      
      return this.couponService.disable(id);
    }
  
    @Delete(':id')
    @DeleteCouponSwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor', 'admin', 'superadmin')
    async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
      // Get current coupon to check ownership
      const coupon = await this.couponService.findOne(id);
      
      // If vendor, check if they own the shop associated with coupon
      if (req.user.role === 'vendor' && coupon.shopId) {
        const shop = await this.prisma.shop.findFirst({
          where: {
            id: coupon.shopId,
            vendor: {
              userId: req.user.userId
            }
          }
        });
        
        if (!shop) {
          throw new BadRequestException('You can only delete coupons for your own shops');
        }
      }
      
      return this.couponService.remove(id);
    }
  
    // Customer cart coupon endpoints
    
    @Post('cart/:cartId/apply')
    @ApplyCouponSwagger()
    @UseGuards(JwtAuthGuard)
    async applyCouponToCart(
      @Param('cartId', ParseIntPipe) cartId: number,
      @Body() applyCouponDto: ApplyCouponDto,
      @Req() req
    ) {
      return this.couponService.applyCouponToCart(cartId, req.user.userId, applyCouponDto.code);
    }
  
    @Delete('cart/:cartId/remove')
    @RemoveCouponSwagger()
    @UseGuards(JwtAuthGuard)
    async removeCouponFromCart(
      @Param('cartId', ParseIntPipe) cartId: number,
      @Req() req
    ) {
      return this.couponService.removeCouponFromCart(cartId, req.user.userId);
    }
  }