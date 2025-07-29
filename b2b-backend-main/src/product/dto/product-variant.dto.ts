import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsArray, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductVariantDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsNumber()
  @Type(() => Number)
  productId: number;

  @ApiPropertyOptional({ example: 'RED-XL-001', description: 'SKU code' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ example: [1, 5], description: 'Attribute value IDs that define this variant' })
  @IsArray()
  @IsNumber({}, { each: true })
  attributeValueIds: number[];

  @ApiProperty({ example: 50, description: 'Initial quantity' })
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
  
  @ApiPropertyOptional({ 
    example: 24.99, 
    description: 'Variant-specific price. If not provided, base product price will be used.' 
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  price?: number;
}

export class UpdateProductVariantDto {
  @ApiPropertyOptional({ example: 'RED-XL-002', description: 'Updated SKU code' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ example: 150, description: 'Updated quantity' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  quantity?: number;

  @ApiPropertyOptional({ example: 20, description: 'Updated low stock threshold' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  lowStockThreshold?: number;
  
  @ApiPropertyOptional({ 
    example: 29.99, 
    description: 'Updated variant-specific price. If not provided, base product price will be used.' 
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  price?: number;
}