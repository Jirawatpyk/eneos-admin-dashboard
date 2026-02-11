/**
 * Middleware Role Protection Tests
 * Story 1.5 / Story 11-4: Migrated to Supabase Auth
 * AC: #6 - Unauthorized Access Handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';

// Mock updateSession from Supabase middleware
const mockUpdateSession = vi.fn();
vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: (...args: unknown[]) => mockUpdateSession(...args),
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

// Mock supabaseResponse returned by updateSession
const mockSupabaseResponse = { type: 'next', headers: new Headers() };

import { proxy, ADMIN_ROUTES } from '../proxy';

describe('Middleware Role Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateSession.mockResolvedValue({
      user: null,
      supabaseResponse: mockSupabaseResponse,
    });
  });

  describe('Admin-only routes', () => {
    it('should allow admin to access /settings', async () => {
      mockUpdateSession.mockResolvedValue({
        user: { id: 'u1', app_metadata: { role: 'admin' } },
        supabaseResponse: mockSupabaseResponse,
      });

      const req = new NextRequest('http://localhost:3000/settings');
      await proxy(req, mockEvent);

      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('should redirect viewer from /settings to /dashboard', async () => {
      mockUpdateSession.mockResolvedValue({
        user: { id: 'u2', app_metadata: { role: 'viewer' } },
        supabaseResponse: mockSupabaseResponse,
      });

      const req = new NextRequest('http://localhost:3000/settings');
      await proxy(req, mockEvent);

      expect(NextResponse.redirect).toHaveBeenCalled();
      const redirectCall = vi.mocked(NextResponse.redirect).mock.calls[0][0] as URL;
      expect(redirectCall.pathname).toBe('/dashboard');
      expect(redirectCall.searchParams.get('error')).toBe('Unauthorized');
    });

    it('should redirect user with no role (defaults to viewer) from /settings', async () => {
      mockUpdateSession.mockResolvedValue({
        user: { id: 'u3', app_metadata: {} },
        supabaseResponse: mockSupabaseResponse,
      });

      const req = new NextRequest('http://localhost:3000/settings');
      await proxy(req, mockEvent);

      expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it('should protect nested settings routes like /settings/users', async () => {
      mockUpdateSession.mockResolvedValue({
        user: { id: 'u4', app_metadata: { role: 'viewer' } },
        supabaseResponse: mockSupabaseResponse,
      });

      const req = new NextRequest('http://localhost:3000/settings/users');
      await proxy(req, mockEvent);

      expect(NextResponse.redirect).toHaveBeenCalled();
    });
  });

  describe('Non-admin routes', () => {
    it('should allow viewer to access /dashboard', async () => {
      mockUpdateSession.mockResolvedValue({
        user: { id: 'u5', app_metadata: { role: 'viewer' } },
        supabaseResponse: mockSupabaseResponse,
      });

      const req = new NextRequest('http://localhost:3000/dashboard');
      await proxy(req, mockEvent);

      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('should allow viewer to access /leads', async () => {
      mockUpdateSession.mockResolvedValue({
        user: { id: 'u6', app_metadata: { role: 'viewer' } },
        supabaseResponse: mockSupabaseResponse,
      });

      const req = new NextRequest('http://localhost:3000/leads');
      await proxy(req, mockEvent);

      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('should allow admin to access /dashboard', async () => {
      mockUpdateSession.mockResolvedValue({
        user: { id: 'u7', app_metadata: { role: 'admin' } },
        supabaseResponse: mockSupabaseResponse,
      });

      const req = new NextRequest('http://localhost:3000/dashboard');
      await proxy(req, mockEvent);

      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
  });

  describe('Admin routes definition', () => {
    it('should define /settings as admin-only route', () => {
      expect(ADMIN_ROUTES).toBeDefined();
      expect(ADMIN_ROUTES).toContain('/settings');
    });
  });
});
