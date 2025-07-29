import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, Min, Max, IsUrl, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserAddressDto {
  @ApiProperty({
    example: '123 Main Street',
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

  @ApiPropertyOptional({
    example: 'https://goo.gl/maps/abcdef123456',
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
    example: 'Ring the doorbell twice',
    description: 'Delivery notes or instructions',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'home',
    description: 'Type of address (home, work, other)',
    enum: ['home', 'work', 'other'],
    default: 'home',
  })
  @IsOptional()
  @IsString()
  addressType?: string = 'home';

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this is the default address',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;
}

export class UpdateUserAddressDto {
  @ApiPropertyOptional({
    example: '456 Updated Street',
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
    example: 'https://goo.gl/maps/updated123',
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
    example: 'Updated delivery notes',
    description: 'Delivery notes or instructions',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'work',
    description: 'Type of address (home, work, other)',
    enum: ['home', 'work', 'other'],
  })
  @IsOptional()
  @IsString()
  addressType?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this is the default address',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UserAddressResponseDto {
  id: number;
  street: string;
  city: {
    id: number;
    name: string;
  };
  googleMapsLink?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  addressType: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}