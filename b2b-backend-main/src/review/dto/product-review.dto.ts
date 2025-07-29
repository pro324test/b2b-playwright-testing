// product-review.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsArray, Min, Max, ArrayMaxSize } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProductReviewDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsInt({ message: 'Product ID must be an integer number' })
  productId: number;

  @ApiPropertyOptional({ example: 4, description: 'Rating (1-5 stars)', minimum: 1, maximum: 5 })
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined, { toClassOnly: true })
  @IsInt({ message: 'Rating must be an integer number' })
  @Min(1, { message: 'Rating must not be less than 1' })
  @Max(5, { message: 'Rating must not be greater than 5' })
  rating?: number;

  @ApiPropertyOptional({ example: 'Great product!', description: 'Review title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'This product exceeded my expectations...', description: 'Review content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ type: [String], description: 'Media URLs for review images/videos' })
  @IsOptional()
  @IsArray()
  mediaUrls?: string[];
}