import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCartItemDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsNumber()
  @Type(() => Number)
  productId: number;

  @ApiPropertyOptional({ example: 5, description: 'Product variant ID (if selecting a specific variant)' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  variantId?: number;

  @ApiProperty({ example: 2, description: 'Quantity of product' })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}