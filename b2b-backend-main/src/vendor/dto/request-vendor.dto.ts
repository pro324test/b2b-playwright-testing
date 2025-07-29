import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RequestVendorDto {
  @ApiProperty({
    example: 'Tech Solutions LLC',
    description: 'Business name of the vendor',
  })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiPropertyOptional({
    example: 'I would like to become a vendor to sell electronics products.',
    description: 'Additional message for the vendor request'
  })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiPropertyOptional({
    example: '1',
    description: 'ID of the vendor group the user wants to join (if any)'
  })
  @IsString()
  @IsOptional()
  requestedGroupId?: string;
}