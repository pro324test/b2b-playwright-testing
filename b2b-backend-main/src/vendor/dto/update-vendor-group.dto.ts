import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVendorGroupDto {
  @ApiPropertyOptional({ example: 'Updated Group Name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated group description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [Number], example: [1, 2, 3] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  vendorIds?: number[];
}