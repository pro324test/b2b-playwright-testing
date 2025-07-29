import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContentTypeResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Banner' })
  name: string;

  @ApiPropertyOptional({ example: 'Homepage banner content' })
  description?: string;

  @ApiProperty({ example: '2025-04-23T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-04-23T10:00:00.000Z' })
  updatedAt: Date;
}

export class ContentImageResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  imageUrl: string;

  @ApiPropertyOptional({ example: 'Product showcase' })
  caption?: string;

  @ApiPropertyOptional({ example: 'Product displayed on a wooden table' })
  altText?: string;

  @ApiProperty({ example: 1 })
  displayOrder: number;

  @ApiProperty({ example: '2025-04-23T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-04-23T10:00:00.000Z' })
  updatedAt: Date;
}

export class ContentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Summer Sale' })
  title: string;

  @ApiPropertyOptional({ example: 'Get up to 50% off on all summer items.' })
  description?: string;

  @ApiProperty({ type: ContentTypeResponseDto })
  type: ContentTypeResponseDto;

  @ApiPropertyOptional({ example: '#FF5733' })
  backgroundColor?: string;

  @ApiPropertyOptional({ example: { buttonText: 'Shop Now', theme: 'dark' } })
  extraData?: Record<string, any>;

  @ApiPropertyOptional({ example: 'https://example.com/summer-sale' })
  link?: string;

  @ApiProperty({ example: true })
  isPublished: boolean;

  @ApiPropertyOptional({ example: '2025-04-23T10:00:00.000Z' })
  publishedAt?: Date;

  @ApiProperty({ type: [ContentImageResponseDto] })
  images: ContentImageResponseDto[];

  @ApiProperty({ example: '2025-04-23T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-04-23T10:00:00.000Z' })
  updatedAt: Date;
}