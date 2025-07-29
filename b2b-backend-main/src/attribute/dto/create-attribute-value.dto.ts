import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttributeValueDto {
  @ApiProperty({ example: 'Red', description: 'The name of the color' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiPropertyOptional({ example: '#FF0000', description: 'The hexadecimal color code' })
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'hexValue must be a valid hex color code (e.g., #FF0000)',
  })
  hexValue?: string;

  @ApiProperty({ example: 1, description: 'The ID of the attribute this value belongs to' })
  @IsNotEmpty()
  attributeId: number;
}