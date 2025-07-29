// src/review/review.controller.ts
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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ProductReviewService } from './product-review.service';
import { ShopReviewService } from './shop-review.service';
import { ReviewAdminService } from './review-admin.service';
import { FileUploadService } from '../common/services/file-upload.service';
import { CreateProductReviewDto } from './dto/product-review.dto';
import { CreateShopReviewDto } from './dto/shop-review.dto';
import { UpdateReviewSettingsDto } from './dto/review-settings.dto';
import { UpdateReviewDto } from './dto/update-review.dto'; // Add this import
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  CreateProductReviewSwagger,
  GetProductReviewsSwagger,
  GetProductReviewSwagger,
  UpdateProductReviewSwagger,
  MarkProductReviewHelpfulSwagger,
  ReplyToProductReviewSwagger,
  DeleteProductReviewSwagger,
  CreateShopReviewSwagger,
  GetShopReviewsSwagger,
  GetShopReviewStatsSwagger,
  GetShopReviewSwagger,
  UpdateShopReviewSwagger,
  MarkShopReviewHelpfulSwagger,
  ReplyToShopReviewSwagger,
  DeleteShopReviewSwagger,
  GetReviewSettingsSwagger,
  UpdateReviewSettingsSwagger,
  GetPendingReviewsSwagger,
  GetReviewStatisticsSwagger,
  ApproveProductReviewSwagger,
  ApproveShopReviewSwagger,
  RejectProductReviewSwagger,
  RejectShopReviewSwagger,
  AdminDeleteProductReviewSwagger,
  AdminDeleteShopReviewSwagger
} from './review.swagger';

