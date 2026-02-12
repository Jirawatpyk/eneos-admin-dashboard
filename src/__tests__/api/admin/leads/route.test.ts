/**
 * Leads API Route Tests
 * Story 4.1: Lead List Table
 *
 * Tests for API proxy route authentication and request handling
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mockGetSessionOrUnauthorized = vi.fn();
vi.mock('@/lib/supabase/auth-helpers', () => ({
  getSessionOrUnauthorized: () => mockGetSessionOrUnauthorized(),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { GET } from '@/app/api/admin/leads/route';

function mockSession(token = 'mock-supabase-token') {
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

describe('GET /api/admin/leads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockNoSession();

    const request = new NextRequest('http://localhost:3001/api/admin/leads');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('forwards request to backend with auth token', async () => {
    mockSession('mock-supabase-token');

    mockFetch.mockResolvedValue({
      ok: true, status: 200,
      json: async () => ({ success: true, data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } }),
    });

    const request = new NextRequest('http://localhost:3001/api/admin/leads');
    const response = await GET(request);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/leads'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-supabase-token',
        }),
      })
    );
    expect(response.status).toBe(200);
  });

  it('forwards query parameters to backend', async () => {
    mockSession();

    mockFetch.mockResolvedValue({
      ok: true, status: 200,
      json: async () => ({ success: true, data: [], pagination: { page: 2, limit: 25, total: 100, totalPages: 4 } }),
    });

    const request = new NextRequest(
      'http://localhost:3001/api/admin/leads?page=2&limit=25&status=new&sortBy=createdAt&sortDir=desc'
    );
    await GET(request);

    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/page=2/), expect.anything());
    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/limit=25/), expect.anything());
    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/status=new/), expect.anything());
    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/sortBy=createdAt/), expect.anything());
    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/sortOrder=desc/), expect.anything());
  });

  it('forwards combined search and status parameters to backend', async () => {
    mockSession();

    mockFetch.mockResolvedValue({
      ok: true, status: 200,
      json: async () => ({
        success: true,
        data: { data: [], pagination: { page: 1, limit: 20, total: 45, totalPages: 3 } },
      }),
    });

    const request = new NextRequest(
      'http://localhost:3001/api/admin/leads?search=ENEOS&status=contacted,closed&page=1&limit=20'
    );
    const response = await GET(request);
    const data = await response.json();

    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain('search=ENEOS');
    expect(calledUrl).toContain('status=contacted%2Cclosed');
    expect(data.data.pagination.total).toBe(45);
  });

  it('returns 500 on fetch error', async () => {
    mockSession();
    mockFetch.mockRejectedValue(new Error('Network error'));

    const request = new NextRequest('http://localhost:3001/api/admin/leads');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('PROXY_ERROR');
  });

  it('forwards backend error status codes', async () => {
    mockSession();
    mockFetch.mockResolvedValue({
      ok: false, status: 503,
      json: async () => ({ success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Service temporarily unavailable' } }),
    });

    const request = new NextRequest('http://localhost:3001/api/admin/leads');
    const response = await GET(request);

    expect(response.status).toBe(503);
  });
});
