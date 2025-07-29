import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMessagesDto {
  @ApiPropertyOptional({ example: '2025-02-15T10:30:00Z', description: 'Get messages before this timestamp' })
  @IsDateString()
  @IsOptional()
  before?: string;

  @ApiPropertyOptional({ example: 20, description: 'Number of messages to return' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit: number = 20;
}