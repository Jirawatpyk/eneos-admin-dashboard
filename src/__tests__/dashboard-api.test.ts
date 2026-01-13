/**
 * Dashboard API Tests
 * Story 2.1: KPI Cards
 * Tests for fetchDashboardData function
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchDashboardData, DashboardApiError } from '../lib/api/dashboard';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('fetchDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Successful requests', () => {
    it('should fetch dashboard data successfully', async () => {
      const mockData = {
        summary: {
          totalLeads: 100,
          claimed: 50,
          contacted: 30,
          closed: 10,
          lost: 5,
          unreachable: 5,
          conversionRate: 10,
        },
        trends: { daily: [] },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockData }),
      });

      const result = await fetchDashboardData('month');

      expect(result).toEqual(mockData);
    });

    it('should use correct API URL with period', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      await fetchDashboardData('week');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/dashboard?period=week'),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
      );
    });

    it('should use month as default period', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      await fetchDashboardData();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('period=month'),
        expect.any(Object)
      );
    });
  });

  describe('Error handling', () => {
    it('should throw DashboardApiError for 503 status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

      try {
        await fetchDashboardData();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(DashboardApiError);
        expect((error as DashboardApiError).message).toContain('Service temporarily unavailable');
      }
    });

    it('should throw DashboardApiError for other HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      try {
        await fetchDashboardData();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(DashboardApiError);
        expect((error as DashboardApiError).message).toContain('Failed to fetch dashboard data');
      }
    });

    it('should throw DashboardApiError when success is false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: false,
          error: { message: 'Invalid token', code: 'AUTH_ERROR' },
        }),
      });

      await expect(fetchDashboardData()).rejects.toThrow('Invalid token');
    });

    it('should include status code in error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      try {
        await fetchDashboardData();
      } catch (error) {
        expect(error).toBeInstanceOf(DashboardApiError);
        expect((error as DashboardApiError).statusCode).toBe(401);
      }
    });

    it('should handle unknown error in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: false,
        }),
      });

      await expect(fetchDashboardData()).rejects.toThrow('Unknown error occurred');
    });
  });
});

describe('DashboardApiError', () => {
  it('should create error with message', () => {
    const error = new DashboardApiError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('DashboardApiError');
  });

  it('should create error with status code', () => {
    const error = new DashboardApiError('Test error', 404);
    expect(error.statusCode).toBe(404);
  });

  it('should create error with code', () => {
    const error = new DashboardApiError('Test error', 400, 'VALIDATION_ERROR');
    expect(error.code).toBe('VALIDATION_ERROR');
  });
});
