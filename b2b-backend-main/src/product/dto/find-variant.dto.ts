import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FindVariantDto {
  @ApiPropertyOptional({ example: 1, description: 'Product ID to filter variants by' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  productId?: number;

  @ApiPropertyOptional({ example: 'RED-XL', description: 'SKU pattern to search for' })
  @IsString()
  @IsOptional()
  skuPattern?: string;
  
  @ApiPropertyOptional({ example: true, description: 'Filter to only show low stock variants' })
  @IsOptional()
  isLowStock?: boolean;
}