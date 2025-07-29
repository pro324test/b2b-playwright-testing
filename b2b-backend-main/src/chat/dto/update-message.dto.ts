import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, IsOptional } from 'class-validator';

export class UpdateMessageDto {
  @ApiProperty({ example: 'Updated message content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsUrl()
  @IsOptional()
  mediaUrl?: string;
}