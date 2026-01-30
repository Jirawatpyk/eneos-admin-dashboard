/**
 * Campaign Stats API Route Tests
 * Story 5.3: Campaign Summary Cards
 * Tests for /api/admin/campaigns/stats route handler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/campaigns/stats/route';

// Mock next-auth/jwt
const mockGetToken = vi.fn();
vi.mock('next-auth/jwt', () => ({
  getToken: (args: unknown) => mockGetToken(args),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GET /api/admin/campaigns/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_SECRET = 'test-secret';
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
      // GIVEN: No JWT token
      mockGetToken.mockResolvedValue(null);

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Returns 401 Unauthorized
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toBe('Not authenticated');
    });

    it('should return 401 when Google ID token is missing', async () => {
      // GIVEN: JWT token without idToken
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        email: 'test@example.com',
        // idToken is missing
      });

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Returns 401 with NO_TOKEN error
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NO_TOKEN');
      expect(data.error.message).toContain('Google ID token not found');
    });
  });

  describe('[P1] Successful requests', () => {
    it('should forward request to backend with auth header', async () => {
      // GIVEN: Valid JWT with ID token
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      const mockCampaignData = {
        success: true,
        data: {
          data: [{ campaignId: 1, campaignName: 'Test', delivered: 100 }],
          pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCampaignData),
      });

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Backend is called with auth header
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/campaigns/stats'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer google-id-token-abc',
          }),
        })
      );

      // AND: Returns backend data
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.data).toHaveLength(1);
    });

    it('should include Cache-Control header in response', async () => {
      // GIVEN: Valid auth and successful backend response
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }),
      });

      // WHEN: Request is made
      const response = await GET(createRequest());

      // THEN: Response has cache header
      expect(response.headers.get('Cache-Control')).toBe('private, max-age=60');
    });

    it('should forward pagination params to backend', async () => {
      // GIVEN: Valid auth
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }),
      });

      // WHEN: Request with pagination params
      await GET(createRequest('/api/admin/campaigns/stats?page=2&limit=50'));

      // THEN: Backend URL includes pagination
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=50'),
        expect.any(Object)
      );
    });

    it('should use default pagination when not provided', async () => {
      // GIVEN: Valid auth
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }),
      });

      // WHEN: Request without pagination params
      await GET(createRequest());

      // THEN: Backend URL uses defaults (page=1, limit=100)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=100'),
        expect.any(Object)
      );
    });
  });

  describe('[P1] Error handling', () => {
    it('should forward backend error responses', async () => {
      // GIVEN: Valid auth but backend returns error
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      const backendError = {
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Too many requests' },
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: () => Promise.resolve(backendError),
      });

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Error is forwarded
      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('RATE_LIMITED');
    });

    it('should return 500 when fetch throws', async () => {
      // GIVEN: Valid auth but fetch fails
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      mockFetch.mockRejectedValue(new Error('Network connection failed'));

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Returns 500 with error message
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('Network connection failed');
    });

    it('should handle non-Error exceptions', async () => {
      // GIVEN: Valid auth but fetch throws non-Error
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      mockFetch.mockRejectedValue('String error');

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Returns 500 with generic message
      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Internal server error');
    });
  });

  describe('[P2] Sorting parameters', () => {
    it('should forward sorting params to backend', async () => {
      // GIVEN: Valid auth
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }),
      });

      // WHEN: Request with sorting params
      await GET(createRequest('/api/admin/campaigns/stats?sortBy=Campaign_Name&sortOrder=asc'));

      // THEN: Backend URL includes sorting
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=Campaign_Name'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sortOrder=asc'),
        expect.any(Object)
      );
    });

    it('should use default sorting when not provided', async () => {
      // GIVEN: Valid auth
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { data: [], pagination: {} } }),
      });

      // WHEN: Request without sorting params
      await GET(createRequest());

      // THEN: Backend URL uses defaults (sortBy=Last_Updated, sortOrder=desc)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=Last_Updated'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sortOrder=desc'),
        expect.any(Object)
      );
    });
  });
});
