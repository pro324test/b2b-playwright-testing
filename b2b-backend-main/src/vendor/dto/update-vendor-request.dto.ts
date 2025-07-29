import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVendorRequestDto {
  @ApiPropertyOptional({ 
    example: 'I would like to sell electronics and home appliances', 
    description: 'Updated request message' 
  })
  @IsString()
  @IsOptional()
  message?: string;
  
  @ApiPropertyOptional({ 
    example: 'pending', 
    enum: ['pending', 'accept', 'reject'] 
  })
  @IsString()
  @IsOptional()
  @IsIn(['pending', 'accept', 'reject'])
  status?: string;
}