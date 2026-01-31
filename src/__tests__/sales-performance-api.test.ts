/**
 * Sales Performance API Tests
 * Story 3.1: Sales Team Performance Table
 * Story 3.6: Period Filter for Sales Performance
 * Tests for fetchSalesPerformance and SalesApiError
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchSalesPerformance, SalesApiError } from '../lib/api/sales-performance';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('SalesApiError', () => {
  it('[P1] should create error with message', () => {
    const error = new SalesApiError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('SalesApiError');
  });

  it('[P1] should create error with status code', () => {
    const error = new SalesApiError('Test error', 500);
    expect(error.statusCode).toBe(500);
  });

  it('[P1] should create error with code', () => {
    const error = new SalesApiError('Test error', 500, 'INTERNAL_ERROR');
    expect(error.code).toBe('INTERNAL_ERROR');
  });
});

describe('fetchSalesPerformance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const mockSalesData = {
    teamPerformance: [
      {
        userId: 'user-1',
        name: 'Sales Rep 1',
        email: 'rep1@company.com',
        claimed: 10,
        contacted: 8,
        closed: 5,
        lost: 2,
        unreachable: 1,
        conversionRate: 50,
        avgResponseTime: 120,
      },
    ],
    summary: {
      totalClaimed: 10,
      totalContacted: 8,
      totalClosed: 5,
      avgConversionRate: 50,
      avgResponseTime: 120,
    },
  };

  describe('[P1] Successful requests', () => {
    it('should fetch sales performance successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockSalesData,
          }),
      });

      const result = await fetchSalesPerformance();

      expect(result.teamPerformance).toEqual(mockSalesData.teamPerformance);
      expect(result.summary).toEqual(mockSalesData.summary);
    });

    it('should include credentials for auth', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockSalesData,
          }),
      });

      await fetchSalesPerformance();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });

    it('should call correct URL without params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockSalesData,
          }),
      });

      await fetchSalesPerformance();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/sales-performance',
        expect.any(Object)
      );
    });
  });

  describe('[P1] Period parameters', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockSalesData,
          }),
      });
    });

    it('should include period param for week', async () => {
      await fetchSalesPerformance({ period: 'week' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('period=week'),
        expect.any(Object)
      );
    });

    it('should include period param for month', async () => {
      await fetchSalesPerformance({ period: 'month' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('period=month'),
        expect.any(Object)
      );
    });

    it('should include period param for quarter', async () => {
      await fetchSalesPerformance({ period: 'quarter' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('period=quarter'),
        expect.any(Object)
      );
    });

    it('should map lastQuarter to custom period', async () => {
      await fetchSalesPerformance({ period: 'lastQuarter' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('period=custom'),
        expect.any(Object)
      );
    });

    it('should include dateFrom as startDate', async () => {
      await fetchSalesPerformance({ dateFrom: '2026-01-01' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2026-01-01'),
        expect.any(Object)
      );
    });

    it('should include dateTo as endDate', async () => {
      await fetchSalesPerformance({ dateTo: '2026-01-31' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('endDate=2026-01-31'),
        expect.any(Object)
      );
    });

    it('should include all params together', async () => {
      await fetchSalesPerformance({
        period: 'custom',
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
      });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('period=custom');
      expect(calledUrl).toContain('startDate=2026-01-01');
      expect(calledUrl).toContain('endDate=2026-01-31');
    });
  });

  describe('[P1] Error handling', () => {
    it('should throw SalesApiError for 503 status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

      try {
        await fetchSalesPerformance();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(SalesApiError);
        expect((error as SalesApiError).statusCode).toBe(503);
        expect((error as SalesApiError).code).toBe('SERVICE_UNAVAILABLE');
      }
    });

    it('should throw SalesApiError for other HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      try {
        await fetchSalesPerformance();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(SalesApiError);
        expect((error as SalesApiError).statusCode).toBe(500);
      }
    });

    it('should throw SalesApiError when success is false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Access denied' },
          }),
      });

      try {
        await fetchSalesPerformance();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(SalesApiError);
        expect((error as SalesApiError).code).toBe('FORBIDDEN');
        expect((error as SalesApiError).message).toBe('Access denied');
      }
    });

    it('should handle unknown error in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: false,
            // No error object
          }),
      });

      await expect(fetchSalesPerformance()).rejects.toThrow('Unknown error occurred');
    });

    it('should throw error when data is missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            data: null,
          }),
      });

      try {
        await fetchSalesPerformance();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(SalesApiError);
        expect((error as SalesApiError).code).toBe('INVALID_RESPONSE');
      }
    });

    it('should throw error when teamPerformance is missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            data: { summary: {} }, // Missing teamPerformance
          }),
      });

      try {
        await fetchSalesPerformance();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(SalesApiError);
        expect((error as SalesApiError).code).toBe('INVALID_RESPONSE');
      }
    });
  });
});