@ApiTags('reviews')
@Controller('reviews')
@ApiBearerAuth()
export class ReviewController {  constructor(
    private readonly productReviewService: ProductReviewService,
    private readonly shopReviewService: ShopReviewService,
    private readonly reviewAdminService: ReviewAdminService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  // ========================
  // Product Review Endpoints
  // ========================
  @Post('product')
  @UseGuards(JwtAuthGuard)
  @CreateProductReviewSwagger()
  @UseInterceptors(FilesInterceptor('images', 10)) // Allow up to 10 images
  async createProductReview(
    @Body() createProductReviewDto: CreateProductReviewDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req
  ) {
    // Generate URLs for any uploaded files
    const mediaUrls = files?.map(file => 
      this.fileUploadService.getImageUrl('reviews', file.filename)) || [];
    
    // Add the generated URLs to the DTO
    return this.productReviewService.create(req.user.userId, {
      ...createProductReviewDto,
      mediaUrls
    });
  }

  @Get('product/:productId')
  @GetProductReviewsSwagger()
  async getProductReviews(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() paginationDto: PaginationDto
  ) {
    return this.productReviewService.findAll(productId, paginationDto);
  }

  @Get('product/single/:id')
  @GetProductReviewSwagger()
  async getProductReview(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    // Pass userId if authenticated, undefined otherwise
    const userId = req.user?.userId;
    return this.productReviewService.findOne(id, userId);
  }  @Patch('product/:id')
  @UseGuards(JwtAuthGuard)
  @UpdateProductReviewSwagger()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10)) // Allow up to 10 images
  async updateProductReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req
  ) {
    // Generate URLs for any uploaded files
    const imageUrls = files?.map(file => 
      this.fileUploadService.getImageUrl('reviews', file.filename)) || [];
      
    return this.productReviewService.update(
      id, 
      req.user.userId, 
      updateReviewDto.content || '', 
      imageUrls,
      updateReviewDto.deleteImageIds
    );
  }

  @Post('product/:id/helpful')
  @UseGuards(JwtAuthGuard)
  @MarkProductReviewHelpfulSwagger()
  async markProductReviewHelpful(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    return this.productReviewService.markAsHelpful(id, req.user.userId);
  }

  @Post('product/:id/reply')
  @UseGuards(JwtAuthGuard)
  @ReplyToProductReviewSwagger()
  async replyToProductReview(
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
    @Req() req
  ) {
    return this.productReviewService.addReply(id, req.user.userId, content);
  }

  @Delete('product/:id')
  @UseGuards(JwtAuthGuard)
  @DeleteProductReviewSwagger()
  async deleteProductReview(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    return this.productReviewService.delete(id, req.user.userId);
  }

  // =====================
  // Shop Review Endpoints
  // =====================
  @Post('shop')
  @UseGuards(JwtAuthGuard)
  @CreateShopReviewSwagger()
  @UseInterceptors(FilesInterceptor('images', 10)) // Allow up to 10 images
  async createShopReview(
    @Body() createShopReviewDto: CreateShopReviewDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req
  ) {
    // Generate URLs for any uploaded files
    const mediaUrls = files?.map(file => 
      this.fileUploadService.getImageUrl('reviews', file.filename)) || [];
    
    // Add the generated URLs to the DTO
    return this.shopReviewService.create(req.user.userId, {
      ...createShopReviewDto,
      mediaUrls
    });
  }

  @Get('shop/:shopId')
  @GetShopReviewsSwagger()
  async getShopReviews(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Query() paginationDto: PaginationDto
  ) {
    return this.shopReviewService.findAll(shopId, paginationDto);
  }

  @Get('shop/stats/:shopId')
  @GetShopReviewStatsSwagger()
  async getShopReviewStats(
    @Param('shopId', ParseIntPipe) shopId: number
  ) {
    return this.shopReviewService.getShopReviewStats(shopId);
  }

  @Get('shop/single/:id')
  @GetShopReviewSwagger()
  async getShopReview(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    // Pass userId if authenticated, undefined otherwise
    const userId = req.user?.userId;
    return this.shopReviewService.findOne(id, userId);
  }  @Patch('shop/:id')
  @UseGuards(JwtAuthGuard)
  @UpdateShopReviewSwagger()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10)) // Allow up to 10 images
  async updateShopReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req
  ) {
    // Generate URLs for any uploaded files
    const imageUrls = files?.map(file => 
      this.fileUploadService.getImageUrl('reviews', file.filename)) || [];
      
    return this.shopReviewService.update(
      id, 
      req.user.userId, 
      updateReviewDto.content || '', 
      imageUrls,
      updateReviewDto.deleteImageIds
    );
  }

  @Post('shop/:id/helpful')
  @UseGuards(JwtAuthGuard)
  @MarkShopReviewHelpfulSwagger()
  async markShopReviewHelpful(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    return this.shopReviewService.markAsHelpful(id, req.user.userId);
  }

  @Post('shop/:id/reply')
  @UseGuards(JwtAuthGuard)
  @ReplyToShopReviewSwagger()
  async replyToShopReview(
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
    @Req() req
  ) {
    return this.shopReviewService.addReply(id, req.user.userId, content);
  }

  @Delete('shop/:id')
  @UseGuards(JwtAuthGuard)
  @DeleteShopReviewSwagger()
  async deleteShopReview(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    return this.shopReviewService.delete(id, req.user.userId);
  }

  // ========================
  // Admin Review Endpoints
  // ========================

  @Get('admin/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @GetReviewSettingsSwagger()
  async getReviewSettings(@Req() req) {
    return this.reviewAdminService.getReviewSettings();
  }

  @Patch('admin/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UpdateReviewSettingsSwagger()
  async updateReviewSettings(
    @Body() updateReviewSettingsDto: UpdateReviewSettingsDto,
    @Req() req
  ) {
    return this.reviewAdminService.updateReviewSettings(
      req.user.userId,
      updateReviewSettingsDto
    );
  }

  @Get('admin/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @GetPendingReviewsSwagger()
  async getPendingReviews(
    @Req() req,
    @Query() paginationDto: PaginationDto,
    @Query('type') reviewType?: 'product' | 'shop'
  ) {
    return this.reviewAdminService.getPendingReviews(
      req.user.userId,
      paginationDto,
      reviewType
    );
  }

  @Get('admin/statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @GetReviewStatisticsSwagger()
  async getReviewStatistics(@Req() req) {
    return this.reviewAdminService.getReviewStatistics(req.user.userId);
  }

  @Patch('admin/product/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApproveProductReviewSwagger()
  async approveProductReview(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    return this.reviewAdminService.approveProductReview(req.user.userId, id);
  }

  @Patch('admin/shop/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApproveShopReviewSwagger()
  async approveShopReview(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    return this.reviewAdminService.approveShopReview(req.user.userId, id);
  }

  @Patch('admin/product/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @RejectProductReviewSwagger()
  async rejectProductReview(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    return this.reviewAdminService.rejectProductReview(req.user.userId, id);
  }

  @Patch('admin/shop/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @RejectShopReviewSwagger()
  async rejectShopReview(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    return this.reviewAdminService.rejectShopReview(req.user.userId, id);
  }

  @Delete('admin/product/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @AdminDeleteProductReviewSwagger()
  async adminDeleteProductReview(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    return this.reviewAdminService.deleteProductReview(req.user.userId, id);
  }

  @Delete('admin/shop/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @AdminDeleteShopReviewSwagger()
  async adminDeleteShopReview(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    return this.reviewAdminService.deleteShopReview(req.user.userId, id);
  }
}