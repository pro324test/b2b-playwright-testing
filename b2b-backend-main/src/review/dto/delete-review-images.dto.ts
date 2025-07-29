// delete-review-images.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class DeleteReviewImagesDto {
  @ApiProperty({ 
    description: 'IDs of review images to delete',
    example: [1, 2, 3],
    type: 'array',
    items: { type: 'number' }
  })
  @IsOptional()
  @Transform(({ value }) => {
    // Handle both string array format and JSON string format
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
      }
    }
    return value;
  })
  @IsArray()
  deleteImageIds?: number[];
}
