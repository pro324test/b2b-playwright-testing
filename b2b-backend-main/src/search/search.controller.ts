import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto, SearchType } from './dto/search.dto';
import { SortDirection } from '../common/dto/pagination.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search across products, shops, and vendors with pagination' })
  @ApiQuery({ name: 'query', required: true, type: String, description: 'Search term' })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    enum: SearchType, 
    description: 'Type of entities to search for' 
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Category ID to filter products by (only applicable for product searches)'
  })
  @ApiQuery({
    name: 'brand',
    required: false,
    type: String,
    description: 'Brand ID to filter products by (only applicable for product searches)'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts from 1)'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page'
  })
  @ApiQuery({
    name: 'sortDirection',
    required: false,
    enum: SortDirection,
    description: 'Sort direction (asc or desc)'
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Field to sort by (relevance, name, basePrice, createdAt for products; relevance, name for shops; relevance, username for vendors)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results retrieved successfully',
    schema: {
      oneOf: [
        {
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            meta: {
              type: 'object',
              properties: {
                totalItems: { type: 'number', example: 42 },
                itemsPerPage: { type: 'number', example: 10 },
                currentPage: { type: 'number', example: 1 },
                totalPages: { type: 'number', example: 5 },
                hasNextPage: { type: 'boolean', example: true },
                hasPreviousPage: { type: 'boolean', example: false },
                sortBy: { type: 'string', example: 'relevance' },
                sortDirection: { type: 'string', example: 'desc' }
              }
            }
          }
        },
        {
          properties: {
            products: {
              type: 'array',
              items: { type: 'object' }
            },
            shops: {
              type: 'array',
              items: { type: 'object' }
            },
            vendors: {
              type: 'array',
              items: { type: 'object' }
            },
            meta: {
              type: 'object',
              properties: {
                totalItems: { type: 'number', example: 125 },
                itemsPerPage: { type: 'number', example: 30 },
                currentPage: { type: 'number', example: 1 },
                totalPages: { type: 'number', example: 5 },
                hasNextPage: { type: 'boolean', example: true },
                hasPreviousPage: { type: 'boolean', example: false },
                productCount: { type: 'number', example: 42 },
                shopCount: { type: 'number', example: 23 },
                vendorCount: { type: 'number', example: 60 }
              }
            }
          }
        }
      ]
    }
  })
  async search(@Query() searchDto: SearchQueryDto) {
    return this.searchService.search(searchDto);
  }
}