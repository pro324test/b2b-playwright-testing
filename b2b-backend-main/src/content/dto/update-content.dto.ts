import { ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsBoolean, 
  IsUrl,
  IsHexColor,
  IsArray,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

// Simplified image item without caption and altText
class ContentImageItem {
  @IsString()
  imageUrl: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateContentDto {
  @ApiPropertyOptional({ 
    example: 'Updated Summer Sale', 
    description: 'Title of the content' 
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ 
    example: 'Get up to 70% off on all summer items.',
    description: 'Detailed description of the content' 
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    example: 2,
    description: 'ID of the content type' 
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  typeId?: number;

  @ApiPropertyOptional({ 
    example: '#FF8C00',
    description: 'Background color in hex format' 
  })
  @IsString()
  @IsHexColor()
  @IsOptional()
  backgroundColor?: string;

  @ApiPropertyOptional({ 
    example: '{"buttonText":"Shop Now","theme":"light"}',
    description: 'Additional flexible data in JSON format (as string)' 
  })
  @IsString()
  @IsOptional()
  extraData?: string;

  @ApiPropertyOptional({ 
    example: 'https://example.com/updated-sale',
    description: 'Link to direct users to' 
  })
  @IsUrl()
  @IsOptional()
  link?: string;

  @ApiPropertyOptional({ 
    example: true,
    description: 'Whether this content should be published' 
  })
  @IsString()
  @IsOptional()
  isPublished?: boolean;
  
  // This will be populated by the controller after processing uploaded files
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentImageItem)
  @IsOptional()
  images?: ContentImageItem[];
  
  // For the form data input - simplified to only include displayOrder
  @ApiPropertyOptional({ 
    example: '[{"displayOrder":1},{"displayOrder":2}]',
    description: 'JSON string containing display order for uploaded images'
  })
  @IsString()
  @IsOptional()
  imagesMeta?: string;
  
  // For keeping track of existing images to delete
  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: 'IDs of existing images to delete'
  })
  @IsArray()
  @IsOptional()
  @Type(() => Number)
  deleteImageIds?: number[];
}