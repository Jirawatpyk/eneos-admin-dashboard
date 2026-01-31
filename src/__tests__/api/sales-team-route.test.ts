/**
 * Sales Team API Route Tests
 * Story 4.5: Filter by Owner / Story 7-4b: Add New Member
 * Tests for /api/admin/sales-team route handler (GET + POST)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/admin/sales-team/route';

// Mock next-auth/jwt
const mockGetToken = vi.fn();
vi.mock('next-auth/jwt', () => ({
  getToken: (args: unknown) => mockGetToken(args),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('/api/admin/sales-team', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXT_PUBLIC_API_URL = 'http://backend:3000';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  function createRequest(method: string = 'GET', body?: unknown): NextRequest {
    const url = new URL('/api/admin/sales-team', 'http://localhost:3001');
    const init: RequestInit = { method };
    if (body) {
      init.body = JSON.stringify(body);
      init.headers = { 'Content-Type': 'application/json' };
    }
    return new NextRequest(url, init);
  }

  // ===========================================
  // GET /api/admin/sales-team
  // ===========================================

  describe('GET', () => {
    describe('[P0] Authentication', () => {
      it('should return 401 when not authenticated', async () => {
        mockGetToken.mockResolvedValue(null);

        const response = await GET(createRequest());
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error.code).toBe('UNAUTHORIZED');
      });

      it('should return 401 when Google ID token is missing', async () => {
        mockGetToken.mockResolvedValue({ sub: 'user-123' });

        const response = await GET(createRequest());
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error.code).toBe('NO_TOKEN');
      });
    });

    describe('[P1] Successful requests', () => {
      it('should transform backend team data to flat array', async () => {
        mockGetToken.mockResolvedValue({
          sub: 'user-123',
          idToken: 'google-id-token-abc',
        });

        const backendResponse = {
          success: true,
          data: {
            team: [
              { lineUserId: 'U001', name: 'Rep 1', email: 'rep1@co.th' },
              { lineUserId: 'U002', name: 'Rep 2', email: 'rep2@co.th' },
            ],
          },
        };

        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: () => Promise.resolve(backendResponse),
        });

        const response = await GET(createRequest());
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toHaveLength(2);
        expect(data.data[0].name).toBe('Rep 1');
      });

      it('should pass through non-team responses', async () => {
        mockGetToken.mockResolvedValue({
          sub: 'user-123',
          idToken: 'google-id-token-abc',
        });

        const backendResponse = {
          success: false,
          error: { code: 'NOT_FOUND', message: 'No team found' },
        };

        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          json: () => Promise.resolve(backendResponse),
        });

        const response = await GET(createRequest());
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
      });

      it('should forward request with Bearer token', async () => {
        mockGetToken.mockResolvedValue({
          sub: 'user-123',
          idToken: 'my-google-token',
        });

        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: { team: [] } }),
        });

        await GET(createRequest());

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/sales-team'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer my-google-token',
            }),
          })
        );
      });
    });

    describe('[P1] Error handling', () => {
      it('should return 500 when fetch throws', async () => {
        mockGetToken.mockResolvedValue({
          sub: 'user-123',
          idToken: 'google-id-token-abc',
        });

        mockFetch.mockRejectedValue(new Error('Connection refused'));

        const response = await GET(createRequest());
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error.code).toBe('PROXY_ERROR');
        expect(data.error.message).toBe('Connection refused');
      });

      it('should handle non-Error exceptions', async () => {
        mockGetToken.mockResolvedValue({
          sub: 'user-123',
          idToken: 'google-id-token-abc',
        });

        mockFetch.mockRejectedValue('crash');

        const response = await GET(createRequest());
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error.message).toBe('Failed to fetch sales team data');
      });
    });
  });

  // ===========================================
  // POST /api/admin/sales-team
  // ===========================================

  describe('POST', () => {
    const newMemberBody = {
      name: 'New Rep',
      email: 'new@company.com',
      phone: '0812345678',
    };

    describe('[P0] Authentication & Authorization', () => {
      it('should return 401 when not authenticated', async () => {
        mockGetToken.mockResolvedValue(null);

        const response = await POST(createRequest('POST', newMemberBody));
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error.code).toBe('UNAUTHORIZED');
      });

      it('should return 403 when user is not admin', async () => {
        mockGetToken.mockResolvedValue({
          sub: 'user-123',
          role: 'viewer',
          idToken: 'google-id-token-abc',
        });

        const response = await POST(createRequest('POST', newMemberBody));
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error.code).toBe('FORBIDDEN');
        expect(data.error.message).toBe('Admin access required');
      });

      it('should return 401 when admin but no ID token', async () => {
        mockGetToken.mockResolvedValue({
          sub: 'user-123',
          role: 'admin',
          // idToken missing
        });

        const response = await POST(createRequest('POST', newMemberBody));
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error.code).toBe('NO_TOKEN');
      });
    });

    describe('[P1] Successful creation', () => {
      it('should forward POST to backend with body', async () => {
        mockGetToken.mockResolvedValue({
          sub: 'admin-1',
          role: 'admin',
          idToken: 'admin-google-token',
        });

        mockFetch.mockResolvedValue({
          ok: true,
          status: 201,
          json: () =>
            Promise.resolve({
              success: true,
              data: { lineUserId: 'U-new', name: 'New Rep' },
            }),
        });

        const response = await POST(createRequest('POST', newMemberBody));
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/sales-team'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(newMemberBody),
            headers: expect.objectContaining({
              'Authorization': 'Bearer admin-google-token',
            }),
          })
        );
      });
    });

    describe('[P1] Error handling', () => {
      it('should return 500 when fetch throws', async () => {
        mockGetToken.mockResolvedValue({
          sub: 'admin-1',
          role: 'admin',
          idToken: 'admin-google-token',
        });

        mockFetch.mockRejectedValue(new Error('Backend down'));

        const response = await POST(createRequest('POST', newMemberBody));
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error.code).toBe('PROXY_ERROR');
        expect(data.error.message).toBe('Backend down');
      });

      it('should forward backend validation errors', async () => {
        mockGetToken.mockResolvedValue({
          sub: 'admin-1',
          role: 'admin',
          idToken: 'admin-google-token',
        });

        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          json: () =>
            Promise.resolve({
              success: false,
              error: { code: 'VALIDATION', message: 'Email already exists' },
            }),
        });

        const response = await POST(createRequest('POST', newMemberBody));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error.message).toBe('Email already exists');
      });
    });
  });
});
