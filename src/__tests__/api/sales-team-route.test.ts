/**
 * Sales Team API Route Tests
 * Story 4.5: Filter by Owner / Story 7-4b: Add New Member
 * Tests for /api/admin/sales-team route handler (GET + POST)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock getSessionOrUnauthorized
const mockGetSessionOrUnauthorized = vi.fn();
vi.mock('@/lib/supabase/auth-helpers', () => ({
  getSessionOrUnauthorized: () => mockGetSessionOrUnauthorized(),
}));

import { GET, POST } from '@/app/api/admin/sales-team/route';

const mockFetch = vi.fn();
global.fetch = mockFetch;
vi.spyOn(console, 'error').mockImplementation(() => {});

function mockSession(opts?: { role?: string; token?: string }) {
  mockGetSessionOrUnauthorized.mockResolvedValue({
    session: {
      access_token: opts?.token ?? 'test-supabase-token',
      user: { app_metadata: { role: opts?.role ?? 'admin' } },
    },
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

describe('/api/admin/sales-team', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://backend:3000';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  function createRequest(method: string = 'GET', body?: unknown): NextRequest {
    const url = new URL('/api/admin/sales-team', 'http://localhost:3001');
    const init: { method: string; body?: string; headers?: Record<string, string> } = { method };
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
        mockNoSession();

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('[P1] Successful requests', () => {
      it('should transform backend team data to flat array', async () => {
        mockSession();

        mockFetch.mockResolvedValue({
          ok: true, status: 200,
          json: () => Promise.resolve({
            success: true,
            data: {
              team: [
                { lineUserId: 'U001', name: 'Rep 1', email: 'rep1@co.th' },
                { lineUserId: 'U002', name: 'Rep 2', email: 'rep2@co.th' },
              ],
            },
          }),
        });

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toHaveLength(2);
        expect(data.data[0].name).toBe('Rep 1');
      });

      it('should forward request with Bearer token', async () => {
        mockSession({ token: 'my-token' });

        mockFetch.mockResolvedValue({
          ok: true, status: 200,
          json: () => Promise.resolve({ success: true, data: { team: [] } }),
        });

        await GET();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/sales-team'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer my-token',
            }),
          })
        );
      });
    });

    describe('[P1] Error handling', () => {
      it('should return 500 when fetch throws', async () => {
        mockSession();
        mockFetch.mockRejectedValue(new Error('Connection refused'));

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error.code).toBe('PROXY_ERROR');
      });
    });
  });

  // ===========================================
  // POST /api/admin/sales-team
  // ===========================================

  describe('POST', () => {
    const newMemberBody = { name: 'New Rep', email: 'new@company.com', phone: '0812345678' };

    describe('[P0] Authentication & Authorization', () => {
      it('should return 401 when not authenticated', async () => {
        mockNoSession();

        const response = await POST(createRequest('POST', newMemberBody));
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error.code).toBe('UNAUTHORIZED');
      });

      it('should return 403 when user is not admin', async () => {
        mockSession({ role: 'viewer' });

        const response = await POST(createRequest('POST', newMemberBody));
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error.code).toBe('FORBIDDEN');
        expect(data.error.message).toBe('Admin access required');
      });
    });

    describe('[P1] Successful creation', () => {
      it('should forward POST to backend with body', async () => {
        mockSession({ role: 'admin', token: 'admin-token' });

        mockFetch.mockResolvedValue({
          ok: true, status: 201,
          json: () => Promise.resolve({ success: true, data: { lineUserId: 'U-new', name: 'New Rep' } }),
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
              'Authorization': 'Bearer admin-token',
            }),
          })
        );
      });
    });

    describe('[P1] Error handling', () => {
      it('should return 500 when fetch throws', async () => {
        mockSession({ role: 'admin' });
        mockFetch.mockRejectedValue(new Error('Backend down'));

        const response = await POST(createRequest('POST', newMemberBody));
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error.code).toBe('PROXY_ERROR');
      });

      it('should forward backend validation errors', async () => {
        mockSession({ role: 'admin' });
        mockFetch.mockResolvedValue({
          ok: false, status: 400,
          json: () => Promise.resolve({ success: false, error: { code: 'VALIDATION', message: 'Email already exists' } }),
        });

        const response = await POST(createRequest('POST', newMemberBody));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error.message).toBe('Email already exists');
      });
    });
  });
});
