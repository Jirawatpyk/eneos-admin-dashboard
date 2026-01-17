/**
 * Leads API Route Tests
 * Story 4.1: Lead List Table
 *
 * Tests for API proxy route authentication and request handling
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/leads/route';

// Mock next-auth/jwt
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

import { getToken } from 'next-auth/jwt';

describe('GET /api/admin/leads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getToken).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3001/api/admin/leads');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 when no idToken in session', async () => {
    vi.mocked(getToken).mockResolvedValue({
      email: 'test@eneos.co.th',
      // No idToken
    });

    const request = new NextRequest('http://localhost:3001/api/admin/leads');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NO_TOKEN');
  });

  it('forwards request to backend with auth token', async () => {
    vi.mocked(getToken).mockResolvedValue({
      email: 'test@eneos.co.th',
      idToken: 'mock-google-id-token',
    });

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
      }),
    });

    const request = new NextRequest('http://localhost:3001/api/admin/leads');
    const response = await GET(request);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/leads'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-google-id-token',
        }),
      })
    );
    expect(response.status).toBe(200);
  });

  it('forwards query parameters to backend', async () => {
    vi.mocked(getToken).mockResolvedValue({
      email: 'test@eneos.co.th',
      idToken: 'mock-google-id-token',
    });

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [],
        pagination: { page: 2, limit: 25, total: 100, totalPages: 4 },
      }),
    });

    const request = new NextRequest(
      'http://localhost:3001/api/admin/leads?page=2&limit=25&status=new&sortBy=createdAt&sortDir=desc'
    );
    await GET(request);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/page=2/),
      expect.anything()
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/limit=25/),
      expect.anything()
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/status=new/),
      expect.anything()
    );
    // Bugfix 2026-01-17: Backend now accepts createdAt directly (added to SORT_OPTIONS.LEADS)
    // Frontend TanStack Table uses 'createdAt', backend stores as 'date' - both are now valid
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/sortBy=createdAt/),
      expect.anything()
    );
    // Bugfix 2026-01-17: Frontend sends sortDir, API proxy maps to sortOrder for backend
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/sortOrder=desc/),
      expect.anything()
    );
  });

  it('returns 500 on fetch error', async () => {
    vi.mocked(getToken).mockResolvedValue({
      email: 'test@eneos.co.th',
      idToken: 'mock-google-id-token',
    });

    mockFetch.mockRejectedValue(new Error('Network error'));

    const request = new NextRequest('http://localhost:3001/api/admin/leads');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROXY_ERROR');
  });

  it('forwards backend error status codes', async () => {
    vi.mocked(getToken).mockResolvedValue({
      email: 'test@eneos.co.th',
      idToken: 'mock-google-id-token',
    });

    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        success: false,
        error: { code: 'SERVICE_UNAVAILABLE', message: 'Service temporarily unavailable' },
      }),
    });

    const request = new NextRequest('http://localhost:3001/api/admin/leads');
    const response = await GET(request);

    expect(response.status).toBe(503);
  });
});
