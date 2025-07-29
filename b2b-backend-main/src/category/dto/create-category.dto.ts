import { IsNotEmpty, IsString, IsOptional, IsNumber, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Electronic devices and accessories' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    example: null, 
    description: 'Parent category ID (null for root categories)' 
  })
  @ValidateIf((o) => o.parentId !== null)
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  parentId?: number | null;
}