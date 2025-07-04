export interface PaginationResult<T> {
  data: T[];
  hasNextPage: boolean;
  nextCursor?: string;
  nextPage?: number;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
}

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PagePaginationParams {
  page?: number;
  pageSize?: number;
}

export class PaginationHelper {
  public static createCursorResult<T>(
    data: T[],
    metadata: { cursor?: string; total?: number },
    _requestedLimit?: number,
  ): PaginationResult<T> {
    const result: PaginationResult<T> = {
      data,
      hasNextPage: !!metadata.cursor,
    };

    if (metadata.cursor) {
      result.nextCursor = metadata.cursor;
    }

    if (metadata.total !== undefined) {
      result.totalCount = metadata.total;
    }

    return result;
  }

  public static createPageResult<T>(
    data: T[],
    metadata: { page: number; pageSize: number; total: number },
  ): PaginationResult<T> {
    const totalPages = Math.ceil(metadata.total / metadata.pageSize);
    const hasNextPage = metadata.page < totalPages;

    const result: PaginationResult<T> = {
      data,
      hasNextPage,
      totalCount: metadata.total,
      currentPage: metadata.page,
      pageSize: metadata.pageSize,
    };

    if (hasNextPage) {
      result.nextPage = metadata.page + 1;
    }

    return result;
  }

  public static validateCursorParams(params: CursorPaginationParams): void {
    if (
      params.limit !== undefined &&
      (params.limit < 1 || params.limit > 100)
    ) {
      throw new Error("Limit must be between 1 and 100");
    }
  }

  public static validatePageParams(params: PagePaginationParams): void {
    if (params.page !== undefined && params.page < 1) {
      throw new Error("Page must be greater than 0");
    }

    if (
      params.pageSize !== undefined &&
      (params.pageSize < 1 || params.pageSize > 100)
    ) {
      throw new Error("Page size must be between 1 and 100");
    }
  }

  public static async *iteratePages<
    TParams extends PagePaginationParams,
    TResponse,
  >(
    fetchPage: (params: TParams) => Promise<{
      data: TResponse[];
      metadata: { page: number; pageSize: number; total: number };
    }>,
    initialParams: TParams,
  ): AsyncGenerator<TResponse[], void, unknown> {
    let currentPage = initialParams.page || 1;
    const pageSize = initialParams.pageSize || 20;

    while (true) {
      const response = await fetchPage({
        ...initialParams,
        page: currentPage,
        pageSize,
      } as TParams);

      yield response.data;

      const totalPages = Math.ceil(
        response.metadata.total / response.metadata.pageSize,
      );
      if (currentPage >= totalPages) {
        break;
      }

      currentPage++;
    }
  }

  public static async *iterateCursor<
    TParams extends CursorPaginationParams,
    TResponse,
  >(
    fetchPage: (params: TParams) => Promise<{
      data: TResponse[];
      metadata: { cursor?: string; total?: number };
    }>,
    initialParams: TParams,
  ): AsyncGenerator<TResponse[], void, unknown> {
    let cursor = initialParams.cursor;

    while (true) {
      const response = await fetchPage({
        ...initialParams,
        cursor,
      } as TParams);

      yield response.data;

      if (!response.metadata.cursor) {
        break;
      }

      cursor = response.metadata.cursor;
    }
  }

  public static async collectAllPages<
    TParams extends PagePaginationParams,
    TResponse,
  >(
    fetchPage: (params: TParams) => Promise<{
      data: TResponse[];
      metadata: { page: number; pageSize: number; total: number };
    }>,
    params: TParams,
    maxItems?: number,
  ): Promise<TResponse[]> {
    const allItems: TResponse[] = [];

    for await (const pageData of this.iteratePages(fetchPage, params)) {
      allItems.push(...pageData);

      if (maxItems && allItems.length >= maxItems) {
        return allItems.slice(0, maxItems);
      }
    }

    return allItems;
  }

  public static async collectAllCursor<
    TParams extends CursorPaginationParams,
    TResponse,
  >(
    fetchPage: (params: TParams) => Promise<{
      data: TResponse[];
      metadata: { cursor?: string; total?: number };
    }>,
    params: TParams,
    maxItems?: number,
  ): Promise<TResponse[]> {
    const allItems: TResponse[] = [];

    for await (const pageData of this.iterateCursor(fetchPage, params)) {
      allItems.push(...pageData);

      if (maxItems && allItems.length >= maxItems) {
        return allItems.slice(0, maxItems);
      }
    }

    return allItems;
  }
}
