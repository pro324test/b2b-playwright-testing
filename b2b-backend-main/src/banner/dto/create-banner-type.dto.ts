// src/banner/dto/create-banner-type.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsPositive } from 'class-validator';

export class CreateBannerTypeDto {
  @ApiProperty({ example: 'Homepage Slider' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Banner for homepage slider', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1200 })
  @IsInt()
  @IsPositive()
  width: number;

  @ApiProperty({ example: 400 })
  @IsInt()
  @IsPositive()
  height: number;
}