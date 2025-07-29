import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Req 
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrderService } from '../order/order.service';
import {
  GetCartSwagger,
  AddToCartSwagger,
  UpdateCartItemSwagger,
  RemoveFromCartSwagger,
  ClearCartSwagger,
  CheckoutCartSwagger,
  ApplyCouponToCartSwagger,
  RemoveCouponFromCartSwagger,
} from './cart.swagger';
import { ApplyCouponDto } from '../coupon/dto/apply-coupon.dto';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
  ) {}

  @Get()
  @GetCartSwagger()
  async getCurrentCart(@Req() req) {
    return this.cartService.getCurrentCart(req.user.userId);
  }

  @Post('item')
  @AddToCartSwagger()
  async addToCart(
    @Req() req,
    @Body() createCartItemDto: CreateCartItemDto
  ) {
    return this.cartService.addItemToCart(req.user.userId, createCartItemDto);
  }

  @Patch('item/:id')
  @UpdateCartItemSwagger()
  async updateCartItem(
    @Req() req,
    @Param('id') id: number,
    @Body() updateCartItemDto: UpdateCartItemDto
  ) {
    return this.cartService.updateCartItem(req.user.userId, id, updateCartItemDto);
  }

  @Delete('item/:id')
  @RemoveFromCartSwagger()
  async removeFromCart(
    @Req() req,
    @Param('id') id: number
  ) {
    return this.cartService.removeCartItem(req.user.userId, id);
  }

  @Delete('clear')
  @ClearCartSwagger()
  async clearCart(@Req() req) {
    return this.cartService.clearCart(req.user.userId);
  }

  @Post('checkout')
  @CheckoutCartSwagger()
  async checkout(
    @Req() req,
    @Body() checkoutCartDto: CheckoutCartDto
  ) {
    const userId = req.user.userId;
    const cartId = await this.cartService.getCurrentCartId(userId);
    
    // Use the direct checkout method in cart service
    return this.cartService.checkoutCart(userId, cartId, checkoutCartDto);
  }

  @Post(':id/apply-coupon')
  @ApplyCouponToCartSwagger()
  async applyCoupon(
    @Req() req,
    @Param('id') id: number,
    @Body() applyCouponDto: ApplyCouponDto
  ) {
    return this.cartService.applyCouponToCart(id, req.user.userId, applyCouponDto.code);
  }

  @Delete(':id/remove-coupon') 
  @RemoveCouponFromCartSwagger()
  async removeCoupon(
    @Req() req,
    @Param('id') id: number
  ) {
    return this.cartService.removeCouponFromCart(id, req.user.userId);
  }
}