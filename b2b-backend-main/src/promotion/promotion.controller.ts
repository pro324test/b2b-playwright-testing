// import { 
//     Controller, 
//     Get, 
//     Post, 
//     Body, 
//     Patch, 
//     Param, 
//     Delete, 
//     UseGuards, 
//     Query, 
//     Req,
//     ParseIntPipe,
//     ForbiddenException,
//     BadRequestException
//   } from '@nestjs/common';
//   import { ApiTags } from '@nestjs/swagger';
//   import { PromotionService } from './promotion.service';
//   import { CreatePromotionDto } from './dto/create-promotion.dto';
//   import { UpdatePromotionDto } from './dto/update-promotion.dto';
//   import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
//   import { RolesGuard } from '../common/guards/roles.guard';
//   import { Roles } from '../common/decorators/roles.decorator';
//   import { PaginationDto } from '../common/dto/pagination.dto';
//   import { PrismaService } from '../prisma/prisma.service';
//   import {
//     CreatePromotionSwagger,
//     GetAllPromotionsSwagger,
//     GetShopPromotionsSwagger,
//     GetOnePromotionSwagger,
//     UpdatePromotionSwagger,
//     EnablePromotionSwagger,
//     DisablePromotionSwagger,
//     DeletePromotionSwagger
//   } from './promotion.swagger';
  
//   @ApiTags('promotions')
//   @Controller('promotions')
//   export class PromotionController {
//     constructor(
//       private readonly promotionService: PromotionService,
//       private readonly prisma: PrismaService
//     ) {}
  
//     @Post()
//     @CreatePromotionSwagger()
//     @UseGuards(JwtAuthGuard, RolesGuard)
//     @Roles('vendor')
//     async create(@Body() createPromotionDto: CreatePromotionDto, @Req() req) {
//       // Verify vendor can only create promotions for their own shops
//       const shop = await this.prisma.shop.findFirst({
//         where: {
//           id: createPromotionDto.shopId,
//           vendorId: req.user.vendorId
//         }
//       });
      
//       if (!shop) {
//         throw new ForbiddenException('You can only create promotions for your own shops');
//       }
      
//       return this.promotionService.create(createPromotionDto);
//     }
  
//     @Get()
//     @GetAllPromotionsSwagger()
//     @UseGuards(JwtAuthGuard, RolesGuard)
//     @Roles('admin', 'superadmin')
//     async findAll(@Query() paginationDto: PaginationDto) {
//       return this.promotionService.findAll(undefined, paginationDto);
//     }
  
//     @Get('shop/:shopId')
//     @GetShopPromotionsSwagger()
//     async findShopPromotions(
//       @Param('shopId', ParseIntPipe) shopId: number,
//       @Query() paginationDto: PaginationDto
//     ) {
//       return this.promotionService.findAll(shopId, paginationDto);
//     }
  
//     @Get(':id')
//     @GetOnePromotionSwagger()
//     async findOne(@Param('id', ParseIntPipe) id: number) {
//       return this.promotionService.findOne(id);
//     }
  
//     @Patch(':id')
//     @UpdatePromotionSwagger()
//     @UseGuards(JwtAuthGuard, RolesGuard)
//     @Roles('vendor', 'admin', 'superadmin')
//     async update(
//       @Param('id', ParseIntPipe) id: number,
//       @Body() updatePromotionDto: UpdatePromotionDto,
//       @Req() req
//     ) {
//       // Check if user is vendor, and if so, verify shop ownership
//       if (req.user.role === 'vendor') {
//         const promotion = await this.promotionService.findOne(id);
        
//         const shop = await this.prisma.shop.findFirst({
//           where: {
//             id: promotion.shopId,
//             vendorId: req.user.vendorId
//           }
//         });
        
//         if (!shop) {
//           throw new ForbiddenException('You can only update promotions for your own shops');
//         }
//       }
      
//       return this.promotionService.update(id, updatePromotionDto);
//     }
  
//     @Patch(':id/enable')
//     @EnablePromotionSwagger()
//     @UseGuards(JwtAuthGuard, RolesGuard)
//     @Roles('vendor', 'admin', 'superadmin')
//     async enable(
//       @Param('id', ParseIntPipe) id: number,
//       @Req() req
//     ) {
//       // Check if user is vendor, and if so, verify shop ownership
//       if (req.user.role === 'vendor') {
//         const promotion = await this.promotionService.findOne(id);
        
//         const shop = await this.prisma.shop.findFirst({
//           where: {
//             id: promotion.shopId,
//             vendorId: req.user.vendorId
//           }
//         });
        
//         if (!shop) {
//           throw new ForbiddenException('You can only enable promotions for your own shops');
//         }
//       }
      
//       return this.promotionService.enable(id);
//     }
  
//     @Patch(':id/disable')
//     @DisablePromotionSwagger()
//     @UseGuards(JwtAuthGuard, RolesGuard)
//     @Roles('vendor', 'admin', 'superadmin')
//     async disable(
//       @Param('id', ParseIntPipe) id: number,
//       @Req() req
//     ) {
//       // Check if user is vendor, and if so, verify shop ownership
//       if (req.user.role === 'vendor') {
//         const promotion = await this.promotionService.findOne(id);
        
//         const shop = await this.prisma.shop.findFirst({
//           where: {
//             id: promotion.shopId,
//             vendorId: req.user.vendorId
//           }
//         });
        
//         if (!shop) {
//           throw new ForbiddenException('You can only disable promotions for your own shops');
//         }
//       }
      
//       return this.promotionService.disable(id);
//     }
  
//     @Delete(':id')
//     @DeletePromotionSwagger()
//     @UseGuards(JwtAuthGuard, RolesGuard)
//     @Roles('vendor', 'admin', 'superadmin')
//     async remove(
//       @Param('id', ParseIntPipe) id: number,
//       @Req() req
//     ) {
//       // Check if user is vendor, and if so, verify shop ownership
//       if (req.user.role === 'vendor') {
//         const promotion = await this.promotionService.findOne(id);
        
//         const shop = await this.prisma.shop.findFirst({
//           where: {
//             id: promotion.shopId,
//             vendorId: req.user.vendorId
//           }
//         });
        
//         if (!shop) {
//           throw new ForbiddenException('You can only delete promotions for your own shops');
//         }
//       }
      
//       return this.promotionService.remove(id);
//     }
//   }