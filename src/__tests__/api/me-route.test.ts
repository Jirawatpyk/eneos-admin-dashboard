/**
 * User Info (Me) API Route Tests
 * Tests for /api/admin/me route handler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/me/route';

// Mock next-auth/jwt
const mockGetToken = vi.fn();
vi.mock('next-auth/jwt', () => ({
  getToken: (args: unknown) => mockGetToken(args),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console to suppress logs during tests
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('GET /api/admin/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXT_PUBLIC_API_URL = 'http://backend:3000';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  function createRequest(): NextRequest {
    return new NextRequest(new URL('/api/admin/me', 'http://localhost:3001'));
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

    it('should return 401 when idToken is literal string "undefined"', async () => {
      // GIVEN: JWT token with idToken as string "undefined" (invalid state)
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        email: 'test@example.com',
        idToken: 'undefined', // This can happen in edge cases
      });

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Returns 401 - detected as invalid token
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NO_TOKEN');
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

      const mockUserData = {
        success: true,
        data: {
          email: 'admin@eneos.co.th',
          name: 'Admin User',
          role: 'admin',
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUserData),
      });

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Backend is called with auth header
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/me'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer google-id-token-abc',
          }),
        })
      );

      // AND: Returns backend data with user info
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe('admin@eneos.co.th');
      expect(data.data.role).toBe('admin');
    });

    it('should return viewer role correctly', async () => {
      // GIVEN: Valid auth and viewer user
      mockGetToken.mockResolvedValue({
        sub: 'user-456',
        idToken: 'google-id-token-viewer',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          data: { email: 'viewer@company.com', name: 'Viewer', role: 'viewer' },
        }),
      });

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Returns viewer role
      expect(data.data.role).toBe('viewer');
    });

    it('should return manager role correctly', async () => {
      // GIVEN: Valid auth and manager user
      mockGetToken.mockResolvedValue({
        sub: 'user-789',
        idToken: 'google-id-token-manager',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          data: { email: 'manager@company.com', name: 'Manager', role: 'manager' },
        }),
      });

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Returns manager role
      expect(data.data.role).toBe('manager');
    });
  });

  // ===========================================
  // [P1] Error Handling
  // ===========================================

  describe('[P1] Error handling', () => {
    it('should forward backend 403 error', async () => {
      // GIVEN: Valid auth but backend returns forbidden
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      const backendError = {
        success: false,
        error: { code: 'FORBIDDEN', message: 'User not in whitelist' },
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve(backendError),
      });

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Error is forwarded
      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should forward backend 404 error (user not found)', async () => {
      // GIVEN: Valid auth but user not in Sales_Team sheet
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      const backendError = {
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve(backendError),
      });

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Error is forwarded
      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 when fetch throws', async () => {
      // GIVEN: Valid auth but fetch fails
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      mockFetch.mockRejectedValue(new Error('Connection refused'));

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Returns 500 with error message
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('PROXY_ERROR');
      expect(data.error.message).toBe('Connection refused');
    });

    it('should handle non-Error exceptions', async () => {
      // GIVEN: Valid auth but fetch throws non-Error
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        idToken: 'google-id-token-abc',
      });

      mockFetch.mockRejectedValue({ weird: 'object' });

      // WHEN: Request is made
      const response = await GET(createRequest());
      const data = await response.json();

      // THEN: Returns 500 with generic message
      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Failed to fetch user info');
    });
  });
});
