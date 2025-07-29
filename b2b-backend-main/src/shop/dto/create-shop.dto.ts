import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShopDto {
  @ApiProperty({ example: 'My Shop' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'A description of the shop' })
  @IsString()
  @IsOptional()
  description?: string;
  
  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
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