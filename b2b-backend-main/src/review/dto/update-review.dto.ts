// update-review.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateReviewDto {
  @ApiPropertyOptional({ example: 'This is my updated review content...' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ 
    example: '[1, 2, 3]', 
    description: 'IDs of images to delete (as JSON string or array)'
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return [];
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  deleteImageIds?: number[];
}
