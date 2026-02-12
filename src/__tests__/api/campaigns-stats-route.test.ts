/**
 * Campaign Stats API Route Tests
 * Story 5.3: Campaign Summary Cards
 * Tests for /api/admin/campaigns/stats route handler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mockGetSessionOrUnauthorized = vi.fn();
vi.mock('@/lib/supabase/auth-helpers', () => ({
  getSessionOrUnauthorized: () => mockGetSessionOrUnauthorized(),
}));

import { GET } from '@/app/api/admin/campaigns/stats/route';

const mockFetch = vi.fn();
global.fetch = mockFetch;

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

describe('GET /api/admin/campaigns/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://backend:3000';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  function createRequest(url: string = '/api/admin/campaigns/stats'): NextRequest {
    return new NextRequest(new URL(url, 'http://localhost:3001'));
  }

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
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true, data: { data: [{ campaignId: 1, campaignName: 'Test', delivered: 100 }], pagination: { page: 1, limit: 100, total: 1, totalPages: 1 } },
        }),
      });

      const response = await GET(createRequest());
      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/campaigns/stats'),
        expect.objectContaining({
          headers: expect.objectContaining({ 'Authorization': 'Bearer my-token' }),
        })
      );

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should include Cache-Control header in response', async () => {
      mockSession();
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }) });

      const response = await GET(createRequest());

      expect(response.headers.get('Cache-Control')).toBe('private, max-age=60');
    });

    it('should forward pagination params to backend', async () => {
      mockSession();
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }) });

      await GET(createRequest('/api/admin/campaigns/stats?page=2&limit=50'));

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('page=2'), expect.any(Object));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('limit=50'), expect.any(Object));
    });

    it('should use default pagination when not provided', async () => {
      mockSession();
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }) });

      await GET(createRequest());

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('page=1'), expect.any(Object));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('limit=100'), expect.any(Object));
    });
  });

  describe('[P1] Error handling', () => {
    it('should forward backend error responses', async () => {
      mockSession();
      mockFetch.mockResolvedValue({
        ok: false, status: 429,
        json: () => Promise.resolve({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } }),
      });

      const response = await GET(createRequest());
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error.code).toBe('RATE_LIMITED');
    });

    it('should return 500 when fetch throws', async () => {
      mockSession();
      mockFetch.mockRejectedValue(new Error('Network connection failed'));

      const response = await GET(createRequest());
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('Network connection failed');
    });
  });

  describe('[P2] Sorting parameters', () => {
    it('should forward sorting params to backend', async () => {
      mockSession();
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }) });

      await GET(createRequest('/api/admin/campaigns/stats?sortBy=Campaign_Name&sortOrder=asc'));

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('sortBy=Campaign_Name'), expect.any(Object));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('sortOrder=asc'), expect.any(Object));
    });

    it('should use default sorting when not provided', async () => {
      mockSession();
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }) });

      await GET(createRequest());

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('sortBy=Last_Updated'), expect.any(Object));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('sortOrder=desc'), expect.any(Object));
    });
  });
});
