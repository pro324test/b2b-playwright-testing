import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsNumber()
  @Type(() => Number)
  productId: number;

  @ApiProperty({ example: 100, description: 'Initial quantity' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({ example: 10, description: 'Low stock threshold' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  lowStockThreshold?: number;
}