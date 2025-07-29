// src/banner/banner.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  ParseIntPipe, 
  Query, 
  ForbiddenException, 
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { BannerService } from './banner.service';
import { CreateBannerTypeDto } from './dto/create-banner-type.dto';
import { UpdateBannerTypeDto } from './dto/update-banner-type.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../common/services/file-upload.service';
import {
  CreateBannerTypeSwagger,
  UpdateBannerTypeSwagger,
  DeleteBannerTypeSwagger,
  GetBannerTypesSwagger,
  GetBannerTypeSwagger,
  CreateBannerSwagger,
  UpdateBannerSwagger,
  DeleteBannerSwagger,
  GetShopBannersSwagger,
  GetActiveBannersSwagger,
  GetBannerSwagger
} from './banner.swagger';

@ApiTags('banners')
@Controller('banner')
export class BannerController {
  constructor(
    private readonly bannerService: BannerService,
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService
  ) {}

  // Banner Type endpoints (Admin only)
  @Post('type')
  @CreateBannerTypeSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  createBannerType(@Body() createBannerTypeDto: CreateBannerTypeDto) {
    return this.bannerService.createBannerType(createBannerTypeDto);
  }

  @Get('type')
  @GetBannerTypesSwagger()
  findAllBannerTypes(@Query() paginationDto: PaginationDto) {
    return this.bannerService.findAllBannerTypes(paginationDto);
  }

  @Get('type/:id')
  @GetBannerTypeSwagger()
  findOneBannerType(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.findOneBannerType(id);
  }

  @Patch('type/:id')
  @UpdateBannerTypeSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  updateBannerType(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBannerTypeDto: UpdateBannerTypeDto,
  ) {
    return this.bannerService.updateBannerType(id, updateBannerTypeDto);
  }

  @Delete('type/:id')
  @DeleteBannerTypeSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  removeBannerType(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.removeBannerType(id);
  }

  // Banner endpoints (Shop owners)
  @Post()
  @CreateBannerSwagger()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    }
  }))
  async createBanner(
    @Body() createBannerDto: CreateBannerDto,
    @UploadedFile() image: Express.Multer.File,
    @Req() req,
  ) {
    // Check if user is vendor owner of this shop
    const shop = await this.prisma.shop.findUnique({
      where: { id: createBannerDto.shopId },
      include: { vendor: true }
    });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${createBannerDto.shopId} not found`);
    }

    if (shop.vendor.userId !== req.user.userId) {
      throw new ForbiddenException('You do not have permission to create banners for this shop');
    }

    // Check if banner type exists
    const bannerType = await this.prisma.bannerType.findUnique({
      where: { id: createBannerDto.bannerTypeId }
    });

    if (!bannerType) {
      throw new NotFoundException(`Banner type with ID ${createBannerDto.bannerTypeId} not found`);
    }

    // Process the uploaded image
    if (!image) {
      throw new BadRequestException('Banner image is required');
    }
    
    // Get image URL
    const imageUrl = this.fileUploadService.getImageUrl('banners', image.filename);

    // Create banner with the image URL
    return this.bannerService.createBanner({
      ...createBannerDto,
      imageUrl,
    });
  }

  @Get('shop/:shopId')
  @GetShopBannersSwagger()
  async findAllShopBanners(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Query() paginationDto: PaginationDto
  ) {
    return this.bannerService.findAllShopBanners(shopId, paginationDto);
  }

  @Get('active')
  @GetActiveBannersSwagger()
  getActiveBanners(
    @Query('shopId') shopId?: string,
    @Query() paginationDto?: PaginationDto
  ) {
    return this.bannerService.getActiveBanners(
      shopId ? parseInt(shopId) : undefined, 
      paginationDto
    );
  }

  @Get(':id')
  @GetBannerSwagger()
  async findOneBanner(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.findOneBanner(id);
  }

  @Patch(':id')
  @UpdateBannerSwagger()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    }
  }))
  async updateBanner(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBannerDto: UpdateBannerDto,
    @UploadedFile() image: Express.Multer.File,
    @Req() req,
  ) {
    // Check ownership
    const banner = await this.bannerService.findOneBanner(id);
    const shop = await this.prisma.shop.findUnique({
      where: { 
        id: banner.shopId 
      },
      include: { 
        vendor: true 
      }
    });

    if (!shop || shop.vendor.userId !== req.user.userId) {
      throw new ForbiddenException('You do not have permission to update this banner');
    }

    // Process the image if provided
    let updateData = { ...updateBannerDto };
    
    // Convert numeric fields to proper types if present in update data
    if (updateData.shopId) {
      updateData.shopId = Number(updateData.shopId);
    }
    
    if (updateData.bannerTypeId) {
      updateData.bannerTypeId = Number(updateData.bannerTypeId);
    }
    
    if (image) {
      const imageUrl = this.fileUploadService.getImageUrl('banners', image.filename);
      updateData.imageUrl = imageUrl;
    }

    return this.bannerService.updateBanner(id, updateData);
  }

  @Delete(':id')
  @DeleteBannerSwagger()
  @UseGuards(JwtAuthGuard)
  async removeBanner(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ) {
    // Check ownership
    const banner = await this.bannerService.findOneBanner(id);
    const shop = await this.prisma.shop.findUnique({
      where: { 
        id: banner.shopId 
      },
      include: { 
        vendor: true 
      }
    });

    if (!shop || shop.vendor.userId !== req.user.userId) {
      throw new ForbiddenException('You do not have permission to delete this banner');
    }

    return this.bannerService.removeBanner(id);
  }
}