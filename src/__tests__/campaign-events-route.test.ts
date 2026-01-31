/**
 * Campaign Events API Route Tests
 * Story 5.7: Campaign Detail Sheet (Fix #8)
 *
 * Tests for GET /api/admin/campaigns/[id]/events
 * - Campaign ID validation
 * - Authentication (JWT token)
 * - Query parameter forwarding
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock next-auth/jwt
const mockGetToken = vi.fn();
vi.mock('next-auth/jwt', () => ({
  getToken: (...args: unknown[]) => mockGetToken(...args),
}));

// Mock global fetch for backend calls
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

describe('GET /api/admin/campaigns/[id]/events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: authenticated with valid token
    mockGetToken.mockResolvedValue({
      idToken: 'mock-google-id-token',
    });
  });

  // ===== Fix #1: Campaign ID Validation =====
  describe('Campaign ID validation', () => {
    it('should reject non-numeric campaign ID', async () => {
      const request = createRequest('http://localhost:3000/api/admin/campaigns/abc/events');
      const response = await GET(request, createParams('abc'));

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_ID');
    });

    it('should reject campaign ID with special characters', async () => {
      const request = createRequest('http://localhost:3000/api/admin/campaigns/1;DROP/events');
      const response = await GET(request, createParams('1;DROP'));

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('INVALID_ID');
    });

    it('should reject empty campaign ID', async () => {
      const request = createRequest('http://localhost:3000/api/admin/campaigns//events');
      const response = await GET(request, createParams(''));

      expect(response.status).toBe(400);
    });

    it('should accept valid numeric campaign ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }),
      });

      const request = createRequest('http://localhost:3000/api/admin/campaigns/42/events');
      const response = await GET(request, createParams('42'));

      expect(response.status).toBe(200);
    });
  });

  // ===== Authentication =====
  describe('Authentication', () => {
    it('should return 401 when no JWT token', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = createRequest('http://localhost:3000/api/admin/campaigns/42/events');
      const response = await GET(request, createParams('42'));

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 when no Google ID token in JWT', async () => {
      mockGetToken.mockResolvedValue({ idToken: undefined });

      const request = createRequest('http://localhost:3000/api/admin/campaigns/42/events');
      const response = await GET(request, createParams('42'));

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error.code).toBe('NO_TOKEN');
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

    it('should forward date range params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }),
      });

      const request = createRequest('http://localhost:3000/api/admin/campaigns/42/events?dateFrom=2026-01-01&dateTo=2026-01-31');
      await GET(request, createParams('42'));

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('dateFrom=2026-01-01');
      expect(calledUrl).toContain('dateTo=2026-01-31');
    });

    it('should use default page=1 and limit=20 when not provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }),
      });

      const request = createRequest('http://localhost:3000/api/admin/campaigns/42/events');
      await GET(request, createParams('42'));

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('limit=20');
    });

    it('should send Authorization header with Google ID token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }),
      });

      const request = createRequest('http://localhost:3000/api/admin/campaigns/42/events');
      await GET(request, createParams('42'));

      const calledHeaders = mockFetch.mock.calls[0][1].headers;
      expect(calledHeaders.Authorization).toBe('Bearer mock-google-id-token');
    });
  });

  // ===== Backend Error Forwarding =====
  describe('Backend error forwarding', () => {
    it('should forward backend error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Campaign not found' },
        }),
      });

      const request = createRequest('http://localhost:3000/api/admin/campaigns/999/events');
      const response = await GET(request, createParams('999'));

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = createRequest('http://localhost:3000/api/admin/campaigns/42/events');
      const response = await GET(request, createParams('42'));

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error.code).toBe('INTERNAL_ERROR');
      expect(body.error.message).toBe('Network error');
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
