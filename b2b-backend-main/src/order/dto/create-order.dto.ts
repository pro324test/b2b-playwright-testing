import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({ 
    example: 1,
    description: 'ID of the shop to create order from' 
  })
  @IsNumber()
  @Type(() => Number)
  shopId: number;

  @ApiProperty({ 
    example: 1,
    description: 'ID of the cart to process' 
  })
  @IsNumber()
  @Type(() => Number)
  cartId: number;

  @ApiProperty({
    enum: ['cod', 'moamalat'],
    example: 'cod',
    description: 'Payment method (cash on delivery or Moamalat)'
  })
  @IsEnum(['cod', 'moamalat'])
  paymentMethod: string;
  
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