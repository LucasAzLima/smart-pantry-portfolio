export const DEFAULT_INVENTORY_PAGE_SIZE = 6;

export interface PaginateItemsResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Returns a page slice of `items` (1-based page index).
 * Clamps `page` into a valid range when the list shrinks.
 */
export function paginateItems<T>(
  items: readonly T[],
  page: number,
  pageSize: number = DEFAULT_INVENTORY_PAGE_SIZE,
): PaginateItemsResult<T> {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const totalItems = items.length;
  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / safePageSize);
  const safePage =
    totalPages === 0
      ? 1
      : Math.min(Math.max(1, Math.floor(page)), totalPages);
  const start = (safePage - 1) * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    page: safePage,
    pageSize: safePageSize,
    totalItems,
    totalPages,
    hasPreviousPage: safePage > 1,
    hasNextPage: totalPages > 0 && safePage < totalPages,
  };
}
