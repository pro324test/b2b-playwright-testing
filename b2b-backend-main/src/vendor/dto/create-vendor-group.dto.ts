import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVendorGroupDto {
  @ApiProperty({ example: 'Premium Vendors' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Group for premium vendor accounts' })
  @IsString()
  @IsOptional()
  description?: string;
}