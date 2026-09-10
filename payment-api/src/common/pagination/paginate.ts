export interface PageInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pageInfo: PageInfo;
}

export function paginate<T>(items: T[], page: number, limit: number): PaginatedResult<T> {
  const safePage = Math.max(1, page || 1);
  const safeLimit = Math.min(200, Math.max(1, limit || 20));
  const start = (safePage - 1) * safeLimit;
  const data = items.slice(start, start + safeLimit);
  return {
    data,
    pageInfo: { page: safePage, limit: safeLimit, total: items.length, totalPages: Math.ceil(items.length / safeLimit) },
  };
}
