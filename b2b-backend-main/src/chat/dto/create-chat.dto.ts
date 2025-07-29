import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  recipientId: number;
}