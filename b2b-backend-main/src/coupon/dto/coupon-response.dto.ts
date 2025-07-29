// src/coupon/dto/coupon-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponType } from './create-coupon.dto';

export class CouponResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'SUMMER25' })
  code: string;

  @ApiProperty({ 
    enum: CouponType,
    example: 'percentage'
  })
  type: CouponType;

  @ApiProperty({ example: 25 })
  value: number;

  @ApiPropertyOptional({ example: 100 })
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 50 })
  maxDiscountAmount?: number;

  @ApiPropertyOptional({ example: '2025-04-01T00:00:00Z' })
  startDate?: Date;

  @ApiPropertyOptional({ example: '2025-06-30T23:59:59Z' })
  endDate?: Date;

  @ApiProperty({ example: 100 })
  usageLimit: number;

  @ApiProperty({ example: 45 })
  usageCount: number;

  @ApiPropertyOptional({ example: 1 })
  perUserLimit?: number;

  @ApiProperty({ 
    enum: ['enabled', 'disabled'],
    example: 'enabled'
  })
  status: string;

  @ApiPropertyOptional({ example: 'Summer promotion discount' })
  description?: string;

  @ApiProperty({ example: '2025-03-12T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-03-12T15:30:00Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ 
    example: {
      id: 1,
      name: 'Tech Shop'
    }
  })
  shop?: Record<string, any>;

  @ApiPropertyOptional({ 
    example: [
      { id: 1, name: 'Smartphone X' },
      { id: 2, name: 'Laptop Pro' }
    ]
  })
  applicableProducts?: Record<string, any>[];

  @ApiPropertyOptional({ 
    example: [
      { id: 1, name: 'Electronics' },
      { id: 5, name: 'Accessories' }
    ]
  })
  applicableCategories?: Record<string, any>[];
}