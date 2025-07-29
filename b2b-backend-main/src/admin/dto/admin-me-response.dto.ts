import { ApiProperty } from '@nestjs/swagger';

export class AdminMeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  isDisabled: boolean;

  @ApiProperty()
  createdAt: Date;
}