import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsBoolean, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto, SortDirection } from '../../common/dto/pagination.dto';

export enum ContentPublishStatus {
  ALL = 'all',
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished'
}

export class ContentFilterDto extends PaginationDto {
  @ApiPropertyOptional({ 
    enum: ContentPublishStatus, 
    default: ContentPublishStatus.ALL,
    description: 'Filter by content publish status' 
  })
  @IsOptional()
  @IsEnum(ContentPublishStatus)
  publishStatus?: ContentPublishStatus = ContentPublishStatus.ALL;
  
  @ApiPropertyOptional({ 
    example: 1,
    description: 'Filter by content type ID' 
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  typeId?: number;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';
}