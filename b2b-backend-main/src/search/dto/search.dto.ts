import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SortDirection } from '../../common/dto/pagination.dto';

export enum SearchType {
  PRODUCTS = 'products',
  SHOPS = 'shops',
  VENDORS = 'vendors',
  ALL = 'all'
}

export class SearchQueryDto {
  @ApiProperty({ example: 'laptop', description: 'Search query string' })
  @IsString()
  query: string;

  @ApiProperty({ enum: SearchType, default: SearchType.ALL })
  @IsEnum(SearchType)
  @IsOptional()
  type?: SearchType = SearchType.ALL;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  // Pagination parameters
  @ApiProperty({ required: false, default: 1, description: 'Page number (starts from 1)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10, description: 'Number of items per page' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ 
    required: false, 
    enum: SortDirection, 
    default: SortDirection.DESC,
    description: 'Sort direction (asc or desc)'
  })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection = SortDirection.DESC;

  @ApiProperty({ 
    required: false, 
    default: 'relevance',
    description: 'Field to sort by (depends on search type)'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'relevance';
}