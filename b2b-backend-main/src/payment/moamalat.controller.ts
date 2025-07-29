import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    UseGuards,
    Req,
    ParseIntPipe,
  } from '@nestjs/common';
  import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
  import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
  import { RolesGuard } from '../common/guards/roles.guard';
  import { Roles } from '../common/decorators/roles.decorator';
  import { MoamalatService } from './moamalat.service';
  import { 
    CreateMoamalatCredentialDto, 
    UpdateMoamalatCredentialDto,
    MoamalatSystemSettingsDto 
  } from './dto/moamalat-credential.dto';
  import { PrismaService } from '../prisma/prisma.service';
  import { NotFoundException } from '@nestjs/common';
  import { PreparePaymentDto } from './dto/prepare-payment.dto';
  
  import {
    GetMoamalatCredentialsSwagger,
    CreateMoamalatCredentialsSwagger,
    GetVendorMoamalatCredentialsSwagger,
    UpdateMoamalatCredentialsSwagger,
    ToggleCredentialsStatusSwagger,
    SetSystemCredentialsSwagger,
    GetSystemCredentialsSwagger,
  } from './moamalat.swagger';
  
  @ApiTags('moamalat')
  @Controller('moamalat')
  export class MoamalatController {
    constructor(
      private readonly moamalatService: MoamalatService,
      private readonly prisma: PrismaService,
    ) {}
  
    // Get payment credentials for a specific shop
    @Get('credentials/:shopId')
    @UseGuards(JwtAuthGuard)
    @GetMoamalatCredentialsSwagger()
    async getMoamalatCredentials(
      @Param('shopId', ParseIntPipe) shopId: number,
    ) {
      return this.moamalatService.getMoamalatCredentials(shopId);
    }
  
    // Vendor endpoints
    
    // Create/update vendor's credentials
    @Post('vendor/credentials')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor')
    @CreateMoamalatCredentialsSwagger()
    async createMoamalatCredentials(
      @Body() createDto: CreateMoamalatCredentialDto,
      @Req() req,
    ) {
      const vendorId = await this.getVendorIdFromUserId(req.user.userId);
      return this.moamalatService.upsertVendorCredentials(vendorId, createDto);
    }
  
    // Get vendor's credentials
    @Get('vendor/credentials')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor')
    @GetVendorMoamalatCredentialsSwagger()
    async getVendorCredentials(@Req() req) {
      const vendorId = await this.getVendorIdFromUserId(req.user.userId);
      return this.moamalatService.getVendorCredentials(vendorId);
    }
  
    // Update vendor's credentials
    @Patch('vendor/credentials')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor')
    @UpdateMoamalatCredentialsSwagger()
    async updateMoamalatCredentials(
      @Body() updateDto: UpdateMoamalatCredentialDto,
      @Req() req,
    ) {
      const vendorId = await this.getVendorIdFromUserId(req.user.userId);
      return this.moamalatService.updateVendorCredentials(vendorId, updateDto);
    }
  
    // Toggle credential status (enable/disable)
    @Patch('vendor/credentials/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor')
    @ToggleCredentialsStatusSwagger()
    async toggleCredentialsStatus(
      @Body('isActive') isActive: boolean,
      @Req() req,
    ) {
      const vendorId = await this.getVendorIdFromUserId(req.user.userId);
      return this.moamalatService.toggleCredentialStatus(vendorId, isActive);
    }
  
    // Admin endpoints
  
    // Set system-wide default Moamalat credentials
    @Post('admin/settings')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    @SetSystemCredentialsSwagger()
    async setSystemCredentials(@Body() dto: MoamalatSystemSettingsDto) {
      return this.moamalatService.setSystemCredentials(dto);
    }
  
    // Get system-wide default Moamalat credentials
    @Get('admin/settings')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    @GetSystemCredentialsSwagger()
    async getSystemCredentials() {
      return this.moamalatService.getSystemCredentials();
    }
  
    // Prepare payment parameters for Moamalat integration
    @Post('prepare')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
      summary: 'Prepare payment parameters for Moamalat integration',
      description: 'Generates the necessary parameters for frontend to initialize Moamalat payment gateway'
    })
    async preparePayment(@Body() paymentData: PreparePaymentDto, @Req() req) {
      const userId = req.user.userId;
      return this.moamalatService.preparePaymentParameters(
        paymentData.shopId,
        paymentData.amount,
        paymentData.merchantReference,
        userId
      );
    }
  
    // Helper method to get vendorId from userId
    private async getVendorIdFromUserId(userId: number): Promise<number> {
      const vendor = await this.prisma.vendor.findFirst({
        where: { userId }
      });
      
      if (!vendor) {
        throw new NotFoundException(`Vendor account not found for user ID ${userId}`);
      }
      
      return vendor.id;
    }
  }