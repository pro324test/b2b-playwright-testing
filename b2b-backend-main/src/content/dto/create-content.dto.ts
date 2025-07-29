import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
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

export class CreateContentDto {
  @ApiProperty({ 
    example: 'Summer Sale', 
    description: 'Title of the content' 
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ 
    example: 'Get up to 50% off on all summer items.',
    description: 'Detailed description of the content' 
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    example: 1,
    description: 'ID of the content type' 
  })
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  typeId: number;

  @ApiPropertyOptional({ 
    example: '#FF5733',
    description: 'Background color in hex format' 
  })
  @IsString()
  @IsHexColor()
  @IsOptional()
  backgroundColor?: string;

  @ApiPropertyOptional({ 
    example: '{"buttonText":"Shop Now","theme":"dark"}',
    description: 'Additional flexible data in JSON format (as string)' 
  })
  @IsString()
  @IsOptional()
  extraData?: string;

  @ApiPropertyOptional({ 
    example: 'https://example.com/summer-sale',
    description: 'Link to direct users to' 
  })
  @IsUrl()
  @IsOptional()
  link?: string;

  @ApiPropertyOptional({ 
    example: true,
    description: 'Whether this content should be published immediately' 
  })
  @IsString()
  @IsOptional()
  isPublished?: boolean = false;
  
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
}