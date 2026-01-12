/**
 * Session Role Tests
 * Story 1.5: Role-based Access Control
 * AC: #2 - Role Storage in Session
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next-auth/providers/google
vi.mock('next-auth/providers/google', () => ({
  default: vi.fn(() => ({
    id: 'google',
    name: 'Google',
    type: 'oauth',
  })),
}));

describe('Session Role Enhancement', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('GOOGLE_CLIENT_ID', 'test-client-id');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test-client-secret');
    vi.stubEnv('NEXTAUTH_SECRET', 'test-secret');
    vi.stubEnv('ALLOWED_DOMAINS', 'eneos.co.th');
  });

  describe('JWT Callback', () => {
    it('should add role to token on initial sign in', async () => {
      vi.stubEnv('ADMIN_EMAILS', 'admin@eneos.co.th');

      const { authOptions } = await import('../lib/auth');
      const jwtCallback = authOptions.callbacks?.jwt;

      expect(jwtCallback).toBeDefined();

      // Simulate initial sign in
      const result = await jwtCallback!({
        token: { sub: 'user-123' },
        account: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
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
    });

    it('should assign viewer role for non-admin users', async () => {
      vi.stubEnv('ADMIN_EMAILS', 'admin@eneos.co.th');

      const { authOptions } = await import('../lib/auth');
      const jwtCallback = authOptions.callbacks?.jwt;

      const result = await jwtCallback!({
        token: { sub: 'user-456' },
        account: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
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

    it('should preserve role in subsequent jwt calls', async () => {
      vi.stubEnv('ADMIN_EMAILS', 'admin@eneos.co.th');

      const { authOptions } = await import('../lib/auth');
      const jwtCallback = authOptions.callbacks?.jwt;

      // Token already has role from previous sign-in
      const existingToken = {
        sub: 'user-123',
        role: 'admin',
        expiresAt: Math.floor(Date.now() / 1000) + 86400,
      };

      // Subsequent call (no account)
      const result = await jwtCallback!({
        token: existingToken,
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
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };

      const token = {
        sub: 'user-123',
        id: 'user-123',
        role: 'admin',
        expiresAt: Math.floor(Date.now() / 1000) + 86400,
      };

      const result = await sessionCallback!({
        session,
        token,
        trigger: 'update',
        newSession: undefined,
      });

      expect(result.user.role).toBe('admin');
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
        trigger: 'update',
        newSession: undefined,
      });

      expect(result.user.role).toBe('viewer');
    });
  });
});
