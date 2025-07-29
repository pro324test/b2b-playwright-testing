import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, Min, IsPositive, IsNotEmpty, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductCityOverrideDto {
  @ApiProperty({ description: 'City ID', example: 1 })
  @IsNumber()
  @Type(() => Number)
  cityId: number;

  @ApiProperty({ description: 'Whether the product is available in this city', example: true })
  @IsBoolean()
  isAvailable: boolean;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Dell XPS 13 Laptop' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '13-inch premium laptop with InfinityEdge display' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1299.99 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  basePrice: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  brandId: number;

  @ApiProperty({ type: [Number], example: [1, 5] })
  @IsArray()
  @Type(() => Number)
  categoryIds: number[];

  @ApiPropertyOptional({ example: 50 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  initialQuantity?: number = 0;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  lowStockThreshold?: number = 10;

  // Image files will be handled separately in the controller
  // Captions will now be submitted as JSON string
  @ApiPropertyOptional({ example: '["Front view", "Side view"]' })
  @IsString()
  @IsOptional()
  captions?: string;

  @ApiPropertyOptional({
    description: 'City availability overrides - if not provided, shop defaults are used',
    type: [ProductCityOverrideDto],
    example: [
      { cityId: 1, isAvailable: true },
      { cityId: 2, isAvailable: false }
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductCityOverrideDto)
  cityOverrides?: ProductCityOverrideDto[];
}