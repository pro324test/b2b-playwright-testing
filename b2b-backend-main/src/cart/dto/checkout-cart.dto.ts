import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutCartDto {
  @ApiProperty({ 
    example: 1,
    description: 'ID of the shop to create order from' 
  })
  @IsNumber()
  @Type(() => Number)
  shopId: number;

  @ApiProperty({
    enum: ['cod', 'moamalat'],
    example: 'cod',
    description: 'Payment method (cash on delivery or Moamalat)'
  })
  @IsEnum(['cod', 'moamalat'])
  paymentMethod: string;
  
  @ApiProperty({
    example: 1,
    description: 'ID of the user address to use for shipping'
  })
  @IsNumber()
  @Type(() => Number)
  addressId: number;
  
  @ApiPropertyOptional({
    example: 'TXN123456789',
    description: 'Transaction ID for completed Moamalat payments'
  })
  @IsString()
  @IsOptional()
  transactionId?: string;
  
  @ApiPropertyOptional({ 
    example: 'Please deliver in the morning',
    description: 'Additional notes for the order' 
  })
  @IsString()
  @IsOptional()
  notes?: string;
}