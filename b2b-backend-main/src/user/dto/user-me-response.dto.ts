import { ApiProperty } from '@nestjs/swagger';

export class UserMeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;
  
  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  role: string;

  @ApiProperty({ required: false })
  vendor?: {
    id: number;
    isDisabled: boolean;
    shops: Array<{
      id: number;
      name: string;
      status: string;
    }>;
  };
}