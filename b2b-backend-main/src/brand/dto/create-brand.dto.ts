import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'Nike' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Sports and lifestyle brand' })
  @IsString()
  @IsOptional()
  description?: string;

  // We no longer need logoUrl since we'll handle file upload
  // The logo file will be handled via multipart/form-data
  @ApiPropertyOptional({ example: 'https://example.com/website' })
  @IsString()
  @IsOptional()
  website?: string;
}