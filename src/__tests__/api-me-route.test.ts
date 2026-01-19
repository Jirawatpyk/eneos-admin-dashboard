/**
 * User Info API Route Tests
 * Tests for /api/admin/me proxy endpoint
 *
 * Verifies:
 * - Authentication checks
 * - Backend API forwarding
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Hoist mock functions for proper vitest mock hoisting
const { mockGetToken, mockFetch } = vi.hoisted(() => ({
  mockGetToken: vi.fn(),
  mockFetch: vi.fn(),
}));

// Mock next-auth/jwt with hoisted mock
vi.mock('next-auth/jwt', () => ({
  getToken: mockGetToken,
}));

// Mock global fetch
vi.stubGlobal('fetch', mockFetch);

// Import the route after mocks are set up
import { GET } from '../app/api/admin/me/route';

describe('/api/admin/me Route', () => {
  beforeEach(() => {
    mockGetToken.mockReset();
    mockFetch.mockReset();
    vi.stubEnv('NEXTAUTH_SECRET', 'test-secret');
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000');
  });

  it('should return 401 if no session token', async () => {
    mockGetToken.mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3001/api/admin/me');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 401 if no idToken in session', async () => {
    mockGetToken.mockResolvedValueOnce({ sub: 'user-123' }); // No idToken

    const request = new NextRequest('http://localhost:3001/api/admin/me');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NO_TOKEN');
  });

  it('should forward request to backend with Bearer token', async () => {
    mockGetToken.mockResolvedValueOnce({
      sub: 'user-123',
      idToken: 'test-google-id-token',
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { email: 'user@eneos.co.th', name: 'User', role: 'admin' },
      }),
    });

    const request = new NextRequest('http://localhost:3001/api/admin/me');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.role).toBe('admin');

    // Verify fetch was called with correct params
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/admin/me',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-google-id-token',
        }),
      })
    );
  });

  it('should return backend error response as-is', async () => {
    mockGetToken.mockResolvedValueOnce({
      sub: 'user-123',
      idToken: 'test-google-id-token',
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      }),
    });

    const request = new NextRequest('http://localhost:3001/api/admin/me');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('FORBIDDEN');
  });

  it('should return 500 on fetch error', async () => {
    mockGetToken.mockResolvedValueOnce({
      sub: 'user-123',
      idToken: 'test-google-id-token',
    });

    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const request = new NextRequest('http://localhost:3001/api/admin/me');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROXY_ERROR');
    expect(data.error.message).toBe('Network error');
  });

  it('should return user info with all roles (admin, manager, viewer)', async () => {
    const roles = ['admin', 'manager', 'viewer'] as const;

    for (const role of roles) {
      mockGetToken.mockReset();
      mockFetch.mockReset();

      mockGetToken.mockResolvedValueOnce({
        sub: 'user-123',
        idToken: 'test-token',
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { email: `${role}@eneos.co.th`, name: `${role} User`, role },
        }),
      });

      const request = new NextRequest('http://localhost:3001/api/admin/me');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.role).toBe(role);
    }
  });
});
