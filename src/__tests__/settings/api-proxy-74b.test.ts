/**
 * API Route Proxy Tests (Story 7-4b Task 15.5)
 * Tests Next.js API route proxy handlers for team management
 *
 * Routes tested:
 * - POST /api/admin/sales-team (createSalesTeamMember)
 * - GET /api/admin/sales-team/unlinked-line-accounts
 * - PATCH /api/admin/sales-team/email/[email]/link
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
import { POST } from '@/app/api/admin/sales-team/route';
import { GET as getUnlinkedLINEAccounts } from '@/app/api/admin/sales-team/unlinked-line-accounts/route';
import { PATCH as linkLINEAccount } from '@/app/api/admin/sales-team/email/[email]/link/route';

// Helpers
function mockAdminSession(token = 'admin-supabase-token') {
  mockGetSessionOrUnauthorized.mockResolvedValue({
    session: {
      access_token: token,
      user: { email: 'admin@eneos.co.th', app_metadata: { role: 'admin' } },
    },
    response: null,
  });
}

function mockViewerSession() {
  mockGetSessionOrUnauthorized.mockResolvedValue({
    session: {
      access_token: 'viewer-token',
      user: { email: 'viewer@eneos.co.th', app_metadata: { role: 'viewer' } },
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

function createRequest(method: string, body?: Record<string, unknown>): NextRequest {
  const url = 'http://localhost:3001/api/admin/sales-team';
  const options: { method: string; body?: string; headers?: Record<string, string> } = { method };
  if (body) {
    options.body = JSON.stringify(body);
    options.headers = { 'Content-Type': 'application/json' };
  }
  return new NextRequest(url, options);
}

describe('API Route Proxies - Story 7-4b (Task 15.5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================
  // POST /api/admin/sales-team
  // =========================================
  describe('POST /api/admin/sales-team (create member)', () => {
    it('should forward request to backend correctly', async () => {
      mockAdminSession();
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ success: true, data: { name: 'Test' } }), { status: 201 })
      );

      const body = { name: 'Test User', email: 'test@eneos.co.th', role: 'sales' };
      const request = createRequest('POST', body);
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/sales-team'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer admin-supabase-token',
          }),
        })
      );
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockNoSession();

      const request = createRequest('POST', { name: 'Test' });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
      mockViewerSession();

      const request = createRequest('POST', { name: 'Test' });
      const response = await POST(request);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should return 500 on proxy error', async () => {
      mockAdminSession();
      mockFetch.mockRejectedValue(new Error('Network failure'));

      const request = createRequest('POST', { name: 'Test' });
      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error.code).toBe('PROXY_ERROR');
    });
  });

  // =========================================
  // GET /api/admin/sales-team/unlinked-line-accounts
  // =========================================
  describe('GET /api/admin/sales-team/unlinked-line-accounts', () => {
    it('should forward request to backend correctly', async () => {
      mockAdminSession();
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ success: true, data: [{ lineUserId: 'U123', name: 'Test' }], total: 1 }), { status: 200 })
      );

      const response = await getUnlinkedLINEAccounts();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/unlinked-line-accounts'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer admin-supabase-token',
          }),
        })
      );
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockNoSession();
      const response = await getUnlinkedLINEAccounts();
      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
      mockViewerSession();
      const response = await getUnlinkedLINEAccounts();
      expect(response.status).toBe(403);
    });
  });

  // =========================================
  // PATCH /api/admin/sales-team/email/:email/link
  // =========================================
  describe('PATCH /api/admin/sales-team/email/:email/link', () => {
    const routeParams = { params: Promise.resolve({ email: 'test@eneos.co.th' }) };

    it('should forward link request to backend correctly', async () => {
      mockAdminSession();
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ success: true, data: { lineUserId: 'Uabc', email: 'test@eneos.co.th' } }), { status: 200 })
      );

      const body = { targetLineUserId: 'Uabc123' };
      const request = createRequest('PATCH', body);
      const response = await linkLINEAccount(request, routeParams);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/email/test%40eneos.co.th/link'),
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            Authorization: 'Bearer admin-supabase-token',
          }),
        })
      );
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockNoSession();

      const request = createRequest('PATCH', { targetLineUserId: 'U123' });
      const response = await linkLINEAccount(request, routeParams);

      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
      mockViewerSession();

      const request = createRequest('PATCH', { targetLineUserId: 'U123' });
      const response = await linkLINEAccount(request, routeParams);

      expect(response.status).toBe(403);
    });

    it('should return proper error response on failure', async () => {
      mockAdminSession();
      mockFetch.mockRejectedValue(new Error('Connection refused'));

      const request = createRequest('PATCH', { targetLineUserId: 'U123' });
      const response = await linkLINEAccount(request, routeParams);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error.code).toBe('PROXY_ERROR');
    });
  });
});
