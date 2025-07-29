import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespondVendorRequestDto {
  @ApiProperty({ 
    example: 'accept',
    enum: ['accept', 'reject'],
    description: 'Response to vendor request (accept/reject)',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['accept', 'reject'])
  status: string;
}