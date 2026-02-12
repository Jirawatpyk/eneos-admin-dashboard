/**
 * User Info (Me) API Route Tests
 * Tests for /api/admin/me route handler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';

// Mock getSessionOrUnauthorized
const mockGetSessionOrUnauthorized = vi.fn();
vi.mock('@/lib/supabase/auth-helpers', () => ({
  getSessionOrUnauthorized: () => mockGetSessionOrUnauthorized(),
}));

import { GET } from '@/app/api/admin/me/route';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.spyOn(console, 'error').mockImplementation(() => {});

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

describe('GET /api/admin/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://backend:3000';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('[P0] Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockNoSession();

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('[P1] Successful requests', () => {
    it('should forward request to backend with auth header', async () => {
      mockSession('my-supabase-jwt');

      mockFetch.mockResolvedValue({
        ok: true, status: 200,
        json: () => Promise.resolve({
          success: true,
          data: { email: 'admin@eneos.co.th', name: 'Admin User', role: 'admin' },
        }),
      });

      const response = await GET();
      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/me'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer my-supabase-jwt',
          }),
        })
      );

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe('admin@eneos.co.th');
      expect(data.data.role).toBe('admin');
    });

    it('should return viewer role correctly', async () => {
      mockSession();

      mockFetch.mockResolvedValue({
        ok: true, status: 200,
        json: () => Promise.resolve({
          success: true,
          data: { email: 'viewer@company.com', name: 'Viewer', role: 'viewer' },
        }),
      });

      const response = await GET();
      const data = await response.json();

      expect(data.data.role).toBe('viewer');
    });
  });

  describe('[P1] Error handling', () => {
    it('should forward backend 403 error', async () => {
      mockSession();
      mockFetch.mockResolvedValue({
        ok: false, status: 403,
        json: () => Promise.resolve({ success: false, error: { code: 'FORBIDDEN', message: 'User not in whitelist' } }),
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should return 500 when fetch throws', async () => {
      mockSession();
      mockFetch.mockRejectedValue(new Error('Connection refused'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe('PROXY_ERROR');
      expect(data.error.message).toBe('Connection refused');
    });

    it('should handle non-Error exceptions', async () => {
      mockSession();
      mockFetch.mockRejectedValue({ weird: 'object' });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Failed to fetch user info');
    });
  });
});
