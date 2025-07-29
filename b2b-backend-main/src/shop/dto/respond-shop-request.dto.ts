import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespondShopRequestDto {
  @ApiProperty({ 
    example: 'accept',
    enum: ['accept', 'reject'],
    description: 'Response to shop request (accept/reject)',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['accept', 'reject'])
  response: string;
}