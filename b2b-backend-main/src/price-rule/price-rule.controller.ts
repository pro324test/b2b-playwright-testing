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
  Req,
  NotFoundException,
  ParseIntPipe,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PriceRuleService } from './price-rule.service';
import { CreatePriceRuleDto } from './dto/create-price-rule.dto';
import { UpdatePriceRuleDto } from './dto/update-price-rule.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';

// Import Swagger decorators from our modular structure
import {
  CreatePriceRuleSwagger,
  GetPriceRuleSwagger,
  UpdatePriceRuleSwagger
} from './swagger/core-operations.swagger';

import {
  GetProductPriceRulesSwagger,
  GetVariantPriceRulesSwagger
} from './swagger/product-rules.swagger';

import {
  EnablePriceRuleSwagger,
  DisablePriceRuleSwagger,
  DeletePriceRuleSwagger
} from './swagger/rule-status.swagger';

import {
  GetAllPriceRulesSwagger,
  GetVendorGroupPriceRulesSwagger,
  GetVendorPriceRulesSwagger,
  GetShopPriceRulesSwagger,
  GetCurrentVendorPriceRulesSwagger
} from './swagger/vendor-rules.swagger';

@ApiTags('price-rules')
@Controller('price-rules')
export class PriceRuleController {
  constructor(
    private readonly priceRuleService: PriceRuleService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  @CreatePriceRuleSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin', 'vendor')
  async create(@Body() createPriceRuleDto: CreatePriceRuleDto, @Req() req) {
    // Extract user info from JWT token for ownership tracking
    // FIXED: Use userId for all types of users
    const creatorId = req.user.userId;
    
    const creatorType = req.user.role === 'admin' || req.user.role === 'superadmin'
      ? 'admin'
      : 'user';

    // Add debugging logs
    console.log('Controller: Request to create price rule');
    console.log('Controller: User role:', req.user.role);
    console.log('Controller: User userId:', req.user.userId);
    console.log('Controller: Calculated creatorId:', creatorId);
    console.log('Controller: Calculated creatorType:', creatorType);

    // Handle vendor association
    let vendorId: number | undefined = undefined;
    
    if (req.user.role === 'vendor') {
      // For vendors - associate with their own vendor ID
      const vendor = await this.prisma.vendor.findFirst({
        where: { userId: req.user.userId }
      });
      
      console.log('Controller: Found vendor for user:', vendor);
      
      // Always set vendorId for vendor users to allow global rules
      vendorId = vendor?.id;
    } else if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      // Admins MUST specify a vendor
      if (!createPriceRuleDto.onBehalfOfVendorId) {
        throw new BadRequestException('Admin users must specify a vendor using onBehalfOfVendorId');
      }
      
      // Validate the vendor exists
      const vendor = await this.prisma.vendor.findUnique({
        where: { id: createPriceRuleDto.onBehalfOfVendorId }
      });
      
      if (!vendor) {
        throw new NotFoundException(`Vendor with ID ${createPriceRuleDto.onBehalfOfVendorId} not found`);
      }
      
      vendorId = vendor.id;
      console.log('Controller: Admin creating on behalf of vendorId:', vendorId);
    }
    
    console.log('Controller: Final parameters being passed to service:');
    console.log('  - createPriceRuleDto:', JSON.stringify(createPriceRuleDto));
    console.log('  - creatorId:', creatorId);
    console.log('  - creatorType:', creatorType);
    console.log('  - vendorId:', vendorId);
    
    return this.priceRuleService.create(createPriceRuleDto, creatorId, creatorType, vendorId);
  }

  @Get()
  @GetAllPriceRulesSwagger()
  async findAll(
    @Query('includeInactive') includeInactive: boolean,
    @Query() paginationDto: PaginationDto,
    @Req() req
  ) {
    // Pass user context if authenticated
    const currentUserId = req.user?.role === 'admin' || req.user?.role === 'superadmin' 
      ? req.user?.id 
      : req.user?.userId;
    
    const currentUserType = req.user?.role === 'admin' || req.user?.role === 'superadmin'
      ? 'admin'
      : 'user';

    return this.priceRuleService.findAll(
      includeInactive, 
      paginationDto,
      currentUserId,
      currentUserType,
      req.user?.role
    );
  }

  @Get('product/:productId')
  @GetProductPriceRulesSwagger()
  async getProductRules(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() paginationDto: PaginationDto,
    @Req() req
  ) {
    // Pass user context if authenticated
    const currentUserId = req.user?.role === 'admin' || req.user?.role === 'superadmin' 
      ? req.user?.id 
      : req.user?.userId;
    
    const currentUserType = req.user?.role === 'admin' || req.user?.role === 'superadmin'
      ? 'admin'
      : 'user';

    return this.priceRuleService.findActiveRulesForProduct(
      productId, 
      paginationDto,
      currentUserId,
      currentUserType,
      req.user?.role
    );
  }

  @Get('variant/:variantId')
  @GetVariantPriceRulesSwagger()
  async getVariantRules(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Query() paginationDto: PaginationDto,
    @Req() req
  ) {
    // Pass user context if authenticated
    const currentUserId = req.user?.role === 'admin' || req.user?.role === 'superadmin' 
      ? req.user?.id 
      : req.user?.userId;
    
    const currentUserType = req.user?.role === 'admin' || req.user?.role === 'superadmin'
      ? 'admin'
      : 'user';

    return this.priceRuleService.findActiveRulesForVariant(
      variantId, 
      paginationDto,
      currentUserId,
      currentUserType,
      req.user?.role
    );
  }

