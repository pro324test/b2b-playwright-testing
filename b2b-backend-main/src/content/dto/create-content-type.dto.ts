import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateContentTypeDto {
  @ApiProperty({ 
    example: 'Banner', 
    description: 'Name of the content type' 
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ 
    example: 'Homepage banner content', 
    description: 'Description of what this content type is used for' 
  })
  @IsString()
  @IsOptional()
  description?: string;
}