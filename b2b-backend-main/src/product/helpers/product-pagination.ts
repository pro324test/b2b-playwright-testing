import { PaginationDto, SortDirection } from '../../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

export interface PaginationMeta {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  sortBy: string;
  sortDirection: SortDirection | string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Prepares pagination parameters from a PaginationDto
 * @param paginationDto The pagination DTO
 * @param defaultSortBy Default field to sort by if not specified
 * @param validSortFields Array of fields that are valid for sorting
 * @returns Object with pagination parameters
 */
export function preparePaginationParams(
  paginationDto?: PaginationDto,
  defaultSortBy = 'createdAt',
  validSortFields: string[] = ['id', 'name', 'basePrice', 'createdAt']
) {
  const { 
    page = 1, 
    limit = 10, 
    sortDirection = SortDirection.DESC, 
    sortBy = defaultSortBy 
  } = paginationDto || {};
  
  const skip = (page - 1) * limit;
  const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;
  
  // Validate sortBy field to prevent SQL injection
  const actualSortBy = validSortFields.includes(sortBy) ? sortBy : defaultSortBy;
  
  return {
    page,
    limit,
    skip,
    sortOrder,
    actualSortBy,
    sortDirection
  };
}

/**
 * Creates a paginated response with standardized metadata
 * @param data Array of items for the current page
 * @param totalCount Total number of items (before pagination)
 * @param params Pagination parameters from preparePaginationParams
 * @returns Standardized paginated result object
 */
export function createPaginatedResponse<T>(
  data: T[],
  totalCount: number,
  params: ReturnType<typeof preparePaginationParams>
): PaginatedResult<T> {
  const { page, limit, actualSortBy, sortDirection } = params;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    data,
    meta: {
      totalItems: totalCount,
      itemsPerPage: limit,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      sortBy: actualSortBy,
      sortDirection
    }
  };
}