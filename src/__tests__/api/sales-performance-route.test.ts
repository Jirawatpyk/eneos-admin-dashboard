/**
 * Sales Performance API Route Tests
 * Story 3.1: Sales Team Performance Table
 * Tests for /api/admin/sales-performance route handler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/sales-performance/route';

// Mock next-auth/jwt
const mockGetToken = vi.fn();
vi.mock('next-auth/jwt', () => ({
  getToken: (args: unknown) => mockGetToken(args),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console to suppress logs during tests
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('GET /api/admin/sales-performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXT_PUBLIC_API_URL = 'http://backend:3000';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  function createRequest(url: string = '/api/admin/sales-performance'): NextRequest {
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
    const mockBackendResponse = {
      success: true,
      data: {
        period: { start: '2026-01-01', end: '2026-01-31' },
        team: [
          {
            id: 'user-001',
            name: 'Sales Rep 1',
            stats: {
              claimed: 10,
              contacted: 8,
              closed: 5,
              lost: 2,
              unreachable: 1,
              conversionRate: 50,
              avgResponseTime: 120,
              avgClosingTime: 1440,
            },
          },
          {
            id: 'user-002',
            name: 'Sales Rep 2',
            stats: {
              claimed: 15,
              contacted: 12,
              closed: 8,
              lost: 3,
              unreachable: 1,
              conversionRate: 53.3,
              avgResponseTime: 90,
              avgClosingTime: 1200,
            },
          },
        ],
        totals: {
          claimed: 25,
          contacted: 20,
          closed: 13,
          lost: 5,
          unreachable: 2,
          conversionRate: 52,
          avgResponseTime: 105,
          avgClosingTime: 1320,
        },
        comparison: null,
      },
    };

    it('should forward request to backend with auth header', async () => {
      // GIVEN: Valid JWT with ID token
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockBackendResponse),
      });

      // WHEN: Request is made
      const response = await GET(createRequest());

      // THEN: Backend is called with auth header
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/sales-performance'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer google-id-token-abc',
          }),
        })
      );

      // AND: Response is successful
      expect(response.status).toBe(200);
    });

    it('should transform backend response to frontend format', async () => {
      // GIVEN: Valid auth and backend response
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockBackendResponse),
      });

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Response is transformed to frontend format
      expect(data.success).toBe(true);
      expect(data.data.teamPerformance).toHaveLength(2);
      expect(data.data.teamPerformance[0]).toMatchObject({
        userId: 'user-001',
        name: 'Sales Rep 1',
        email: '', // Not available from this endpoint
        claimed: 10,
        contacted: 8,
        closed: 5,
        lost: 2,
        unreachable: 1,
        conversionRate: 50,
        avgResponseTime: 120,
      });
    });

    it('should transform totals to summary format', async () => {
      // GIVEN: Valid auth and backend response
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockBackendResponse),
      });

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Totals are transformed to summary format
      expect(data.data.summary).toMatchObject({
        totalClaimed: 25,
        totalContacted: 20,
        totalClosed: 13,
        avgConversionRate: 52,
        avgResponseTime: 105,
      });
    });

    it('should forward query params to backend', async () => {
      // GIVEN: Valid auth
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockBackendResponse),
      });

      // WHEN: Request with query params
      await GET(createRequest('/api/admin/sales-performance?period=week&sortBy=closed'));

      // THEN: Backend URL includes query params
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('period=week'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=closed'),
        expect.any(Object)
      );
    });

    it('should handle empty team array', async () => {
      // GIVEN: Valid auth and empty team response
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      const emptyTeamResponse = {
        success: true,
        data: {
          period: { start: '2026-01-01', end: '2026-01-31' },
          team: [],
          totals: {
            claimed: 0,
            contacted: 0,
            closed: 0,
            lost: 0,
            unreachable: 0,
            conversionRate: 0,
            avgResponseTime: 0,
            avgClosingTime: 0,
          },
          comparison: null,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(emptyTeamResponse),
      });

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Returns empty arrays gracefully
      expect(data.success).toBe(true);
      expect(data.data.teamPerformance).toEqual([]);
      expect(data.data.summary.totalClaimed).toBe(0);
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
        error: { code: 'SHEETS_ERROR', message: 'Failed to read Google Sheets' },
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve(backendError),
      });

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Error is forwarded with same status
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SHEETS_ERROR');
    });

    it('should handle backend response without data', async () => {
      // GIVEN: Valid auth but backend returns success without data
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      const invalidResponse = {
        success: true,
        // data is missing
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(invalidResponse),
      });

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Response is passed through (success: true but no data)
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 500 when fetch throws', async () => {
      // GIVEN: Valid auth but fetch fails
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Returns 500 with error message
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('PROXY_ERROR');
      expect(data.error.message).toBe('ECONNREFUSED');
    });

    it('should handle non-Error exceptions', async () => {
      // GIVEN: Valid auth but fetch throws non-Error
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      mockFetch.mockRejectedValue(null);

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Returns 500 with generic message
      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Failed to fetch sales performance data');
    });
  });

  // ===========================================
  // [P2] Data Transformation Edge Cases
  // ===========================================

  describe('[P2] Data transformation', () => {
    it('should not include avgClosingTime in transformed teamPerformance', async () => {
      // GIVEN: Valid auth
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      const responseWithClosingTime = {
        success: true,
        data: {
          period: { start: '2026-01-01', end: '2026-01-31' },
          team: [{
            id: 'user-001',
            name: 'Rep',
            stats: {
              claimed: 1, contacted: 1, closed: 1, lost: 0, unreachable: 0,
              conversionRate: 100, avgResponseTime: 60, avgClosingTime: 1440,
            },
          }],
          totals: {
            claimed: 1, contacted: 1, closed: 1, lost: 0, unreachable: 0,
            conversionRate: 100, avgResponseTime: 60, avgClosingTime: 1440,
          },
          comparison: null,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(responseWithClosingTime),
      });

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: avgClosingTime is not in teamPerformance (intentional transformation)
      expect(data.data.teamPerformance[0]).not.toHaveProperty('avgClosingTime');
    });
  });
});
