import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCityOverrideDto } from './create-product.dto';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Updated Product Name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 29.99 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  basePrice?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  brandId?: number;

  @ApiPropertyOptional({ type: [Number] })
  @IsArray()
  @IsOptional()
  @Type(() => Number)
  categoryIds?: number[];

  @ApiPropertyOptional({ type: [Number] })
  @IsArray()
  @IsOptional()
  @Type(() => Number)
  deleteImageIds?: number[];
  
  // Captions will now be submitted as JSON string
  @ApiPropertyOptional({ example: '["Updated front view", "Updated side view"]' })
  @IsString()
  @IsOptional()
  captions?: string;

  @ApiPropertyOptional({
    description: 'City availability overrides - if not provided, existing overrides remain unchanged',
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

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  quantity?: number;
}