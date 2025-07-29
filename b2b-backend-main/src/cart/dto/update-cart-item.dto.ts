import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCartItemDto {
  @ApiPropertyOptional({ example: 5, description: 'New quantity' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  quantity?: number;
}