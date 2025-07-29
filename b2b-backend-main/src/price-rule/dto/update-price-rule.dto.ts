import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsArray, Min, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePriceRuleDto {
  @ApiPropertyOptional({ example: 'Updated Bulk Discount' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ 
    enum: ['discount', 'fixed_price'],
    description: 'Rule type: discount (percentage off) or fixed_price (absolute price)'
  })
  @IsEnum(['discount', 'fixed_price'])
  @IsOptional()
  type?: 'discount' | 'fixed_price';

  @ApiPropertyOptional({ example: 15.00 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)  // Important: transforms string input to number
  value?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  minQuantity?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  maxQuantity?: number;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  @Type(() => Date)  // Transform string to Date
  startDate?: Date;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  @Type(() => Date)  // Transform string to Date
  endDate?: Date;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  vendorGroupId?: number;

  @ApiPropertyOptional({ type: [Number] })
  @IsArray()
  @IsOptional()
  @Type(() => Number)
  productIds?: number[];

  @ApiPropertyOptional({ enum: ['enabled', 'disabled'] })
  @IsEnum(['enabled', 'disabled'])
  @IsOptional()
  status?: 'enabled' | 'disabled';

  @ApiPropertyOptional({ type: [Number], description: 'Variant IDs to apply the rule to' })
  @IsArray()
  @IsOptional()
  @Type(() => Number)
  variantIds?: number[];

  @ApiPropertyOptional({ example: 5, description: 'Vendor ID to associate with this rule (required for admin users)' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  onBehalfOfVendorId?: number;

  @ApiPropertyOptional({ example: [1, 2], description: 'Array of shop IDs this rule applies to' })
  @IsArray()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  shopIds?: number[];
}