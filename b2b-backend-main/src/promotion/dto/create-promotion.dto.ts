import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsEnum, 
  IsOptional, 
  IsDateString, 
  IsInt, 
  IsBoolean, 
  IsArray,
  Min,
  Max,
  ValidateNested,
  ValidateIf
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PromotionType {
  BOGO_SAME = 'bogo_same',
  BOGO_DIFFERENT = 'bogo_different',
  BUY_X_GET_Y_DISCOUNT = 'buy_x_get_y_discount'
}

export class CreateBogoRuleDto {
  @ApiProperty({ 
    description: 'How many items customer needs to buy',
    example: 2
  })
  @IsInt()
  @Min(1)
  buyQuantity: number;

  @ApiProperty({ 
    description: 'How many items customer gets for free/discount',
    example: 1
  })
  @IsInt()
  @Min(1)
  getQuantity: number;

  @ApiProperty({ 
    description: 'Whether customer gets same product or different product',
    example: true
  })
  @IsBoolean()
  sameProduct: boolean;

  @ApiPropertyOptional({ 
    description: 'Discount percentage (if not 100% free)', 
    example: 50
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  discountPercent?: number;

  @ApiPropertyOptional({ 
    description: 'Product ID for the free product (required if sameProduct is false)',
    example: 5
  })
  @ValidateIf(o => o.sameProduct === false)
  @IsInt()
  freeProductId?: number;

  @ApiPropertyOptional({  // Change to ApiPropertyOptional
    description: 'Array of product IDs this promotion applies to',
    type: [Number],
    example: [1, 2, 3]
  })
  @IsOptional()  // Add this decorator
  @IsArray()
  @IsInt({ each: true })
  applicableProductIds?: number[];  // Make this optional with ?

  @ApiPropertyOptional({ 
    description: 'Array of category IDs this promotion applies to',
    type: [Number],
    example: [1, 5]
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  applicableCategoryIds?: number[];

  @ApiPropertyOptional({
    description: 'Whether promotion applies to all variants of a product',
    default: true,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  applyToAllVariants?: boolean = true;

  @ApiPropertyOptional({
    description: 'Maximum number of free items per order (null = unlimited)',
    example: 3
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptionsPerOrder?: number;

  @ApiPropertyOptional({  
    description: 'Array of variant IDs this promotion applies to (when applyToAllVariants is false)',
    type: [Number],
    example: [101, 102, 103]
  })
  @IsOptional()  
  @IsArray()
  @IsInt({ each: true })
  applicableVariantIds?: number[];
}

export class CreatePromotionDto {
  @ApiProperty({ 
    example: 'Buy 2 Get 1 Free'
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({ 
    example: 'Buy two items from our summer collection, get one free!'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    enum: PromotionType,
    example: 'bogo_same',
    description: 'Type of promotion'
  })
  @IsEnum(PromotionType)
  type: PromotionType;

  @ApiPropertyOptional({
    enum: ['enabled', 'disabled'],
    default: 'enabled',
    example: 'enabled',
    description: 'Status of the promotion'
  })
  @IsOptional()
  @IsEnum(['enabled', 'disabled'])
  status?: string;

  @ApiPropertyOptional({ 
    example: '2025-04-01'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ 
    example: '2025-06-30'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Shop ID the promotion belongs to',
    example: 1
  })
  @IsInt()
  shopId: number;

  @ApiProperty({
    description: 'BOGO promotion rule details'
  })
  @ValidateNested()
  @Type(() => CreateBogoRuleDto)
  bogoRule: CreateBogoRuleDto;
}