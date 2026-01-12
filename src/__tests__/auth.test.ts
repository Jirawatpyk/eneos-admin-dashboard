import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authOptions } from '@/lib/auth';

// Mock environment variables
vi.stubEnv('GOOGLE_CLIENT_ID', 'test-client-id');
vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test-client-secret');

describe('Auth Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Providers', () => {
    it('should have Google provider configured', () => {
      expect(authOptions.providers).toHaveLength(1);
      expect(authOptions.providers[0].id).toBe('google');
    });
  });

  describe('Session Configuration', () => {
    it('should use JWT strategy', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should have 24-hour session expiry', () => {
      expect(authOptions.session?.maxAge).toBe(24 * 60 * 60);
    });
  });

  describe('Pages Configuration', () => {
    it('should redirect to /login for sign in', () => {
      expect(authOptions.pages?.signIn).toBe('/login');
    });

    it('should redirect errors to /login', () => {
      expect(authOptions.pages?.error).toBe('/login');
    });
  });

  describe('signIn Callback - AC3: Domain Restriction', () => {
    const signInCallback = authOptions.callbacks?.signIn;

    it('should allow @eneos.co.th emails', async () => {
      if (!signInCallback) throw new Error('signIn callback not defined');

      const result = await signInCallback({
        user: { id: '1', email: 'user@eneos.co.th' },
        account: null,
        profile: undefined,
      });

      expect(result).toBe(true);
    });

    it('should reject non-ENEOS emails', async () => {
      if (!signInCallback) throw new Error('signIn callback not defined');

      const result = await signInCallback({
        user: { id: '1', email: 'user@gmail.com' },
        account: null,
        profile: undefined,
      });

      expect(result).toBe(false);
    });

    it('should reject emails without domain', async () => {
      if (!signInCallback) throw new Error('signIn callback not defined');

      const result = await signInCallback({
        user: { id: '1', email: undefined },
        account: null,
        profile: undefined,
      });

      expect(result).toBe(false);
    });

    it('should reject emails that contain but do not end with @eneos.co.th', async () => {
      if (!signInCallback) throw new Error('signIn callback not defined');

      const result = await signInCallback({
        user: { id: '1', email: 'user@eneos.co.th.fake.com' },
        account: null,
        profile: undefined,
      });

      expect(result).toBe(false);
    });
  });

  describe('jwt Callback - AC4: Token Persistence', () => {
    const jwtCallback = authOptions.callbacks?.jwt;

    it('should persist accessToken from account', async () => {
      if (!jwtCallback) throw new Error('jwt callback not defined');

      const result = await jwtCallback({
        token: {},
        account: { access_token: 'test-token', provider: 'google', type: 'oauth', providerAccountId: '123' },
        user: { id: 'user-123' },
      });

      expect(result.accessToken).toBe('test-token');
      expect(result.id).toBe('user-123');
    });

    it('should return existing token when no account', async () => {
      if (!jwtCallback) throw new Error('jwt callback not defined');

      const existingToken = { id: 'existing-id', accessToken: 'existing-token' };
      const result = await jwtCallback({
        token: existingToken,
        account: null,
        user: undefined as unknown as Parameters<typeof jwtCallback>[0]['user'],
      });

      expect(result.id).toBe('existing-id');
      expect(result.accessToken).toBe('existing-token');
    });
  });

  describe('session Callback - AC4: Session Data', () => {
    const sessionCallback = authOptions.callbacks?.session;

    it('should expose user id in session', async () => {
      if (!sessionCallback) throw new Error('session callback not defined');

      const result = await sessionCallback({
        session: {
          user: { id: '', name: 'Test User', email: 'test@eneos.co.th', image: null },
          expires: new Date().toISOString(),
        },
        token: { id: 'user-123', accessToken: 'test-token' },
      });

      expect(result.user.id).toBe('user-123');
    });

    it('should NOT expose accessToken to client session (AC7 security)', async () => {
      if (!sessionCallback) throw new Error('session callback not defined');

      const result = await sessionCallback({
        session: {
          user: { id: '', name: 'Test User', email: 'test@eneos.co.th', image: null },
          expires: new Date().toISOString(),
        },
        token: { id: 'user-123', accessToken: 'test-token' },
      });

      // accessToken should NOT be exposed to client for security
      expect(result.accessToken).toBeUndefined();
    });
  });

  // AC7: Session Storage Security Tests
  describe('AC7: Session Storage Security', () => {
    it('should use JWT strategy (stateless, cookie-based)', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should not override cookie settings (uses NextAuth httpOnly defaults)', () => {
      // NextAuth defaults: httpOnly=true, secure=true in production, sameSite=lax
      // We don't override these, so cookies config should be undefined
      expect(authOptions.cookies).toBeUndefined();
    });

    it('should use custom pages for signin and error', () => {
      expect(authOptions.pages?.signIn).toBe('/login');
      expect(authOptions.pages?.error).toBe('/login');
    });

    it('should have session maxAge configured for security', () => {
      // 24 hours is a reasonable session duration
      expect(authOptions.session?.maxAge).toBe(24 * 60 * 60);
    });
  });
});
