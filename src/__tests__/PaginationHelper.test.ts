import { PaginationHelper } from '../utils/pagination';

describe('PaginationHelper', () => {
  describe('createCursorResult', () => {
    it('should create cursor pagination result with cursor', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const metadata = { cursor: 'next-cursor', total: 100 };

      const result = PaginationHelper.createCursorResult(data, metadata, 10);

      expect(result).toEqual({
        data,
        hasNextPage: true,
        nextCursor: 'next-cursor',
        totalCount: 100
      });
    });

    it('should create cursor pagination result without cursor', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const metadata = { total: 2 };

      const result = PaginationHelper.createCursorResult(data, metadata);

      expect(result).toEqual({
        data,
        hasNextPage: false,
        totalCount: 2
      });
    });

    it('should create cursor pagination result without total', () => {
      const data = [{ id: 1 }];
      const metadata = { cursor: 'next-cursor' };

      const result = PaginationHelper.createCursorResult(data, metadata);

      expect(result).toEqual({
        data,
        hasNextPage: true,
        nextCursor: 'next-cursor'
      });
    });
  });

  describe('createPageResult', () => {
    it('should create page pagination result with next page', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const metadata = { page: 1, pageSize: 2, total: 10 };

      const result = PaginationHelper.createPageResult(data, metadata);

      expect(result).toEqual({
        data,
        hasNextPage: true,
        nextPage: 2,
        totalCount: 10,
        currentPage: 1,
        pageSize: 2
      });
    });

    it('should create page pagination result without next page', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const metadata = { page: 5, pageSize: 2, total: 10 };

      const result = PaginationHelper.createPageResult(data, metadata);

      expect(result).toEqual({
        data,
        hasNextPage: false,
        totalCount: 10,
        currentPage: 5,
        pageSize: 2
      });
    });
  });

  describe('validateCursorParams', () => {
    it('should pass validation for valid cursor params', () => {
      expect(() => {
        PaginationHelper.validateCursorParams({ limit: 50 });
      }).not.toThrow();

      expect(() => {
        PaginationHelper.validateCursorParams({ cursor: 'test-cursor' });
      }).not.toThrow();

      expect(() => {
        PaginationHelper.validateCursorParams({});
      }).not.toThrow();
    });

    it('should throw error for invalid limit', () => {
      expect(() => {
        PaginationHelper.validateCursorParams({ limit: 0 });
      }).toThrow('Limit must be between 1 and 100');

      expect(() => {
        PaginationHelper.validateCursorParams({ limit: 101 });
      }).toThrow('Limit must be between 1 and 100');
    });
  });

  describe('validatePageParams', () => {
    it('should pass validation for valid page params', () => {
      expect(() => {
        PaginationHelper.validatePageParams({ page: 1, pageSize: 20 });
      }).not.toThrow();

      expect(() => {
        PaginationHelper.validatePageParams({});
      }).not.toThrow();
    });

    it('should throw error for invalid page', () => {
      expect(() => {
        PaginationHelper.validatePageParams({ page: 0 });
      }).toThrow('Page must be greater than 0');
    });

    it('should throw error for invalid page size', () => {
      expect(() => {
        PaginationHelper.validatePageParams({ pageSize: 0 });
      }).toThrow('Page size must be between 1 and 100');

      expect(() => {
        PaginationHelper.validatePageParams({ pageSize: 101 });
      }).toThrow('Page size must be between 1 and 100');
    });
  });

  describe('iteratePages', () => {
    it('should iterate through all pages', async () => {
      const mockFetchPage = jest.fn()
        .mockResolvedValueOnce({
          data: [{ id: 1 }, { id: 2 }],
          metadata: { page: 1, pageSize: 2, total: 6 }
        })
        .mockResolvedValueOnce({
          data: [{ id: 3 }, { id: 4 }],
          metadata: { page: 2, pageSize: 2, total: 6 }
        })
        .mockResolvedValueOnce({
          data: [{ id: 5 }, { id: 6 }],
          metadata: { page: 3, pageSize: 2, total: 6 }
        });

      const pages = [];
      for await (const page of PaginationHelper.iteratePages(mockFetchPage, { pageSize: 2 })) {
        pages.push(page);
      }

      expect(pages).toHaveLength(3);
      expect(pages[0]).toEqual([{ id: 1 }, { id: 2 }]);
      expect(pages[1]).toEqual([{ id: 3 }, { id: 4 }]);
      expect(pages[2]).toEqual([{ id: 5 }, { id: 6 }]);
      expect(mockFetchPage).toHaveBeenCalledTimes(3);
    });
  });

  describe('iterateCursor', () => {
    it('should iterate through all cursor pages', async () => {
      const mockFetchPage = jest.fn()
        .mockResolvedValueOnce({
          data: [{ id: 1 }, { id: 2 }],
          metadata: { cursor: 'cursor-2', total: 4 }
        })
        .mockResolvedValueOnce({
          data: [{ id: 3 }, { id: 4 }],
          metadata: { total: 4 }
        });

      const pages = [];
      for await (const page of PaginationHelper.iterateCursor(mockFetchPage, { limit: 2 })) {
        pages.push(page);
      }

      expect(pages).toHaveLength(2);
      expect(pages[0]).toEqual([{ id: 1 }, { id: 2 }]);
      expect(pages[1]).toEqual([{ id: 3 }, { id: 4 }]);
      expect(mockFetchPage).toHaveBeenCalledTimes(2);
    });
  });

  describe('collectAllPages', () => {
    it('should collect all items from all pages', async () => {
      const mockFetchPage = jest.fn()
        .mockResolvedValueOnce({
          data: [{ id: 1 }, { id: 2 }],
          metadata: { page: 1, pageSize: 2, total: 4 }
        })
        .mockResolvedValueOnce({
          data: [{ id: 3 }, { id: 4 }],
          metadata: { page: 2, pageSize: 2, total: 4 }
        });

      const allItems = await PaginationHelper.collectAllPages(mockFetchPage, { pageSize: 2 });

      expect(allItems).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
    });

    it('should respect max items limit', async () => {
      const mockFetchPage = jest.fn()
        .mockResolvedValueOnce({
          data: [{ id: 1 }, { id: 2 }],
          metadata: { page: 1, pageSize: 2, total: 6 }
        })
        .mockResolvedValueOnce({
          data: [{ id: 3 }, { id: 4 }],
          metadata: { page: 2, pageSize: 2, total: 6 }
        });

      const allItems = await PaginationHelper.collectAllPages(mockFetchPage, { pageSize: 2 }, 3);

      expect(allItems).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });
  });

  describe('collectAllCursor', () => {
    it('should collect all items from cursor pagination', async () => {
      const mockFetchPage = jest.fn()
        .mockResolvedValueOnce({
          data: [{ id: 1 }, { id: 2 }],
          metadata: { cursor: 'cursor-2', total: 4 }
        })
        .mockResolvedValueOnce({
          data: [{ id: 3 }, { id: 4 }],
          metadata: { total: 4 }
        });

      const allItems = await PaginationHelper.collectAllCursor(mockFetchPage, { limit: 2 });

      expect(allItems).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
    });

    it('should respect max items limit for cursor pagination', async () => {
      const mockFetchPage = jest.fn()
        .mockResolvedValueOnce({
          data: [{ id: 1 }, { id: 2 }],
          metadata: { cursor: 'cursor-2', total: 6 }
        })
        .mockResolvedValueOnce({
          data: [{ id: 3 }, { id: 4 }],
          metadata: { cursor: 'cursor-3', total: 6 }
        });

      const allItems = await PaginationHelper.collectAllCursor(mockFetchPage, { limit: 2 }, 3);

      expect(allItems).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });
  });
});