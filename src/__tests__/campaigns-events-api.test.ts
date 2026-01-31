/**
 * Campaign Events API Tests
 * Story 5.7: Campaign Detail Sheet
 * Tests for fetchCampaignEvents function (Task 3)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchCampaignEvents, CampaignApiError } from '../lib/api/campaigns';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('fetchCampaignEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const mockEventsResponse = {
    success: true,
    data: {
      data: [
        {
          eventId: 12345,
          email: 'john@example.com',
          event: 'click',
          eventAt: '2026-01-30T10:05:00.000Z',
          url: 'https://example.com/promo',
        },
        {
          eventId: 12344,
          email: 'jane@company.co.th',
          event: 'opened',
          eventAt: '2026-01-30T09:55:00.000Z',
          url: null,
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      },
    },
  };

  describe('Successful requests', () => {
    it('should fetch campaign events successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEventsResponse),
      });

      const result = await fetchCampaignEvents({ campaignId: 42 });

      expect(result.data.data).toHaveLength(2);
      expect(result.data.pagination.total).toBe(2);
    });

    it('should use correct API URL with campaign ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEventsResponse),
      });

      await fetchCampaignEvents({ campaignId: 42 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/campaigns/42/events'),
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
    });

    it('should pass pagination params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEventsResponse),
      });

      await fetchCampaignEvents({ campaignId: 42, page: 2, limit: 50 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2&limit=50'),
        expect.any(Object)
      );
    });

    it('should pass event filter param', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEventsResponse),
      });

      await fetchCampaignEvents({ campaignId: 42, event: 'click' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('event=click'),
        expect.any(Object)
      );
    });

    it('should pass date range params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEventsResponse),
      });

      await fetchCampaignEvents({
        campaignId: 42,
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
      });

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('dateFrom=2026-01-01');
      expect(url).toContain('dateTo=2026-01-31');
    });

    it('should not include optional params when not provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEventsResponse),
      });

      await fetchCampaignEvents({ campaignId: 42 });

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).not.toContain('event=');
      expect(url).not.toContain('dateFrom=');
      expect(url).not.toContain('dateTo=');
    });
  });

  describe('Error handling', () => {
    it('should throw CampaignApiError for 503 status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

      await expect(fetchCampaignEvents({ campaignId: 42 })).rejects.toThrow(
        'Campaign service temporarily unavailable'
      );
    });

    it('should throw CampaignApiError for 404 status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      try {
        await fetchCampaignEvents({ campaignId: 999 });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(CampaignApiError);
        expect((error as CampaignApiError).message).toBe('Campaign not found');
        expect((error as CampaignApiError).code).toBe('NOT_FOUND');
      }
    });

    it('should throw CampaignApiError for other HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      try {
        await fetchCampaignEvents({ campaignId: 42 });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(CampaignApiError);
        expect((error as CampaignApiError).statusCode).toBe(500);
      }
    });

    it('should throw when success is false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: false,
          error: { message: 'Invalid campaign', code: 'INVALID' },
        }),
      });

      await expect(fetchCampaignEvents({ campaignId: 42 })).rejects.toThrow('Invalid campaign');
    });

    it('should use default error message when none provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: false }),
      });

      await expect(fetchCampaignEvents({ campaignId: 42 })).rejects.toThrow('Unknown error occurred');
    });
  });
});
