import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, Matches } from 'class-validator';

export class CreateMoamalatCredentialDto {
  @ApiProperty({ 
    example: '10081014649', 
    description: 'Merchant ID provided by Moamalat' 
  })
  @IsString()
  @IsNotEmpty()
  merchantId: string;

  @ApiProperty({ 
    example: '99179395', 
    description: 'Terminal ID provided by Moamalat' 
  })
  @IsString()
  @IsNotEmpty()
  terminalId: string;

  @ApiProperty({ 
    example: '3a488a89b3f7993476c252f017c488bb', 
    description: 'Secure key for API authentication' 
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-f0-9]{32}$/, { 
    message: 'Secure key must be a valid 32-character hexadecimal string' 
  })
  secureKey: string;
}

export class UpdateMoamalatCredentialDto {
  @ApiPropertyOptional({ 
    example: '10081014649', 
    description: 'Merchant ID provided by Moamalat' 
  })
  @IsString()
  @IsOptional()
  merchantId?: string;

  @ApiPropertyOptional({ 
    example: '99179395', 
    description: 'Terminal ID provided by Moamalat' 
  })
  @IsString()
  @IsOptional()
  terminalId?: string;

  @ApiPropertyOptional({ 
    example: '3a488a89b3f7993476c252f017c488bb', 
    description: 'Secure key for API authentication' 
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-f0-9]{32}$/, { 
    message: 'Secure key must be a valid 32-character hexadecimal string' 
  })
  secureKey?: string;

  @ApiPropertyOptional({ 
    example: true, 
    description: 'Whether these credentials are active' 
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class MoamalatSystemSettingsDto {
  @ApiProperty({ 
    example: '10081014649', 
    description: 'System default Merchant ID' 
  })
  @IsString()
  @IsNotEmpty()
  merchantId: string;

  @ApiProperty({ 
    example: '99179395', 
    description: 'System default Terminal ID' 
  })
  @IsString()
  @IsNotEmpty()
  terminalId: string;

  @ApiProperty({ 
    example: '3a488a89b3f7993476c252f017c488bb', 
    description: 'System default Secure key' 
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-f0-9]{32}$/, { 
    message: 'Secure key must be a valid 32-character hexadecimal string' 
  })
  secureKey: string;
}