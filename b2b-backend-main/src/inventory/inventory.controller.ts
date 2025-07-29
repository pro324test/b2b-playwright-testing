import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  CreateInventorySwagger,
  UpdateInventorySwagger,
  AdjustStockSwagger,
  GetLowStockSwagger,
} from './inventory.swagger';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @CreateInventorySwagger()
  @Roles('vendor')
  async create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Patch(':productId')
  @UpdateInventorySwagger()
  @Roles('vendor')
  async update(
    @Param('productId') productId: number,
    @Body() updateInventoryDto: UpdateInventoryDto
  ) {
    return this.inventoryService.update(productId, updateInventoryDto);
  }

  @Patch(':productId/adjust-stock')
  @AdjustStockSwagger()
  @Roles('vendor')
  async adjustStock(
    @Param('productId') productId: number,
    @Body() adjustStockDto: { quantity: number; type: 'add' | 'remove' }
  ) {
    return this.inventoryService.adjustStock(
      productId,
      adjustStockDto.quantity,
      adjustStockDto.type
    );
  }

  @Get('low-stock')
  @GetLowStockSwagger()
  @Roles('vendor', 'admin')
  async getLowStockProducts(@Query() paginationDto: PaginationDto) {
    return this.inventoryService.getLowStockProducts(paginationDto);
  }
}