  @Get('vendor-group/:vendorGroupId')
  @GetVendorGroupPriceRulesSwagger()
  async getVendorGroupRules(
    @Param('vendorGroupId', ParseIntPipe) vendorGroupId: number,
    @Query() paginationDto: PaginationDto,
    @Req() req
  ) {
    // Pass user context if authenticated
    const currentUserId = req.user?.role === 'admin' || req.user?.role === 'superadmin' 
      ? req.user?.id 
      : req.user?.userId;
    
    const currentUserType = req.user?.role === 'admin' || req.user?.role === 'superadmin'
      ? 'admin'
      : 'user';

    return this.priceRuleService.findActiveRulesForVendorGroup(
      vendorGroupId, 
      paginationDto,
      currentUserId,
      currentUserType,
      req.user?.role
    );
  }

  @Get('vendor/:vendorId')
  @GetVendorPriceRulesSwagger()
  async getVendorRules(
    @Param('vendorId', ParseIntPipe) vendorId: number,
    @Query() paginationDto: PaginationDto,
    @Req() req
  ) {
    // Pass user context if authenticated
    const currentUserId = req.user?.role === 'admin' || req.user?.role === 'superadmin' 
      ? req.user?.id 
      : req.user?.userId;
    
    const currentUserType = req.user?.role === 'admin' || req.user?.role === 'superadmin'
      ? 'admin'
      : 'user';

    return this.priceRuleService.findActiveRulesForVendor(
      vendorId, 
      paginationDto,
      currentUserId,
      currentUserType,
      req.user?.role
    );
  }

  @Get('shop/:shopId')
  @GetShopPriceRulesSwagger()
  async getShopRules(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Query() paginationDto: PaginationDto,
    @Req() req
  ) {
    // Pass user context if authenticated
    const currentUserId = req.user?.role === 'admin' || req.user?.role === 'superadmin' 
      ? req.user?.id 
      : req.user?.userId;
    
    const currentUserType = req.user?.role === 'admin' || req.user?.role === 'superadmin'
      ? 'admin'
      : 'user';

    return this.priceRuleService.findActiveRulesForShop(
      shopId, 
      paginationDto,
      currentUserId,
      currentUserType,
      req.user?.role
    );
  }

  @Get('my-rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor')
  @GetCurrentVendorPriceRulesSwagger()
  async getMyRules(
    @Req() req,
    @Query() paginationDto: PaginationDto
  ) {
    // Ensure the user has a vendor profile
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: req.user.userId }
    });
    
    if (!vendor) {
      throw new NotFoundException(`No vendor profile found for this user`);
    }

    // Add debugging
    console.log('Getting my-rules for vendor ID:', vendor.id);
    
    return this.priceRuleService.findMyRules(
      vendor.id, 
      paginationDto,
      req.user.userId
    );
  }

  @Get(':id')
  @GetPriceRuleSwagger()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.priceRuleService.findOne(id);
  }

  @Patch(':id')
  @UpdatePriceRuleSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin', 'vendor')
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updatePriceRuleDto: UpdatePriceRuleDto,
    @Req() req
  ) {
    // Extract user info from JWT token for ownership verification
    const currentUserId = req.user.role === 'admin' || req.user.role === 'superadmin' 
      ? req.user.id 
      : req.user.userId;
    
    const currentUserType = req.user.role === 'admin' || req.user.role === 'superadmin'
      ? 'admin'
      : 'user';
      
    // Extract the new vendor ID if an admin is updating on behalf of a vendor
    let newVendorId: number | undefined = undefined;
    if ((req.user.role === 'admin' || req.user.role === 'superadmin') && updatePriceRuleDto.onBehalfOfVendorId) {
      // Verify this vendor exists
      const vendor = await this.prisma.vendor.findUnique({
        where: { id: updatePriceRuleDto.onBehalfOfVendorId }
      });
      
      if (!vendor) {
        throw new NotFoundException(`Vendor with ID ${updatePriceRuleDto.onBehalfOfVendorId} not found`);
      }
      
      newVendorId = vendor.id;
    }
    
    return this.priceRuleService.update(
      id, 
      updatePriceRuleDto, 
      currentUserId, 
      currentUserType,
      req.user.role,
      newVendorId
    );
  }

  @Patch(':id/enable')
  @EnablePriceRuleSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin', 'vendor')
  async enable(@Param('id', ParseIntPipe) id: number, @Req() req) {
    // Extract user info from JWT token for ownership verification
    const currentUserId = req.user.role === 'admin' || req.user.role === 'superadmin' 
      ? req.user.id 
      : req.user.userId;
    
    const currentUserType = req.user.role === 'admin' || req.user.role === 'superadmin'
      ? 'admin'
      : 'user';
    
    return this.priceRuleService.enable(id, currentUserId, currentUserType, req.user.role);
  }

  @Patch(':id/disable')
  @DisablePriceRuleSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin', 'vendor')
  async disable(@Param('id', ParseIntPipe) id: number, @Req() req) {
    // Extract user info from JWT token for ownership verification
    const currentUserId = req.user.role === 'admin' || req.user.role === 'superadmin' 
      ? req.user.id 
      : req.user.userId;
    
    const currentUserType = req.user.role === 'admin' || req.user.role === 'superadmin'
      ? 'admin'
      : 'user';
    
    return this.priceRuleService.disable(id, currentUserId, currentUserType, req.user.role);
  }

  @Delete(':id')
  @DeletePriceRuleSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin', 'vendor')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    // Extract user info from JWT token for ownership verification
    const currentUserId = req.user.role === 'admin' || req.user.role === 'superadmin' 
      ? req.user.id 
      : req.user.userId;
    
    const currentUserType = req.user.role === 'admin' || req.user.role === 'superadmin'
      ? 'admin'
      : 'user';
    
    await this.priceRuleService.remove(id, currentUserId, currentUserType, req.user.role);
    return { message: 'Price rule deleted successfully' };
  }
}