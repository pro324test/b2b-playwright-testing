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
    ParseIntPipe 
  } from '@nestjs/common';
  import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
  import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
  import { RolesGuard } from '../common/guards/roles.guard';
  import { Roles } from '../common/decorators/roles.decorator';
  import { ProductVariantService } from './product-variant.service';
  import { CreateProductVariantDto, UpdateProductVariantDto } from './dto/product-variant.dto';
  import { FindVariantDto } from './dto/find-variant.dto';
  import { PaginationDto } from '../common/dto/pagination.dto';
  import { 
    CreateProductVariantSwagger, 
    GetProductVariantsSwagger, 
    GetVariantByIdSwagger,
    GetVariantsByProductSwagger,
    UpdateVariantSwagger,
    DeleteVariantSwagger,
    AddStockSwagger,
    RemoveStockSwagger,
    GetLowStockVariantsSwagger
  } from './product-variant.swagger';
  
  @ApiTags('product-variants')
  @Controller('product-variants')
  @ApiBearerAuth()
  export class ProductVariantController {
    constructor(private readonly productVariantService: ProductVariantService) {}
  
    @Post()
    @CreateProductVariantSwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor')
    async create(@Body() createProductVariantDto: CreateProductVariantDto) {
      return this.productVariantService.create(createProductVariantDto);
    }
  
    @Get()
    @GetProductVariantsSwagger()
    async findAll(
      @Query() findVariantDto: FindVariantDto,
      @Query() paginationDto: PaginationDto
    ) {
      return this.productVariantService.findAll(findVariantDto, paginationDto);
    }
  
    @Get('product/:productId')
    @GetVariantsByProductSwagger()
    async findByProduct(
      @Param('productId', ParseIntPipe) productId: number,
      @Query() paginationDto: PaginationDto
    ) {
      const findDto: FindVariantDto = { productId };
      return this.productVariantService.findAll(findDto, paginationDto);
    }
  
    @Get(':id')
    @GetVariantByIdSwagger()
    async findOne(@Param('id', ParseIntPipe) id: number) {
      return this.productVariantService.findOne(id);
    }
  
    @Patch(':id')
    @UpdateVariantSwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor')
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateProductVariantDto: UpdateProductVariantDto
    ) {
      return this.productVariantService.update(id, updateProductVariantDto);
    }
  
    @Delete(':id')
    @DeleteVariantSwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor')
    async remove(@Param('id', ParseIntPipe) id: number) {
      return this.productVariantService.remove(id);
    }
  
    @Patch(':id/stock/add')
    @AddStockSwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor')
    async addStock(
      @Param('id', ParseIntPipe) id: number,
      @Body('quantity', ParseIntPipe) quantity: number
    ) {
      return this.productVariantService.adjustStock(id, quantity, 'add');
    }
  
    @Patch(':id/stock/remove')
    @RemoveStockSwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor')
    async removeStock(
      @Param('id', ParseIntPipe) id: number,
      @Body('quantity', ParseIntPipe) quantity: number
    ) {
      return this.productVariantService.adjustStock(id, quantity, 'remove');
    }
  
    @Get('low-stock')
    @GetLowStockVariantsSwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('vendor', 'admin')
    async getLowStock(@Query() paginationDto: PaginationDto) {
      const findDto: FindVariantDto = { isLowStock: true };
      return this.productVariantService.findAll(findDto, paginationDto);
    }
  }