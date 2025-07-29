import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  GetOrdersSwagger,
  GetShopOrdersSwagger,
  GetOrderByIdSwagger,
  UpdateOrderStatusSwagger,
  GetAllOrdersAdminSwagger,
} from './order.swagger';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // @Post()
  // async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req) {
  //   return this.orderService.createOrder(req.user.userId, createOrderDto);
  // }

  @Get()
  @GetOrdersSwagger()
  async getUserOrders(
    @Req() req,
    @Query() paginationDto: PaginationDto
  ) {
    return this.orderService.getUserOrders(req.user.userId, paginationDto);
  }

  @Get('shop/:shopId')
  @GetShopOrdersSwagger()
  @UseGuards(RolesGuard)
  @Roles('vendor')
  async getShopOrders(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Req() req,
    @Query() paginationDto: PaginationDto
  ) {
    return this.orderService.getShopOrders(shopId, req.user.userId, paginationDto);
  }

  @Get(':id')
  @GetOrderByIdSwagger()
  async getOrderById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ) {
    return this.orderService.getOrderById(id, req.user.userId);
  }

  @Patch(':id')
  @UpdateOrderStatusSwagger()
  @UseGuards(RolesGuard)
  @Roles('vendor')
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req,
  ) {
    return this.orderService.updateOrderStatus(id, updateOrderDto, req.user.userId);
  }

  @Get('admin/all')
@GetAllOrdersAdminSwagger()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
async getAllOrdersAdmin(
  @Query() paginationDto: PaginationDto,
  @Query('status') status?: string,
  @Query('paymentStatus') paymentStatus?: string,
  @Query('shopId', new ParseIntPipe({ optional: true })) shopId?: number,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
) {
  const filters = {
    status,
    paymentStatus,
    shopId,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined
  };
  
  return this.orderService.getAllOrdersAdmin(paginationDto, filters);
}
}