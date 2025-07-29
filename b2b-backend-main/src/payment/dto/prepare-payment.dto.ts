import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class PreparePaymentDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the shop to process payment for'
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  shopId: number;
  
  @ApiProperty({
    example: 199.99,
    description: 'Payment amount'
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  amount: number;
  
  @ApiProperty({
    example: 'REF-123456789',
    description: 'Merchant reference (unique identifier for this transaction)'
  })
  @IsString()
  @IsNotEmpty()
  merchantReference: string;
}