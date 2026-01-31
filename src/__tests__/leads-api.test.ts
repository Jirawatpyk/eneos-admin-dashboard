/**
 * Leads API Tests
 * Story 4.1: Lead List Table
 * Story 4.8: Lead Detail Modal
 * Tests for fetchLeads, fetchLeadById, and LeadsApiError
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchLeads, fetchLeadById, LeadsApiError } from '../lib/api/leads';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('LeadsApiError', () => {
  it('[P1] should create error with message', () => {
    const error = new LeadsApiError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('LeadsApiError');
  });

  it('[P1] should create error with status code', () => {
    const error = new LeadsApiError('Test error', 404);
    expect(error.statusCode).toBe(404);
  });

  it('[P1] should create error with code', () => {
    const error = new LeadsApiError('Test error', 404, 'NOT_FOUND');
    expect(error.code).toBe('NOT_FOUND');
  });
});

describe('fetchLeads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('[P1] Successful requests', () => {
    const mockLeads = [
      {
        id: 1,
        customerName: 'Test Customer',
        email: 'test@example.com',
        company: 'Test Corp',
        status: 'new',
      },
    ];
    const mockPagination = { page: 1, limit: 20, total: 1, totalPages: 1 };

    it('should fetch leads successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { leads: mockLeads, pagination: mockPagination },
          }),
      });

      const result = await fetchLeads();

      expect(result.leads).toEqual(mockLeads);
      expect(result.pagination).toEqual(mockPagination);
    });

    it('should include credentials for auth', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { leads: [], pagination: mockPagination },
          }),
      });

      await fetchLeads();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });

    it('should return availableFilters when provided', async () => {
      const availableFilters = {
        leadSources: ['Brevo', 'Manual'],
        owners: [{ id: '1', name: 'Sales Rep' }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { leads: mockLeads, pagination: mockPagination, availableFilters },
          }),
      });

      const result = await fetchLeads();

      expect(result.availableFilters).toEqual(availableFilters);
    });
  });

  describe('[P1] Query parameters', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { leads: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
          }),
      });
    });

    it('should include page and limit params', async () => {
      await fetchLeads({ page: 2, limit: 50 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=50'),
        expect.any(Object)
      );
    });

    it('should join status array with comma', async () => {
      await fetchLeads({ status: ['new', 'contacted'] });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('status=new%2Ccontacted'),
        expect.any(Object)
      );
    });

    it('should join owner array with comma', async () => {
      await fetchLeads({ owner: ['user-1', 'user-2'] });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('owner=user-1%2Cuser-2'),
        expect.any(Object)
      );
    });

    it('should include search param', async () => {
      await fetchLeads({ search: 'test company' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=test+company'),
        expect.any(Object)
      );
    });

    it('should include sort params', async () => {
      await fetchLeads({ sortBy: 'date', sortDir: 'desc' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=date'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sortDir=desc'),
        expect.any(Object)
      );
    });

    it('should include date range params (from/to)', async () => {
      await fetchLeads({ from: '2026-01-01', to: '2026-01-31' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('from=2026-01-01'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('to=2026-01-31'),
        expect.any(Object)
      );
    });

    it('should include leadSource param', async () => {
      await fetchLeads({ leadSource: 'Brevo' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('leadSource=Brevo'),
        expect.any(Object)
      );
    });

    it('should not include empty status array', async () => {
      await fetchLeads({ status: [] });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).not.toContain('status=');
    });

    it('should not include empty owner array', async () => {
      await fetchLeads({ owner: [] });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).not.toContain('owner=');
    });
  });

  describe('[P1] Error handling', () => {
    it('should throw LeadsApiError for 503 status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

      try {
        await fetchLeads();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(LeadsApiError);
        expect((error as LeadsApiError).statusCode).toBe(503);
        expect((error as LeadsApiError).code).toBe('SERVICE_UNAVAILABLE');
      }
    });

    it('should throw LeadsApiError for other HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      try {
        await fetchLeads();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(LeadsApiError);
        expect((error as LeadsApiError).statusCode).toBe(500);
      }
    });

    it('should throw LeadsApiError when success is false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Invalid params' },
          }),
      });

      try {
        await fetchLeads();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(LeadsApiError);
        expect((error as LeadsApiError).code).toBe('VALIDATION_ERROR');
        expect((error as LeadsApiError).message).toBe('Invalid params');
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

      await expect(fetchLeads()).rejects.toThrow('Unknown error occurred');
    });
  });
});

describe('fetchLeadById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('[P1] Successful requests', () => {
    const mockLeadDetail = {
      id: 123,
      customerName: 'Test Customer',
      email: 'test@example.com',
      company: 'Test Corp',
      status: 'new',
      history: [],
      metrics: { responseTime: null, closingTime: null },
    };

    it('should fetch lead by ID successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockLeadDetail,
          }),
      });

      const result = await fetchLeadById(123);

      expect(result).toEqual(mockLeadDetail);
    });

    it('should call correct URL with lead ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockLeadDetail,
          }),
      });

      await fetchLeadById(456);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/leads/456'),
        expect.any(Object)
      );
    });

    it('should include credentials for auth', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockLeadDetail,
          }),
      });

      await fetchLeadById(123);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });
  });

  describe('[P1] Error handling', () => {
    it('should throw LeadsApiError for 404 status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      try {
        await fetchLeadById(999);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(LeadsApiError);
        expect((error as LeadsApiError).statusCode).toBe(404);
        expect((error as LeadsApiError).code).toBe('NOT_FOUND');
        expect((error as LeadsApiError).message).toBe('Lead not found');
      }
    });

    it('should throw LeadsApiError for 503 status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

      try {
        await fetchLeadById(123);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(LeadsApiError);
        expect((error as LeadsApiError).statusCode).toBe(503);
        expect((error as LeadsApiError).code).toBe('SERVICE_UNAVAILABLE');
      }
    });

    it('should throw LeadsApiError for other HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      try {
        await fetchLeadById(123);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(LeadsApiError);
        expect((error as LeadsApiError).statusCode).toBe(500);
      }
    });

    it('should throw LeadsApiError when success is false', async () => {
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
        await fetchLeadById(123);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(LeadsApiError);
        expect((error as LeadsApiError).code).toBe('FORBIDDEN');
      }
    });
  });
});
