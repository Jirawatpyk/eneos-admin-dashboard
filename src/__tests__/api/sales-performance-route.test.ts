/**
 * Sales Performance API Route Tests
 * Story 3.1: Sales Team Performance Table
 * Tests for /api/admin/sales-performance route handler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock getSessionOrUnauthorized
const mockGetSessionOrUnauthorized = vi.fn();
vi.mock('@/lib/supabase/auth-helpers', () => ({
  getSessionOrUnauthorized: () => mockGetSessionOrUnauthorized(),
}));

import { GET } from '@/app/api/admin/sales-performance/route';

const mockFetch = vi.fn();
global.fetch = mockFetch;
vi.spyOn(console, 'error').mockImplementation(() => {});

function mockSession(token = 'test-supabase-token') {
  mockGetSessionOrUnauthorized.mockResolvedValue({
    session: { access_token: token, user: { app_metadata: {} } },
    response: null,
  });
}

function mockNoSession() {
  mockGetSessionOrUnauthorized.mockResolvedValue({
    session: null,
    response: NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    ),
  });
}

describe('GET /api/admin/sales-performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://backend:3000';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  function createRequest(url: string = '/api/admin/sales-performance'): NextRequest {
    return new NextRequest(new URL(url, 'http://localhost:3001'));
  }

  const mockBackendResponse = {
    success: true,
    data: {
      period: { start: '2026-01-01', end: '2026-01-31' },
      team: [
        { id: 'user-001', name: 'Sales Rep 1', stats: { claimed: 10, contacted: 8, closed: 5, lost: 2, unreachable: 1, conversionRate: 50, avgResponseTime: 120, avgClosingTime: 1440 } },
        { id: 'user-002', name: 'Sales Rep 2', stats: { claimed: 15, contacted: 12, closed: 8, lost: 3, unreachable: 1, conversionRate: 53.3, avgResponseTime: 90, avgClosingTime: 1200 } },
      ],
      totals: { claimed: 25, contacted: 20, closed: 13, lost: 5, unreachable: 2, conversionRate: 52, avgResponseTime: 105, avgClosingTime: 1320 },
      comparison: null,
    },
  };

  describe('[P0] Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockNoSession();

      const response = await GET(createRequest());
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('[P1] Successful requests', () => {
    it('should forward request to backend with auth header', async () => {
      mockSession('my-token');
      mockFetch.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(mockBackendResponse) });

      const response = await GET(createRequest());

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/sales-performance'),
        expect.objectContaining({
          headers: expect.objectContaining({ 'Authorization': 'Bearer my-token' }),
        })
      );
      expect(response.status).toBe(200);
    });

    it('should transform backend response to frontend format', async () => {
      mockSession();
      mockFetch.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(mockBackendResponse) });

      const response = await GET(createRequest());
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.teamPerformance).toHaveLength(2);
      expect(data.data.teamPerformance[0]).toMatchObject({
        userId: 'user-001', name: 'Sales Rep 1', email: '', claimed: 10, contacted: 8, closed: 5,
      });
    });

    it('should transform totals to summary format', async () => {
      mockSession();
      mockFetch.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(mockBackendResponse) });

      const response = await GET(createRequest());
      const data = await response.json();

      expect(data.data.summary).toMatchObject({
        totalClaimed: 25, totalContacted: 20, totalClosed: 13, avgConversionRate: 52, avgResponseTime: 105,
      });
    });

    it('should forward query params to backend', async () => {
      mockSession();
      mockFetch.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(mockBackendResponse) });

      await GET(createRequest('/api/admin/sales-performance?period=week&sortBy=closed'));

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('period=week'), expect.any(Object));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('sortBy=closed'), expect.any(Object));
    });

    it('should handle empty team array', async () => {
      mockSession();
      mockFetch.mockResolvedValue({
        ok: true, status: 200,
        json: () => Promise.resolve({
          success: true,
          data: {
            period: { start: '2026-01-01', end: '2026-01-31' },
            team: [],
            totals: { claimed: 0, contacted: 0, closed: 0, lost: 0, unreachable: 0, conversionRate: 0, avgResponseTime: 0, avgClosingTime: 0 },
            comparison: null,
          },
        }),
      });

      const response = await GET(createRequest());
      const data = await response.json();

      expect(data.data.teamPerformance).toEqual([]);
      expect(data.data.summary.totalClaimed).toBe(0);
    });
  });

  describe('[P1] Error handling', () => {
    it('should forward backend error responses', async () => {
      mockSession();
      mockFetch.mockResolvedValue({
        ok: false, status: 500,
        json: () => Promise.resolve({ success: false, error: { code: 'SHEETS_ERROR', message: 'Failed to read Google Sheets' } }),
      });

      const response = await GET(createRequest());
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe('SHEETS_ERROR');
    });

    it('should return 500 when fetch throws', async () => {
      mockSession();
      mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));

      const response = await GET(createRequest());
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe('PROXY_ERROR');
      expect(data.error.message).toBe('ECONNREFUSED');
    });

    it('should handle non-Error exceptions', async () => {
      mockSession();
      mockFetch.mockRejectedValue(null);

      const response = await GET(createRequest());
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Failed to fetch sales performance data');
    });
  });

  describe('[P2] Data transformation', () => {
    it('should not include avgClosingTime in transformed teamPerformance', async () => {
      mockSession();
      mockFetch.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(mockBackendResponse) });

      const response = await GET(createRequest());
      const data = await response.json();

      expect(data.data.teamPerformance[0]).not.toHaveProperty('avgClosingTime');
    });
  });
});
