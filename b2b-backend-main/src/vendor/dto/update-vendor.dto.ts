import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVendorDto {
  @ApiPropertyOptional({ 
    example: false,
    description: 'Whether the vendor account is disabled' 
  })
  @IsOptional()
  @IsBoolean()
  isDisabled?: boolean;

  @ApiPropertyOptional({ 
    example: 'Tech Solutions LLC',
    description: 'Business name of the vendor'
  })
  @IsString()
  @IsOptional()
  businessName?: string;

  // We don't add file fields to the DTO
  // The document files will be handled in the controller
  // with FileInterceptor and uploaded to storage
}