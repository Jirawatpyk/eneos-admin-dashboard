/**
 * Sales Performance Trend API Route Tests
 * Story 12-1: Proxy Migration — Auth coverage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mockGetSessionOrUnauthorized = vi.fn();
vi.mock('@/lib/supabase/auth-helpers', () => ({
  getSessionOrUnauthorized: () => mockGetSessionOrUnauthorized(),
}));

import { GET } from '@/app/api/admin/sales-performance/trend/route';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function mockSession(token = 'mock-supabase-jwt') {
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

function createRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/admin/sales-performance/trend');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url);
}

describe('GET /api/admin/sales-performance/trend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    mockNoSession();

    const response = await GET(createRequest());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should forward request with Bearer token', async () => {
    mockSession('trend-jwt');
    mockFetch.mockResolvedValue({
      ok: true, status: 200,
      json: async () => ({ success: true, data: { trend: [], teamAverage: [] } }),
    });

    const response = await GET(createRequest({ userId: 'user-1', period: 'week' }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/sales-performance/trend'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer trend-jwt',
        }),
      })
    );
  });

  it('should return 500 on fetch error', async () => {
    mockSession();
    mockFetch.mockRejectedValue(new Error('Timeout'));

    const response = await GET(createRequest());
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('PROXY_ERROR');
  });
});
