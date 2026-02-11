/**
 * Export All Leads API Tests
 * Technical Debt: Export All Feature (Story 4-10 Task 6)
 * Tests for fetchAllLeadsForExport and ExportAllError
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchAllLeadsForExport, ExportAllError } from '../lib/api/export-all-leads';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ExportAllError', () => {
  it('[P1] should create error with message', () => {
    const error = new ExportAllError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('ExportAllError');
  });

  it('[P1] should create error with status code', () => {
    const error = new ExportAllError('Test error', 500);
    expect(error.statusCode).toBe(500);
  });
});

describe('fetchAllLeadsForExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const createMockLeads = (count: number, startId: number = 1) =>
    Array.from({ length: count }, (_, i) => ({
      id: startId + i,
      customerName: `Customer ${startId + i}`,
      email: `customer${startId + i}@example.com`,
      company: `Company ${startId + i}`,
      status: 'new',
    }));

  /**
   * Helper to create a mock fetch response matching the real Next.js proxy format:
   * { success: true, data: { leads: [...], pagination: {...} } }
   */
  const createMockResponse = (leads: unknown[], pagination: Record<string, unknown>) => ({
    ok: true,
    json: () =>
      Promise.resolve({
        success: true,
        data: {
          leads,
          pagination,
        },
      }),
  });

  describe('[P1] Single page export', () => {
    it('should fetch all leads when total fits in one page', async () => {
      const mockLeads = createMockLeads(50);

      mockFetch.mockResolvedValueOnce(
        createMockResponse(mockLeads, { page: 1, limit: 100, total: 50, totalPages: 1 })
      );

      const result = await fetchAllLeadsForExport({});

      expect(result.leads).toHaveLength(50);
      expect(result.total).toBe(50);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should include credentials for auth', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse([], { page: 1, limit: 100, total: 0, totalPages: 1 })
      );

      await fetchAllLeadsForExport({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });

    it('should call progress callback with correct values', async () => {
      const mockLeads = createMockLeads(30);
      const onProgress = vi.fn();

      mockFetch.mockResolvedValueOnce(
        createMockResponse(mockLeads, { page: 1, limit: 100, total: 30, totalPages: 1 })
      );

      await fetchAllLeadsForExport({}, onProgress);

      expect(onProgress).toHaveBeenCalledWith(30, 30);
    });
  });

  describe('[P1] Multi-page export', () => {
    it('should fetch all pages when total exceeds one page', async () => {
      const page1Leads = createMockLeads(100, 1);
      const page2Leads = createMockLeads(50, 101);

      mockFetch
        .mockResolvedValueOnce(
          createMockResponse(page1Leads, { page: 1, limit: 100, total: 150, totalPages: 2 })
        )
        .mockResolvedValueOnce(
          createMockResponse(page2Leads, { page: 2, limit: 100, total: 150, totalPages: 2 })
        );

      const result = await fetchAllLeadsForExport({});

      expect(result.leads).toHaveLength(150);
      expect(result.total).toBe(150);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should call progress callback for each batch', async () => {
      const page1Leads = createMockLeads(100, 1);
      const page2Leads = createMockLeads(100, 101);
      const page3Leads = createMockLeads(50, 201);
      const onProgress = vi.fn();

      mockFetch
        .mockResolvedValueOnce(
          createMockResponse(page1Leads, { page: 1, limit: 100, total: 250, totalPages: 3 })
        )
        .mockResolvedValueOnce(
          createMockResponse(page2Leads, { page: 2, limit: 100, total: 250, totalPages: 3 })
        )
        .mockResolvedValueOnce(
          createMockResponse(page3Leads, { page: 3, limit: 100, total: 250, totalPages: 3 })
        );

      await fetchAllLeadsForExport({}, onProgress);

      // First page: 100 loaded
      expect(onProgress).toHaveBeenCalledWith(100, 250);
      // After parallel batch (pages 2-3): 250 loaded
      expect(onProgress).toHaveBeenCalledWith(250, 250);
    });
  });

  describe('[P1] Query parameters', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue(
        createMockResponse([], { page: 1, limit: 100, total: 0, totalPages: 1 })
      );
    });

    it('should include status filter', async () => {
      await fetchAllLeadsForExport({ status: ['new', 'contacted'] });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('status=new%2Ccontacted'),
        expect.any(Object)
      );
    });

    it('should include owner filter', async () => {
      await fetchAllLeadsForExport({ owner: ['user-1'] });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('owner=user-1'),
        expect.any(Object)
      );
    });

    it('should include search filter', async () => {
      await fetchAllLeadsForExport({ search: 'test' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=test'),
        expect.any(Object)
      );
    });

    it('should include sort params', async () => {
      await fetchAllLeadsForExport({ sortBy: 'date', sortDir: 'desc' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=date'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sortDir=desc'),
        expect.any(Object)
      );
    });

    it('should include date range params', async () => {
      await fetchAllLeadsForExport({ from: '2026-01-01', to: '2026-01-31' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('from=2026-01-01'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('to=2026-01-31'),
        expect.any(Object)
      );
    });

    it('should include leadSource filter', async () => {
      await fetchAllLeadsForExport({ leadSource: 'Brevo' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('leadSource=Brevo'),
        expect.any(Object)
      );
    });

    it('should always set page=1 and limit=100 for first request', async () => {
      await fetchAllLeadsForExport({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=100'),
        expect.any(Object)
      );
    });
  });

  describe('[P1] Error handling', () => {
    it('should throw ExportAllError when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      try {
        await fetchAllLeadsForExport({});
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ExportAllError);
        expect((error as ExportAllError).statusCode).toBe(500);
      }
    });

    it('should throw ExportAllError when success is false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            error: { message: 'Export failed' },
          }),
      });

      try {
        await fetchAllLeadsForExport({});
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ExportAllError);
        expect((error as ExportAllError).message).toBe('Export failed');
      }
    });

    it('should throw error on subsequent page failure', async () => {
      const page1Leads = createMockLeads(100, 1);

      mockFetch
        .mockResolvedValueOnce(
          createMockResponse(page1Leads, { page: 1, limit: 100, total: 200, totalPages: 2 })
        )
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
        });

      await expect(fetchAllLeadsForExport({})).rejects.toThrow(ExportAllError);
    });
  });

  describe('[P2] Edge cases', () => {
    it('should handle empty result', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse([], { page: 1, limit: 100, total: 0, totalPages: 0 })
      );

      const result = await fetchAllLeadsForExport({});

      expect(result.leads).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should not call progress callback if not provided', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(createMockLeads(10), { page: 1, limit: 100, total: 10, totalPages: 1 })
      );

      // Should not throw even without onProgress
      await expect(fetchAllLeadsForExport({})).resolves.not.toThrow();
    });
  });
});
