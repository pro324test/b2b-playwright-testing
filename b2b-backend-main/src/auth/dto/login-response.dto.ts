import { ApiProperty } from '@nestjs/swagger';

export class ShopDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  status: string;
}

export class VendorInfoDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  isDisabled: boolean;

  @ApiProperty({ type: [ShopDto] })
  shops: ShopDto[];
}

export class UserInfoDto {
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

  @ApiProperty({ required: false, type: VendorInfoDto })
  vendor?: VendorInfoDto;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: UserInfoDto })
  user: UserInfoDto;
}