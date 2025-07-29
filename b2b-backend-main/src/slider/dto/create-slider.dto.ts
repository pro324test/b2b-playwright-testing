import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateSliderDto {
  @ApiPropertyOptional({
    example: '1',
    description: 'Display order of the image (as string)'
  })
  @IsString()
  @IsOptional()
  displayOrder?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/promo-page',
    description: 'Link when the slider image is clicked'
  })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiPropertyOptional({
    example: '{"buttonText":"Shop Now","textColor":"#FFFFFF"}',
    description: 'Additional configurable data as JSON string'
  })
  @IsString()
  @IsOptional()
  extraData?: string;

  @ApiPropertyOptional({
    example: 'true',
    description: 'Whether this slide is active (as string "true" or "false")'
  })
  @IsString()
  @IsOptional()
  isActive?: string;
}