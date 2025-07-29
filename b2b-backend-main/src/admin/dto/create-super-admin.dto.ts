import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSuperAdminDto {
  @ApiProperty({ example: 'superadmin' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'superadmin@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Super' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Admin' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '218912345678' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}