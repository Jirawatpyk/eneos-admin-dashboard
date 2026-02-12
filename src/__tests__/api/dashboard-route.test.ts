/**
 * Dashboard API Route Tests
 * Tests for /api/admin/dashboard route handler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock getSessionOrUnauthorized
const mockGetSessionOrUnauthorized = vi.fn();
vi.mock('@/lib/supabase/auth-helpers', () => ({
  getSessionOrUnauthorized: () => mockGetSessionOrUnauthorized(),
}));

import { GET } from '@/app/api/admin/dashboard/route';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console to suppress logs during tests
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

describe('GET /api/admin/dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://backend:3000';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  function createRequest(url: string = '/api/admin/dashboard'): NextRequest {
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
      expect(data.error.message).toBe('Not authenticated');
    });
  });

  describe('[P1] Successful requests', () => {
    it('should forward request to backend with auth header', async () => {
      mockSession('my-supabase-jwt');

      const mockDashboardData = {
        success: true,
        data: { overview: { totalLeads: 100, conversion: 25 }, trends: [] },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDashboardData),
      });

      const response = await GET(createRequest());
      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/dashboard'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer my-supabase-jwt',
          }),
        })
      );

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.overview.totalLeads).toBe(100);
    });

    it('should use default period=month when not provided', async () => {
      mockSession();
      mockFetch.mockResolvedValue({
        ok: true, status: 200,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      await GET(createRequest('/api/admin/dashboard'));

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('period=month'),
        expect.any(Object)
      );
    });

    it('should forward custom period param to backend', async () => {
      mockSession();
      mockFetch.mockResolvedValue({
        ok: true, status: 200,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      await GET(createRequest('/api/admin/dashboard?period=week'));

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('period=week'),
        expect.any(Object)
      );
    });
  });

  describe('[P1] Error handling', () => {
    it('should forward backend error responses', async () => {
      mockSession();
      mockFetch.mockResolvedValue({
        ok: false, status: 403,
        json: () => Promise.resolve({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } }),
      });

      const response = await GET(createRequest());
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should return 500 when fetch throws', async () => {
      mockSession();
      mockFetch.mockRejectedValue(new Error('Network connection failed'));

      const response = await GET(createRequest());
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('PROXY_ERROR');
      expect(data.error.message).toBe('Network connection failed');
    });

    it('should handle non-Error exceptions', async () => {
      mockSession();
      mockFetch.mockRejectedValue('String error');

      const response = await GET(createRequest());
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Failed to fetch dashboard data');
    });
  });
});
