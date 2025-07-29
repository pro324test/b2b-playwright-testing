// src/coupon/dto/create-coupon.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsNumber, 
  IsOptional, 
  IsArray, 
  IsDate,
  IsInt,
  Min,
  Max,
  IsPositive
} from 'class-validator';
import { Type } from 'class-transformer';

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed',
  FREE_SHIPPING = 'free_shipping'
}

export class CreateCouponDto {
  @ApiProperty({ 
    example: 'SUMMER25', 
    description: 'Unique coupon code' 
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ 
    enum: CouponType,
    example: 'percentage',
    description: 'Type of discount provided by this coupon'
  })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ 
    example: 25, 
    description: 'Discount value (percentage or fixed amount)' 
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  value: number;

  @ApiPropertyOptional({ 
    example: 100, 
    description: 'Minimum order amount required to use this coupon' 
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  minOrderAmount?: number;

  @ApiPropertyOptional({ 
    example: 50, 
    description: 'Maximum discount amount (for percentage discounts)' 
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  maxDiscountAmount?: number;

  @ApiPropertyOptional({ 
    example: '2025-04-01T00:00:00Z', 
    description: 'Coupon validity start date' 
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({ 
    example: '2025-06-30T23:59:59Z', 
    description: 'Coupon validity end date' 
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({ 
    example: 100, 
    description: 'Total number of times the coupon can be used' 
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  usageLimit?: number;

  @ApiPropertyOptional({ 
    example: 1, 
    description: 'Number of times each user can use this coupon' 
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  perUserLimit?: number;

  @ApiPropertyOptional({ 
    enum: ['enabled', 'disabled'],
    default: 'enabled',
    example: 'enabled',
    description: 'Status of the coupon'
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ 
    example: 'Summer promotion discount',
    description: 'Description of the coupon'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    type: [Number],
    example: [1, 2, 3],
    description: 'Shop IDs this coupon applies to (empty for global/vendor-wide coupons)'
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @Type(() => Number)
  shopIds?: number[];

  @ApiPropertyOptional({ 
    type: [Number],
    example: [1, 2, 3],
    description: 'Product IDs this coupon can be applied to'
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @Type(() => Number)
  applicableProductIds?: number[];

  @ApiPropertyOptional({ 
    type: [Number],
    example: [1, 5],
    description: 'Category IDs this coupon can be applied to'
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @Type(() => Number)
  applicableCategoryIds?: number[];

  @ApiPropertyOptional({
    description: 'Required for admin users - vendor ID to associate with this coupon',
    example: 3,
    required: false
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  onBehalfOfVendorId?: number;
}

