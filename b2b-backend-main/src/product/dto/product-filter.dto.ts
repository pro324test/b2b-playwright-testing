import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum ProductStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  ALL = 'all'
}

export class ProductFilterDto extends PaginationDto {
  @ApiPropertyOptional({ 
    enum: ProductStatus, 
    default: ProductStatus.ALL,
    description: 'Filter products by status' 
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus = ProductStatus.ALL;

  @ApiPropertyOptional({ 
    description: 'Search products by name' 
  })
  @IsOptional()
  @IsString()
  search?: string;
}