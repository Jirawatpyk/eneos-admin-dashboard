/**
 * Campaign API Tests
 * Story 5.3: Campaign Summary Cards
 * Tests for fetchCampaignStats and aggregateCampaignStats functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchCampaignStats, aggregateCampaignStats, CampaignApiError } from '../lib/api/campaigns';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('fetchCampaignStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Successful requests', () => {
    it('should fetch campaign stats successfully', async () => {
      const mockCampaigns = [
        {
          campaignId: 1,
          campaignName: 'Test Campaign',
          delivered: 100,
          opened: 50,
          clicked: 20,
          uniqueOpens: 45,
          uniqueClicks: 15,
          openRate: 45.0,
          clickRate: 15.0,
          hardBounce: 0,
          softBounce: 0,
          unsubscribe: 0,
          spam: 0,
          firstEvent: '2026-01-15T10:00:00Z',
          lastUpdated: '2026-01-20T10:00:00Z',
        },
      ];
      const mockPagination = { page: 1, limit: 100, total: 1, totalPages: 1 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { data: mockCampaigns, pagination: mockPagination },
          }),
      });

      const result = await fetchCampaignStats();

      expect(result.data.data).toEqual(mockCampaigns);
      expect(result.data.pagination).toEqual(mockPagination);
    });

    it('should use correct API URL with pagination params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              data: [],
              pagination: { page: 2, limit: 50, total: 100, totalPages: 2 },
            },
          }),
      });

      await fetchCampaignStats({ page: 2, limit: 50 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/campaigns/stats?page=2&limit=50'),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
      );
    });

    it('should use default page and limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              data: [],
              pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
            },
          }),
      });

      await fetchCampaignStats();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1&limit=100'),
        expect.any(Object)
      );
    });
  });

  describe('Error handling', () => {
    it('should throw CampaignApiError for 503 status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

      try {
        await fetchCampaignStats();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(CampaignApiError);
        expect((error as CampaignApiError).message).toContain(
          'Campaign service temporarily unavailable'
        );
        expect((error as CampaignApiError).code).toBe('SERVICE_UNAVAILABLE');
      }
    });

    it('should throw CampaignApiError for other HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      try {
        await fetchCampaignStats();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(CampaignApiError);
        expect((error as CampaignApiError).message).toContain(
          'Failed to fetch campaign stats'
        );
        expect((error as CampaignApiError).statusCode).toBe(500);
      }
    });

    it('should throw CampaignApiError when success is false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            error: { message: 'Invalid token', code: 'AUTH_ERROR' },
          }),
      });

      await expect(fetchCampaignStats()).rejects.toThrow('Invalid token');
    });

    it('should include status code in error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      try {
        await fetchCampaignStats();
      } catch (error) {
        expect(error).toBeInstanceOf(CampaignApiError);
        expect((error as CampaignApiError).statusCode).toBe(401);
      }
    });

    it('should handle unknown error in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
          }),
      });

      await expect(fetchCampaignStats()).rejects.toThrow('Unknown error occurred');
    });

    it('should throw CampaignApiError for invalid response format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            data: { notAnArray: true }, // missing data.data array
          }),
      });

      try {
        await fetchCampaignStats();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(CampaignApiError);
        expect((error as CampaignApiError).message).toContain('Invalid response format');
        expect((error as CampaignApiError).code).toBe('INVALID_RESPONSE');
      }
    });
  });
});

describe('aggregateCampaignStats', () => {
  it('should aggregate stats from multiple campaigns', () => {
    const campaigns = [
      {
        campaignId: 1,
        campaignName: 'Campaign 1',
        delivered: 100,
        opened: 60,
        clicked: 25,
        uniqueOpens: 50,
        uniqueClicks: 20,
        openRate: 50.0,
        clickRate: 20.0,
        hardBounce: 0,
        softBounce: 0,
        unsubscribe: 0,
        spam: 0,
        firstEvent: '2026-01-15T10:00:00Z',
        lastUpdated: '2026-01-20T10:00:00Z',
      },
      {
        campaignId: 2,
        campaignName: 'Campaign 2',
        delivered: 200,
        opened: 80,
        clicked: 40,
        uniqueOpens: 70,
        uniqueClicks: 30,
        openRate: 35.0,
        clickRate: 15.0,
        hardBounce: 0,
        softBounce: 0,
        unsubscribe: 0,
        spam: 0,
        firstEvent: '2026-01-18T10:00:00Z',
        lastUpdated: '2026-01-22T10:00:00Z',
      },
    ];

    const result = aggregateCampaignStats(campaigns);

    expect(result.totalCampaigns).toBe(2);
    expect(result.delivered).toBe(300);
    expect(result.opened).toBe(140);
    expect(result.clicked).toBe(65);
    expect(result.uniqueOpens).toBe(120);
    expect(result.uniqueClicks).toBe(50);
    // Open rate: 120 / 300 * 100 = 40.0%
    expect(result.openRate).toBe(40.0);
    // Click rate: 50 / 300 * 100 = 16.7%
    expect(result.clickRate).toBe(16.7);
  });

  it('should handle empty campaigns array', () => {
    const result = aggregateCampaignStats([]);

    expect(result.totalCampaigns).toBe(0);
    expect(result.delivered).toBe(0);
    expect(result.opened).toBe(0);
    expect(result.clicked).toBe(0);
    expect(result.uniqueOpens).toBe(0);
    expect(result.uniqueClicks).toBe(0);
    expect(result.openRate).toBe(0);
    expect(result.clickRate).toBe(0);
  });

  it('should handle zero delivered (avoid division by zero)', () => {
    const campaigns = [
      {
        campaignId: 1,
        campaignName: 'Empty Campaign',
        delivered: 0,
        opened: 0,
        clicked: 0,
        uniqueOpens: 0,
        uniqueClicks: 0,
        openRate: 0,
        clickRate: 0,
        hardBounce: 0,
        softBounce: 0,
        unsubscribe: 0,
        spam: 0,
        firstEvent: '2026-01-15T10:00:00Z',
        lastUpdated: '2026-01-20T10:00:00Z',
      },
    ];

    const result = aggregateCampaignStats(campaigns);

    expect(result.openRate).toBe(0);
    expect(result.clickRate).toBe(0);
  });

  it('should round rates to 1 decimal place', () => {
    const campaigns = [
      {
        campaignId: 1,
        campaignName: 'Test',
        delivered: 1000,
        opened: 333,
        clicked: 167,
        uniqueOpens: 333,
        uniqueClicks: 167,
        openRate: 33.3,
        clickRate: 16.7,
        hardBounce: 0,
        softBounce: 0,
        unsubscribe: 0,
        spam: 0,
        firstEvent: '2026-01-15T10:00:00Z',
        lastUpdated: '2026-01-20T10:00:00Z',
      },
    ];

    const result = aggregateCampaignStats(campaigns);

    // 333/1000 = 33.3%
    expect(result.openRate).toBe(33.3);
    // 167/1000 = 16.7%
    expect(result.clickRate).toBe(16.7);
  });

  it('should calculate rates correctly for single campaign', () => {
    const campaigns = [
      {
        campaignId: 1,
        campaignName: 'Single Campaign',
        delivered: 500,
        opened: 250,
        clicked: 100,
        uniqueOpens: 200,
        uniqueClicks: 75,
        openRate: 40.0,
        clickRate: 15.0,
        hardBounce: 0,
        softBounce: 0,
        unsubscribe: 0,
        spam: 0,
        firstEvent: '2026-01-15T10:00:00Z',
        lastUpdated: '2026-01-20T10:00:00Z',
      },
    ];

    const result = aggregateCampaignStats(campaigns);

    expect(result.totalCampaigns).toBe(1);
    expect(result.delivered).toBe(500);
    expect(result.uniqueOpens).toBe(200);
    expect(result.uniqueClicks).toBe(75);
    // Open rate: 200 / 500 * 100 = 40%
    expect(result.openRate).toBe(40.0);
    // Click rate: 75 / 500 * 100 = 15%
    expect(result.clickRate).toBe(15.0);
  });
});

describe('CampaignApiError', () => {
  it('should create error with message', () => {
    const error = new CampaignApiError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('CampaignApiError');
  });

  it('should create error with status code', () => {
    const error = new CampaignApiError('Test error', 404);
    expect(error.statusCode).toBe(404);
  });

  it('should create error with code', () => {
    const error = new CampaignApiError('Test error', 400, 'VALIDATION_ERROR');
    expect(error.code).toBe('VALIDATION_ERROR');
  });
});
