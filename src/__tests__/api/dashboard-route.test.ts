/**
 * Dashboard API Route Tests
 * Tests for /api/admin/dashboard route handler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/dashboard/route';

// Mock next-auth/jwt
const mockGetToken = vi.fn();
vi.mock('next-auth/jwt', () => ({
  getToken: (args: unknown) => mockGetToken(args),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console to suppress logs during tests
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('GET /api/admin/dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXT_PUBLIC_API_URL = 'http://backend:3000';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  function createRequest(url: string = '/api/admin/dashboard'): NextRequest {
    return new NextRequest(new URL(url, 'http://localhost:3001'));
  }

  // ===========================================
  // [P0] Authentication Tests
  // ===========================================

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

  // ===========================================
  // [P1] Successful Requests
  // ===========================================

  describe('[P1] Successful requests', () => {
    it('should forward request to backend with auth header', async () => {
      // GIVEN: Valid JWT with ID token
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      const mockDashboardData = {
        success: true,
        data: {
          overview: { totalLeads: 100, conversion: 25 },
          trends: [],
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDashboardData),
      });

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Backend is called with auth header
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/dashboard'),
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
      expect(data.data.overview.totalLeads).toBe(100);
    });

    it('should use default period=month when not provided', async () => {
      // GIVEN: Valid auth
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      // WHEN: Request without period param
      await GET(createRequest('/api/admin/dashboard'));

      // THEN: Backend URL uses default period=month
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('period=month'),
        expect.any(Object)
      );
    });

    it('should forward custom period param to backend', async () => {
      // GIVEN: Valid auth
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      // WHEN: Request with custom period
      await GET(createRequest('/api/admin/dashboard?period=week'));

      // THEN: Backend URL includes custom period
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('period=week'),
        expect.any(Object)
      );
    });
  });

  // ===========================================
  // [P1] Error Handling
  // ===========================================

  describe('[P1] Error handling', () => {
    it('should forward backend error responses', async () => {
      // GIVEN: Valid auth but backend returns error
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      const backendError = {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve(backendError),
      });

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Error is forwarded with same status
      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
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
      expect(data.error.code).toBe('PROXY_ERROR');
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
      expect(data.error.message).toBe('Failed to fetch dashboard data');
    });
  });
});
