import { PaginationDto, SortDirection } from '../../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

/**
 * Prepares pagination parameters from a PaginationDto
 * @param paginationDto The pagination data transfer object
 * @param defaultSortBy Default field to sort by if not specified
 * @param validSortFields Array of field names that are valid for sorting
 * @returns Object with pagination parameters
 */
export function preparePaginationParams(
  paginationDto?: PaginationDto,
  defaultSortBy = 'createdAt',
  validSortFields: string[] = ['id', 'name', 'createdAt']
) {
  // Extract pagination values with defaults
  const { 
    page = 1, 
    limit = 10, 
    sortDirection = SortDirection.DESC, 
    sortBy = defaultSortBy 
  } = paginationDto || {};
  
  // Calculate skip for pagination
  const skip = (page - 1) * limit;
  
  // Convert sort direction to Prisma-compatible format
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
 * Creates a consistent pagination metadata object
 * @param totalCount Total number of items
 * @param paginationParams Pagination parameters from preparePaginationParams
 * @returns Standardized pagination metadata object
 */
export function createPaginationMeta(
  totalCount: number,
  paginationParams: ReturnType<typeof preparePaginationParams>
) {
  const { page, limit, actualSortBy, sortDirection } = paginationParams;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    totalItems: totalCount,
    itemsPerPage: limit,
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    sortBy: actualSortBy,
    sortDirection
  };
}

/**
 * Creates a pagination result with standardized structure
 * @param data Array of items to include in the result
 * @param totalCount Total count of items (before pagination)
 * @param paginationParams Pagination parameters from preparePaginationParams
 * @returns Standardized pagination result object
 */
export function createPaginatedResponse<T>(
  data: T[],
  totalCount: number,
  paginationParams: ReturnType<typeof preparePaginationParams>
) {
  return {
    data,
    meta: createPaginationMeta(totalCount, paginationParams)
  };
}