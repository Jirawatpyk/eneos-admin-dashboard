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
import { NextRequest } from 'next/server';

// Mock next-auth/jwt
const mockGetToken = vi.fn();
vi.mock('next-auth/jwt', () => ({
  getToken: (...args: unknown[]) => mockGetToken(...args),
}));

// Mock global fetch for backend proxy
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocks
import { POST } from '@/app/api/admin/sales-team/route';
import { GET as getUnlinkedLINEAccounts } from '@/app/api/admin/sales-team/unlinked-line-accounts/route';
import { PATCH as linkLINEAccount } from '@/app/api/admin/sales-team/email/[email]/link/route';

// Helper to create NextRequest
function createRequest(method: string, body?: Record<string, unknown>): NextRequest {
  const url = 'http://localhost:3001/api/admin/sales-team';
  const options: { method: string; body?: string; headers?: Record<string, string> } = { method };
  if (body) {
    options.body = JSON.stringify(body);
    options.headers = { 'Content-Type': 'application/json' };
  }
  return new NextRequest(url, options);
}

// Helper for authenticated admin token
function mockAdminToken() {
  mockGetToken.mockResolvedValue({
    email: 'admin@eneos.co.th',
    role: 'admin',
    idToken: 'google-id-token-123',
  });
}

// Helper for authenticated viewer token
function mockViewerToken() {
  mockGetToken.mockResolvedValue({
    email: 'viewer@eneos.co.th',
    role: 'viewer',
    idToken: 'google-id-token-viewer',
  });
}

// Helper for no auth
function mockNoToken() {
  mockGetToken.mockResolvedValue(null);
}

// Helper for token without idToken
function mockTokenNoIdToken() {
  mockGetToken.mockResolvedValue({
    email: 'admin@eneos.co.th',
    role: 'admin',
    idToken: undefined,
  });
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
      mockAdminToken();
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
            Authorization: 'Bearer google-id-token-123',
          }),
        })
      );
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockNoToken();

      const request = createRequest('POST', { name: 'Test' });
      const response = await POST(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 for non-admin users', async () => {
      mockViewerToken();

      const request = createRequest('POST', { name: 'Test' });
      const response = await POST(request);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should return 401 when Google ID token missing', async () => {
      mockTokenNoIdToken();

      const request = createRequest('POST', { name: 'Test' });
      const response = await POST(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('NO_TOKEN');
    });

    it('should return 500 on proxy error', async () => {
      mockAdminToken();
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
      mockAdminToken();
      const backendData = { success: true, data: [{ lineUserId: 'U123', name: 'Test' }], total: 1 };
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(backendData), { status: 200 })
      );

      const request = createRequest('GET');
      const response = await getUnlinkedLINEAccounts(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/unlinked-line-accounts'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer google-id-token-123',
          }),
        })
      );
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockNoToken();

      const request = createRequest('GET');
      const response = await getUnlinkedLINEAccounts(request);

      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
      mockViewerToken();

      const request = createRequest('GET');
      const response = await getUnlinkedLINEAccounts(request);

      expect(response.status).toBe(403);
    });
  });

  // =========================================
  // PATCH /api/admin/sales-team/email/:email/link
  // =========================================
  describe('PATCH /api/admin/sales-team/email/:email/link', () => {
    const routeParams = { params: Promise.resolve({ email: 'test@eneos.co.th' }) };

    it('should forward link request to backend correctly', async () => {
      mockAdminToken();
      const backendData = { success: true, data: { lineUserId: 'Uabc', email: 'test@eneos.co.th' } };
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(backendData), { status: 200 })
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
            Authorization: 'Bearer google-id-token-123',
          }),
        })
      );
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockNoToken();

      const request = createRequest('PATCH', { targetLineUserId: 'U123' });
      const response = await linkLINEAccount(request, routeParams);

      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
      mockViewerToken();

      const request = createRequest('PATCH', { targetLineUserId: 'U123' });
      const response = await linkLINEAccount(request, routeParams);

      expect(response.status).toBe(403);
    });

    it('should pass Google ID token in Authorization header', async () => {
      mockAdminToken();
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      const request = createRequest('PATCH', { targetLineUserId: 'U123' });
      await linkLINEAccount(request, routeParams);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer google-id-token-123',
          }),
        })
      );
    });

    it('should return proper error response on failure', async () => {
      mockAdminToken();
      mockFetch.mockRejectedValue(new Error('Connection refused'));

      const request = createRequest('PATCH', { targetLineUserId: 'U123' });
      const response = await linkLINEAccount(request, routeParams);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error.code).toBe('PROXY_ERROR');
      expect(data.error.message).toBe('Connection refused');
    });
  });
});
