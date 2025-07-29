import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'username or user@example.com', required: false })
  @IsString()
  @IsOptional() // Make it optional to allow phone login
  identifier?: string;


  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;


}