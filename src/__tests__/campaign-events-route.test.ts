/**
 * Campaign Events API Route Tests
 * Story 5.7: Campaign Detail Sheet
 *
 * Tests for GET /api/admin/campaigns/[id]/events
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock getSessionOrUnauthorized
const mockGetSessionOrUnauthorized = vi.fn();
vi.mock('@/lib/supabase/auth-helpers', () => ({
  getSessionOrUnauthorized: () => mockGetSessionOrUnauthorized(),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocks
const { GET } = await import('../app/api/admin/campaigns/[id]/events/route');

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

function createParams(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

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

describe('GET /api/admin/campaigns/[id]/events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession();
  });

  // ===== Campaign ID Validation =====
  describe('Campaign ID validation', () => {
    it('should reject non-numeric campaign ID', async () => {
      const request = createRequest('http://localhost:3000/api/admin/campaigns/abc/events');
      const response = await GET(request, createParams('abc'));

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('INVALID_ID');
    });

    it('should reject campaign ID with special characters', async () => {
      const request = createRequest('http://localhost:3000/api/admin/campaigns/1;DROP/events');
      const response = await GET(request, createParams('1;DROP'));

      expect(response.status).toBe(400);
    });

    it('should accept valid numeric campaign ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true, status: 200,
        json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }),
      });

      const request = createRequest('http://localhost:3000/api/admin/campaigns/42/events');
      const response = await GET(request, createParams('42'));

      expect(response.status).toBe(200);
    });
  });

  // ===== Authentication =====
  describe('Authentication', () => {
    it('should return 401 when no session', async () => {
      mockNoSession();

      const request = createRequest('http://localhost:3000/api/admin/campaigns/42/events');
      const response = await GET(request, createParams('42'));

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error.code).toBe('UNAUTHORIZED');
    });
  });

  // ===== Query Parameter Forwarding =====
  describe('Query parameter forwarding', () => {
    it('should forward page and limit params to backend', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }),
      });

      const request = createRequest('http://localhost:3000/api/admin/campaigns/42/events?page=2&limit=50');
      await GET(request, createParams('42'));

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('limit=50');
    });

    it('should forward event filter param', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }),
      });

      const request = createRequest('http://localhost:3000/api/admin/campaigns/42/events?event=click');
      await GET(request, createParams('42'));

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('event=click');
    });

    it('should send Authorization header with Supabase token', async () => {
      mockSession('my-supabase-jwt');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }),
      });

      const request = createRequest('http://localhost:3000/api/admin/campaigns/42/events');
      await GET(request, createParams('42'));

      const calledHeaders = mockFetch.mock.calls[0][1].headers;
      expect(calledHeaders.Authorization).toBe('Bearer my-supabase-jwt');
    });
  });

  // ===== Error Handling =====
  describe('Error handling', () => {
    it('should forward backend error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false, status: 404,
        json: () => Promise.resolve({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign not found' } }),
      });

      const request = createRequest('http://localhost:3000/api/admin/campaigns/999/events');
      const response = await GET(request, createParams('999'));

      expect(response.status).toBe(404);
    });

    it('should return 500 on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = createRequest('http://localhost:3000/api/admin/campaigns/42/events');
      const response = await GET(request, createParams('42'));

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ===== Response Caching =====
  describe('Response caching', () => {
    it('should set Cache-Control header on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }),
      });

      const request = createRequest('http://localhost:3000/api/admin/campaigns/42/events');
      const response = await GET(request, createParams('42'));

      expect(response.headers.get('Cache-Control')).toBe('private, max-age=60');
    });
  });
});
