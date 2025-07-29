import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateShopDto {
  @ApiPropertyOptional({ example: 'Updated Shop Name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated shop description' })
  @IsString()
  @IsOptional()
  description?: string;
  
  @ApiPropertyOptional({ example: 'https://example.com/updated-logo.png' })
  @IsString()
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ 
    example: [1, 2, 3],
    description: 'List of city IDs where this shop delivers' 
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  @Type(() => Number)
  cityIds?: number[];
}