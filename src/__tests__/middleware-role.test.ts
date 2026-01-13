/**
 * Middleware Role Protection Tests
 * Story 1.5: Role-based Access Control
 * AC: #6 - Unauthorized Access Handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';
import type { NextRequestWithAuth } from 'next-auth/middleware';

// Mock next-auth/middleware
const mockWithAuth = vi.fn();
const mockGetToken = vi.fn();

vi.mock('next-auth/middleware', () => ({
  withAuth: (fn: (req: NextRequestWithAuth) => unknown, opts: unknown) => {
    mockWithAuth(fn, opts);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return async (req: NextRequest, event: NextFetchEvent) => {
      const token = await mockGetToken({ req });
      const reqWithAuth = Object.assign(req, { nextauth: { token } }) as NextRequestWithAuth;
      return fn(reqWithAuth);
    };
  },
}));

vi.mock('next-auth/jwt', () => ({
  getToken: () => mockGetToken(),
}));

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(() => ({ type: 'next' })),
      redirect: vi.fn((url: URL) => ({ type: 'redirect', url: url.toString() })),
    },
  };
});

// Create a mock NextFetchEvent
const mockEvent = {} as NextFetchEvent;

// Helper to create a request with proper type for testing
function createMockRequest(url: string): NextRequestWithAuth {
  const req = new NextRequest(url);
  return Object.assign(req, { nextauth: { token: null } }) as NextRequestWithAuth;
}

describe('Middleware Role Protection', () => {
  beforeEach(() => {
    vi.resetModules();
    mockWithAuth.mockClear();
    mockGetToken.mockClear();
    vi.mocked(NextResponse.next).mockClear();
    vi.mocked(NextResponse.redirect).mockClear();
  });

  describe('Admin-only routes', () => {
    it('should allow admin to access /settings', async () => {
      mockGetToken.mockResolvedValue({ role: 'admin' });

      const { proxy } = await import('../proxy');
      const req = createMockRequest('http://localhost:3000/settings');

      await proxy(req, mockEvent);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('should redirect viewer from /settings to /dashboard', async () => {
      mockGetToken.mockResolvedValue({ role: 'viewer' });

      const { proxy } = await import('../proxy');
      const req = createMockRequest('http://localhost:3000/settings');

      await proxy(req, mockEvent);

      expect(NextResponse.redirect).toHaveBeenCalled();
      const redirectCall = vi.mocked(NextResponse.redirect).mock.calls[0][0] as URL;
      expect(redirectCall.pathname).toBe('/dashboard');
      expect(redirectCall.searchParams.get('error')).toBe('Unauthorized');
    });

    it('should redirect user with no role (defaults to viewer) from /settings', async () => {
      mockGetToken.mockResolvedValue({ sub: 'user-123' }); // No role

      const { proxy } = await import('../proxy');
      const req = createMockRequest('http://localhost:3000/settings');

      await proxy(req, mockEvent);

      expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it('should protect nested settings routes like /settings/users', async () => {
      mockGetToken.mockResolvedValue({ role: 'viewer' });

      const { proxy } = await import('../proxy');
      const req = createMockRequest('http://localhost:3000/settings/users');

      await proxy(req, mockEvent);

      expect(NextResponse.redirect).toHaveBeenCalled();
    });
  });

  describe('Non-admin routes', () => {
    it('should allow viewer to access /dashboard', async () => {
      mockGetToken.mockResolvedValue({ role: 'viewer' });

      const { proxy } = await import('../proxy');
      const req = createMockRequest('http://localhost:3000/dashboard');

      await proxy(req, mockEvent);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('should allow viewer to access /leads', async () => {
      mockGetToken.mockResolvedValue({ role: 'viewer' });

      const { proxy } = await import('../proxy');
      const req = createMockRequest('http://localhost:3000/leads');

      await proxy(req, mockEvent);

      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should allow admin to access /dashboard', async () => {
      mockGetToken.mockResolvedValue({ role: 'admin' });

      const { proxy } = await import('../proxy');
      const req = createMockRequest('http://localhost:3000/dashboard');

      await proxy(req, mockEvent);

      expect(NextResponse.next).toHaveBeenCalled();
    });
  });

  describe('Admin routes definition', () => {
    it('should define /settings as admin-only route', async () => {
      const { ADMIN_ROUTES } = await import('../proxy');

      expect(ADMIN_ROUTES).toBeDefined();
      expect(ADMIN_ROUTES).toContain('/settings');
    });
  });
});
