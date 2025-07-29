import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, Min, Max, IsUrl, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShopAddressDto {
  @ApiProperty({
    example: '123 Business Street',
    description: 'Street address',
  })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({
    example: 1,
    description: 'City ID from the city module',
  })
  @IsNumber()
  @Type(() => Number)
  cityId: number;

  @ApiProperty({
    example: 1,
    description: 'Shop ID',
  })
  @IsNumber()
  @Type(() => Number)
  shopId: number;

  @ApiPropertyOptional({
    example: 'https://goo.gl/maps/business123',
    description: 'Google Maps link to the address',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Google Maps link must be a valid URL' })
  googleMapsLink?: string;

  @ApiPropertyOptional({
    example: 34.0522,
    description: 'Latitude coordinate for mapping',
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({
    example: -118.2437,
    description: 'Longitude coordinate for mapping',
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({
    example: 'Business hours: 9 AM - 5 PM',
    description: 'Additional notes about the shop location',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this is the default shop address',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;
}

export class UpdateShopAddressDto {
  @ApiPropertyOptional({
    example: '456 Updated Business Street',
    description: 'Street address',
  })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'City ID from the city module',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cityId?: number;

  @ApiPropertyOptional({
    example: 'https://goo.gl/maps/updated-business',
    description: 'Google Maps link to the address',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Google Maps link must be a valid URL' })
  googleMapsLink?: string;

  @ApiPropertyOptional({
    example: 34.1234,
    description: 'Latitude coordinate for mapping',
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({
    example: -118.1234,
    description: 'Longitude coordinate for mapping',
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({
    example: 'Updated business hours: 10 AM - 6 PM',
    description: 'Additional notes about the shop location',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this is the default shop address',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class ShopAddressResponseDto {
  id: number;
  shopId: number;
  street: string;
  city: {
    id: number;
    name: string;
  };
  googleMapsLink?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}