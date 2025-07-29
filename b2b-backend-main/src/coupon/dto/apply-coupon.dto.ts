// src/coupon/dto/apply-coupon.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ApplyCouponDto {
  @ApiProperty({ 
    example: 'SUMMER25', 
    description: 'Coupon code to apply' 
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}