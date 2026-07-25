import { PaginatedResponseDto, PaginationMetaDto } from '../dto/paginated-response.dto';

/**
 * Builds a paginated response envelope from a page of rows and the
 * total row count. Reused by every module that lists records
 * (roles, permissions, products, orders, customers, etc.) so no
 * module reimplements its own pagination math.
 */
export function buildPaginatedResponse<T>(
  data: T[],
  totalItems: number,
  page: number,
  limit: number,
): PaginatedResponseDto<T> {
  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

  const meta: PaginationMetaDto = {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return { data, meta };
}
