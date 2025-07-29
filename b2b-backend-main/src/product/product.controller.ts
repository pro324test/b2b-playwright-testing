import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, UseInterceptors, UploadedFiles, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiConsumes, ApiBody, ApiResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../common/services/file-upload.service';
import { ProductFilterDto, ProductStatus } from './dto/product-filter.dto';
import { PrismaService } from '../prisma/prisma.service'; // Add this import



import {
  CreateProductSwagger,
  UpdateProductSwagger,
  GetProductSwagger,
  GetShopProductsSwagger,
  EnableProductSwagger,
  DisableProductSwagger,
  DeleteProductSwagger,
  GetVendorProductsSwagger,
  GetProductsByCitySwagger,
  GetProductCitiesSwagger,
  CheckProductCityAvailabilitySwagger,
  GetAllProductsSwagger,
  GetPublicVendorProductsSwagger // Add this new import
} from './product.swagger';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly fileUploadService: FileUploadService,
    private readonly prisma: PrismaService // Add this line to inject PrismaService

  ) {}

  @Post('shop/:shopId')
  @CreateProductSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    }
  }))
  async createProduct(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    // Process uploaded files
    const imageUrls = files?.map((file) => {
      return this.fileUploadService.getImageUrl('products', file.filename);
    }) || [];

    // Parse captions if provided
    const captions = createProductDto.captions 
      ? JSON.parse(createProductDto.captions) 
      : [];

    return this.productService.createProduct(shopId, {
      ...createProductDto,
      images: imageUrls,
      captions: captions,
    });
  }

  @Get(':id')
  @GetProductSwagger()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Get('shop/:shopId')
  @GetShopProductsSwagger()
  async getProductsByShop(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Query() paginationDto: PaginationDto
  ) {
    return this.productService.getProductsByShop(shopId, paginationDto);
  }


  @Get('city/:cityId')
  @GetProductsByCitySwagger()
  async getProductsByCity(
    @Param('cityId', ParseIntPipe) cityId: number,
    @Query() paginationDto: PaginationDto
  ) {
    return this.productService.getProductsByCityId(cityId, paginationDto);
  }

  @Get(':id/cities')
  @GetProductCitiesSwagger()
  async getProductCities(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.productService.getProductAvailableCities(id);
  }

  @Get(':id/city/:cityId/availability')
  @CheckProductCityAvailabilitySwagger()
  async checkCityAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Param('cityId', ParseIntPipe) cityId: number
  ) {
    const isAvailable = await this.productService.checkProductAvailabilityInCity(id, cityId);
    return { isAvailable };
  }

  @Patch(':id')
  @UpdateProductSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    }
  }))
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req
  ) {
    // Process uploaded files if any
    const imageUrls = files?.map((file) => {
      return this.fileUploadService.getImageUrl('products', file.filename);
    }) || [];

    // Parse captions if provided
    const captions = updateProductDto.captions 
      ? JSON.parse(updateProductDto.captions) 
      : [];
      
    // Parse deleteImageIds if provided as string
    let deleteImageIds = updateProductDto.deleteImageIds || [];
    if (typeof deleteImageIds === 'string') {
      deleteImageIds = JSON.parse(deleteImageIds as unknown as string);
    }

    return this.productService.updateProduct(
      id, 
      {
        ...updateProductDto,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        captions: captions,
        deleteImageIds: deleteImageIds
      }, 
      req.user.vendorId
    );
  }

  @Patch(':id/enable')
  @EnableProductSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor')
  async enableProduct(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.productService.enableProduct(id, req.user.vendorId);
  }

  @Patch(':id/disable')
  @DisableProductSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor')
  async disableProduct(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.productService.disableProduct(id, req.user.vendorId);
  }

  @Delete(':id')
  @DeleteProductSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor')
  async deleteProduct(@Param('id', ParseIntPipe) id: number, @Req() req) {
    await this.productService.deleteProduct(id, req.user.vendorId);
    return { message: 'Product deleted successfully' };
  }

  @Get('vendor/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor')
  @GetVendorProductsSwagger()
  async getVendorProducts(
    @Req() req,
    @Query() filterDto: ProductFilterDto
  ) {
    // Get the userId from the authenticated user
    const userId = req.user.userId;
    
    // Find the vendor associated with this user
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId }
    });
    
    if (!vendor) {
      throw new NotFoundException(`No vendor profile found for this user`);
    }
    
    console.log(`Using vendorId ${vendor.id} for userId ${userId}`);
    
    // Use the vendor ID from the database, not from the request
    return this.productService.getProductsByVendor(vendor.id, filterDto);
  }

  @Get()
  @GetAllProductsSwagger()
  async getAllProducts(@Query() paginationDto: PaginationDto) {
    return this.productService.getAllProducts(paginationDto);
  }

  @Get('vendor/:vendorId/public')
  @GetPublicVendorProductsSwagger()
  async getPublicVendorProducts(
    @Param('vendorId', ParseIntPipe) vendorId: number,
    @Query('status') status: ProductStatus = ProductStatus.ENABLED,
    @Query() paginationDto: PaginationDto
  ) {
    // First validate that the vendor exists
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId }
    });
    
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    // Create filter DTO with the status parameter
    const filterDto: ProductFilterDto = {
      ...paginationDto,
      status: status || ProductStatus.ENABLED
    };
    
    // Use the existing service method
    return this.productService.getProductsByVendor(vendorId, filterDto);
  }
}