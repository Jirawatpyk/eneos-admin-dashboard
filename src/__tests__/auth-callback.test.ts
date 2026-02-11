/**
 * OAuth Callback Route Tests
 * Story 11-1: Frontend Login & Auth Pages (AC#3)
 *
 * Tests the /auth/callback route handler:
 * - Successful code exchange → redirect to dashboard
 * - Failed code exchange → redirect to /login?error=auth_error
 * - Missing code → redirect to /login?error=auth_error
 * - Custom next param → redirect to custom path
 * - Open redirect prevention via getSafeRedirectPath
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockExchangeCodeForSession } = vi.hoisted(() => ({
  mockExchangeCodeForSession: vi.fn(),
}));

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  }),
}));

import { GET, _testOnly } from '@/app/auth/callback/route';

describe('OAuth Callback Route (/auth/callback)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Code Exchange', () => {
    it('should redirect to /dashboard on successful code exchange', async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null });

      const request = new Request('http://localhost:3001/auth/callback?code=valid-auth-code');
      const response = await GET(request);

      expect(response.status).toBe(307);
      expect(new URL(response.headers.get('location')!).pathname).toBe('/dashboard');
      expect(mockExchangeCodeForSession).toHaveBeenCalledWith('valid-auth-code');
    });

    it('should redirect to /login?error=auth_error on failed code exchange', async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        error: { message: 'Invalid code' },
      });

      const request = new Request('http://localhost:3001/auth/callback?code=invalid-code');
      const response = await GET(request);

      const location = new URL(response.headers.get('location')!);
      expect(location.pathname).toBe('/login');
      expect(location.searchParams.get('error')).toBe('auth_error');
    });

    it('should redirect to /login?error=auth_error when code param is missing', async () => {
      const request = new Request('http://localhost:3001/auth/callback');
      const response = await GET(request);

      const location = new URL(response.headers.get('location')!);
      expect(location.pathname).toBe('/login');
      expect(location.searchParams.get('error')).toBe('auth_error');
      expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
    });
  });

  describe('Custom next param', () => {
    it('should redirect to custom next path on success', async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null });

      const request = new Request('http://localhost:3001/auth/callback?code=valid&next=/settings');
      const response = await GET(request);

      expect(new URL(response.headers.get('location')!).pathname).toBe('/settings');
    });

    it('should default to /dashboard when next is not provided', async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null });

      const request = new Request('http://localhost:3001/auth/callback?code=valid');
      const response = await GET(request);

      expect(new URL(response.headers.get('location')!).pathname).toBe('/dashboard');
    });
  });

  describe('getSafeRedirectPath (Open Redirect Prevention)', () => {
    const { getSafeRedirectPath } = _testOnly;

    it('should allow valid relative paths', () => {
      expect(getSafeRedirectPath('/dashboard')).toBe('/dashboard');
      expect(getSafeRedirectPath('/settings')).toBe('/settings');
      expect(getSafeRedirectPath('/leads/123')).toBe('/leads/123');
    });

    it('should reject protocol-relative URLs', () => {
      expect(getSafeRedirectPath('//evil.com')).toBe('/dashboard');
      expect(getSafeRedirectPath('//evil.com/path')).toBe('/dashboard');
    });

    it('should reject URLs with protocol', () => {
      expect(getSafeRedirectPath('https://evil.com')).toBe('/dashboard');
      expect(getSafeRedirectPath('http://evil.com')).toBe('/dashboard');
    });

    it('should reject URLs with @ (credential-based redirect)', () => {
      expect(getSafeRedirectPath('/@evil.com')).toBe('/dashboard');
      expect(getSafeRedirectPath('/foo@bar.com')).toBe('/dashboard');
    });

    it('should return /dashboard for null', () => {
      expect(getSafeRedirectPath(null)).toBe('/dashboard');
    });

    it('should reject paths not starting with /', () => {
      expect(getSafeRedirectPath('dashboard')).toBe('/dashboard');
      expect(getSafeRedirectPath('evil.com')).toBe('/dashboard');
    });
  });
});
