/**
 * Session Role Tests
 * Story 1.5: Role-based Access Control
 * AC: #2 - Role Storage in Session
 *
 * NOTE: Role is now fetched from Backend API (Single Source of Truth)
 * Tests mock the fetch call to simulate backend responses
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Role } from '@/config/roles';

// Mock next-auth/providers/google
vi.mock('next-auth/providers/google', () => ({
  default: vi.fn(() => ({
    id: 'google',
    name: 'Google',
    type: 'oauth',
  })),
}));

// Mock global fetch for backend API calls
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Session Role Enhancement', () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
    vi.stubEnv('GOOGLE_CLIENT_ID', 'test-client-id');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test-client-secret');
    vi.stubEnv('NEXTAUTH_SECRET', 'test-secret');
    vi.stubEnv('ALLOWED_DOMAINS', 'eneos.co.th');
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000');
  });

  describe('JWT Callback', () => {
    it('should add role to token on initial sign in (admin from backend)', async () => {
      // Mock backend API returning admin role
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { email: 'admin@eneos.co.th', name: 'Admin User', role: 'admin' },
        }),
      });

      const { authOptions } = await import('../lib/auth');
      const jwtCallback = authOptions.callbacks?.jwt;

      expect(jwtCallback).toBeDefined();

      // Simulate initial sign in
      const result = await jwtCallback!({
        token: { sub: 'user-123' },
        account: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          id_token: 'test-id-token',
          provider: 'google',
          type: 'oauth',
          providerAccountId: 'google-123',
        },
        user: {
          id: 'user-123',
          email: 'admin@eneos.co.th',
          name: 'Admin User',
        },
        trigger: 'signIn',
      });

      expect(result.role).toBe('admin');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/admin/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-id-token',
          }),
        })
      );
    });

    it('should assign manager role from backend', async () => {
      // Mock backend API returning manager role
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { email: 'manager@eneos.co.th', name: 'Manager User', role: 'manager' },
        }),
      });

      const { authOptions } = await import('../lib/auth');
      const jwtCallback = authOptions.callbacks?.jwt;

      const result = await jwtCallback!({
        token: { sub: 'user-manager' },
        account: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          id_token: 'test-id-token',
          provider: 'google',
          type: 'oauth',
          providerAccountId: 'google-manager',
        },
        user: {
          id: 'user-manager',
          email: 'manager@eneos.co.th',
          name: 'Manager User',
        },
        trigger: 'signIn',
      });

      expect(result.role).toBe('manager');
    });

    it('should assign viewer role for non-admin users', async () => {
      // Mock backend API returning viewer role
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { email: 'viewer@eneos.co.th', name: 'Viewer User', role: 'viewer' },
        }),
      });

      const { authOptions } = await import('../lib/auth');
      const jwtCallback = authOptions.callbacks?.jwt;

      const result = await jwtCallback!({
        token: { sub: 'user-456' },
        account: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          id_token: 'test-id-token',
          provider: 'google',
          type: 'oauth',
          providerAccountId: 'google-456',
        },
        user: {
          id: 'user-456',
          email: 'viewer@eneos.co.th',
          name: 'Viewer User',
        },
        trigger: 'signIn',
      });

      expect(result.role).toBe('viewer');
    });

    it('should default to viewer when backend API fails', async () => {
      // Mock backend API failing
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { authOptions } = await import('../lib/auth');
      const jwtCallback = authOptions.callbacks?.jwt;

      const result = await jwtCallback!({
        token: { sub: 'user-789' },
        account: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          id_token: 'test-id-token',
          provider: 'google',
          type: 'oauth',
          providerAccountId: 'google-789',
        },
        user: {
          id: 'user-789',
          email: 'user@eneos.co.th',
          name: 'User',
        },
        trigger: 'signIn',
      });

      expect(result.role).toBe('viewer');
    });

    it('should preserve role in subsequent jwt calls', async () => {
      vi.stubEnv('ADMIN_EMAILS', 'admin@eneos.co.th');

      const { authOptions } = await import('../lib/auth');
      const jwtCallback = authOptions.callbacks?.jwt;

      // Token already has role from previous sign-in
      const existingToken = {
        sub: 'user-123',
        role: 'admin' as Role,
        expiresAt: Math.floor(Date.now() / 1000) + 86400,
      };

      // Subsequent call (no account)
      const result = await jwtCallback!({
        token: existingToken,
        account: null,
        user: { id: 'user-123' } as Parameters<NonNullable<typeof jwtCallback>>[0]['user'],
        trigger: 'update',
      });

      expect(result.role).toBe('admin');
    });
  });

  describe('Session Callback', () => {
    it('should expose role to session', async () => {
      vi.stubEnv('ADMIN_EMAILS', 'admin@eneos.co.th');

      const { authOptions } = await import('../lib/auth');
      const sessionCallback = authOptions.callbacks?.session;

      expect(sessionCallback).toBeDefined();

      const session = {
        user: {
          id: '',
          name: 'Admin User',
          email: 'admin@eneos.co.th',
          image: 'https://example.com/avatar.jpg',
          role: 'viewer' as Role,
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };

      const token = {
        sub: 'user-123',
        id: 'user-123',
        role: 'admin' as Role,
        expiresAt: Math.floor(Date.now() / 1000) + 86400,
      };

      const result = await sessionCallback!({
        session,
        token,
        user: { id: 'user-123', email: 'admin@eneos.co.th', emailVerified: null },
        trigger: 'update',
        newSession: undefined,
      });

      expect((result.user as { role: Role }).role).toBe('admin');
    });

    it('should default to viewer if no role in token', async () => {
      const { authOptions } = await import('../lib/auth');
      const sessionCallback = authOptions.callbacks?.session;

      const session = {
        user: {
          id: '',
          name: 'User',
          email: 'user@eneos.co.th',
          image: null,
          role: 'viewer' as Role,
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };

      const token = {
        sub: 'user-123',
        id: 'user-123',
        // No role set
        expiresAt: Math.floor(Date.now() / 1000) + 86400,
      };

      const result = await sessionCallback!({
        session,
        token,
        user: { id: 'user-123', email: 'user@eneos.co.th', emailVerified: null },
        trigger: 'update',
        newSession: undefined,
      });

      expect((result.user as { role: Role }).role).toBe('viewer');
    });
  });
});
