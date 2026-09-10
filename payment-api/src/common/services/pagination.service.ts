import { Injectable } from '@nestjs/common';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class PaginationService {
  paginate<T>(
    items: T[],
    options: PaginationOptions = {},
  ): PaginationResult<T> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(options.limit ?? 20, options.maxLimit ?? 100);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedItems = items.slice(start, end);

    return {
      data: paginatedItems,
      meta: {
        total: items.length,
        page,
        limit,
        totalPages: Math.ceil(items.length / limit),
      },
    };
  }
}
