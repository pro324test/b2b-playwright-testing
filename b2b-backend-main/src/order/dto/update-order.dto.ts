import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOrderDto {
  @ApiPropertyOptional({ 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    example: 'confirmed',
    description: 'Status of the order' 
  })
  @IsEnum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ 
    enum: ['paid', 'unpaid'],
    example: 'paid',
    description: 'Payment status of the order' 
  })
  @IsEnum(['paid', 'unpaid'])
  @IsOptional()
  paymentStatus?: string;

  @ApiPropertyOptional({ 
    example: 'Please deliver in the afternoon instead',
    description: 'Additional notes for the order' 
  })
  @IsString()
  @IsOptional()
  notes?: string;
}