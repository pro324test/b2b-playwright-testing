import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePriceRuleDto {
  @ApiProperty({ example: 'Bulk Discount' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    example: 'discount', 
    enum: ['discount', 'fixed_price'],
    description: 'Rule type: discount (percentage off) or fixed_price (absolute price)'
  })
  @IsEnum(['discount', 'fixed_price'])
  type: 'discount' | 'fixed_price';

  @ApiProperty({ 
    example: 10.00, 
    description: 'For discount: percentage off (e.g., 10 means 10% off). For fixed_price: the actual price ($10.00)'
  })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty({ example: 5, description: 'Minimum quantity for rule to apply' })
  @IsNumber()
  @Min(1)
  minQuantity: number;

  @ApiPropertyOptional({ example: 20, description: 'Maximum quantity for rule to apply' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxQuantity?: number;

  @ApiPropertyOptional({ description: 'Start date for the rule' })
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date for the rule' })
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ example: 1, description: 'Vendor group ID' })
  @IsNumber()
  @IsOptional()
  vendorGroupId?: number;

  @ApiPropertyOptional({ type: [Number], description: 'Product IDs to apply the rule to' })
  @IsOptional()
  productIds?: number[];

  @ApiPropertyOptional({ type: [Number], description: 'Variant IDs to apply the rule to (if specified, rule applies only to these variants)' })
  @IsOptional()
  variantIds?: number[];


  @ApiPropertyOptional({ example: [1, 2], description: 'Array of shop IDs this rule applies to' })
  @IsArray()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  shopIds?: number[];

  
  @ApiPropertyOptional({ example: 5, description: 'Vendor ID to associate with this rule (required for admin users)' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  onBehalfOfVendorId?: number;
}