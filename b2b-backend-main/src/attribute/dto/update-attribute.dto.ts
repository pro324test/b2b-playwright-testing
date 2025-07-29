import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAttributeDto {
  @ApiPropertyOptional({ example: 'Size' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'The size of the product' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: true, description: 'Set to true to enable the attribute or false to disable it' })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}