import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class ConfirmPaymentDto {
  @ApiProperty({ 
    example: 1,
    description: 'ID of the order to confirm payment for' 
  })
  @IsNumber()
  @Type(() => Number)
  orderId: number;

  @ApiProperty({ 
    example: 299.99,
    description: 'Amount being paid' 
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ 
    example: 'bank_transfer',
    description: 'Method used for payment'
  })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({ 
    example: 'TXN123456789',
    description: 'External payment reference/transaction ID'
  })
  @IsString()
  @IsOptional()
  transactionId?: string;
}