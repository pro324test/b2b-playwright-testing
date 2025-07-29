// src/banner/dto/create-banner.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsPositive,
  IsUrl,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateBannerDto {
  @ApiProperty({ example: 'Summer Sale' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '50% off on all summer items', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://example.com/images/banner.jpg' })
  @IsOptional() // This will be set by the controller
  imageUrl?: string;

  @ApiProperty({ example: 'https://example.com/sale', required: false })
  @IsUrl()
  @IsOptional()
  link?: string;

  @ApiProperty({ example: '2025-06-01T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2025-08-31T23:59:59Z', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  bannerTypeId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  shopId: number;
}