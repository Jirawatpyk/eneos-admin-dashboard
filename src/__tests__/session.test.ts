import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Account, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';

// Mock next-auth module
vi.mock('next-auth', () => ({
  default: vi.fn(),
}));

vi.mock('next-auth/providers/google', () => ({
  default: vi.fn(() => ({ id: 'google', name: 'Google' })),
}));

// Import after mocks
import { authOptions } from '@/lib/auth';

// Test helper types
type MockAccount = Partial<Account> & { access_token?: string; refresh_token?: string };
type MockUser = Partial<User> & { id: string };
type MockToken = Partial<JWT>;
type MockSession = Partial<Session> & { user: { id: string; name?: string; email?: string; image?: string | null }; expires: string };

describe('Session Management - Story 1.3', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC1: Session Duration
  describe('AC1: Session Duration', () => {
    it('should configure session maxAge to 24 hours', () => {
      expect(authOptions.session?.maxAge).toBe(24 * 60 * 60);
    });

    it('should use JWT strategy', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });
  });

  // AC1 & AC2: JWT Callback with expiry tracking
  describe('JWT Callback - Token Expiry Tracking', () => {
    const jwtCallback = authOptions.callbacks?.jwt;

    it('should exist', () => {
      expect(jwtCallback).toBeDefined();
    });

    it('should set expiresAt on initial sign in', async () => {
      const mockAccount: MockAccount = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
      };
      const mockUser: MockUser = { id: 'user-123', email: 'test@eneos.co.th' };
      const mockToken: MockToken = {};

      const result = await jwtCallback!({
        token: mockToken as JWT,
        account: mockAccount as Account,
        user: mockUser as User,
        trigger: 'signIn',
      });

      expect(result.expiresAt).toBeDefined();
      expect(typeof result.expiresAt).toBe('number');
      // Should be approximately 24 hours from now
      const expectedExpiry = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
      expect(result.expiresAt).toBeGreaterThan(expectedExpiry - 60);
      expect(result.expiresAt).toBeLessThan(expectedExpiry + 60);
    });

    it('should set issuedAt on initial sign in', async () => {
      const mockAccount: MockAccount = {
        access_token: 'test-access-token',
      };
      const mockUser: MockUser = { id: 'user-123', email: 'test@eneos.co.th' };
      const mockToken: MockToken = {};

      const result = await jwtCallback!({
        token: mockToken as JWT,
        account: mockAccount as Account,
        user: mockUser as User,
        trigger: 'signIn',
      });

      expect(result.issuedAt).toBeDefined();
      expect(typeof result.issuedAt).toBe('number');
      const now = Math.floor(Date.now() / 1000);
      expect(result.issuedAt).toBeGreaterThan(now - 60);
      expect(result.issuedAt).toBeLessThan(now + 60);
    });

    it('should preserve existing token on subsequent calls (no account)', async () => {
      const existingToken = {
        id: 'user-123',
        accessToken: 'existing-token',
        expiresAt: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours from now
        issuedAt: Math.floor(Date.now() / 1000) - 12 * 60 * 60, // 12 hours ago
      };

      const result = await jwtCallback!({
        token: existingToken as JWT,
        account: null,
        user: undefined as unknown as User,
        trigger: 'update',
      });

      expect(result.expiresAt).toBe(existingToken.expiresAt);
      expect(result.issuedAt).toBe(existingToken.issuedAt);
    });
  });

  // AC5: Session Data Access
  describe('Session Callback - Expose Expiry to Client', () => {
    const sessionCallback = authOptions.callbacks?.session;

    it('should exist', () => {
      expect(sessionCallback).toBeDefined();
    });

    it('should expose expiresAt to session', async () => {
      const mockToken: MockToken = {
        id: 'user-123',
        accessToken: 'test-token',
        expiresAt: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        issuedAt: Math.floor(Date.now() / 1000),
      };
      const mockSession: MockSession = {
        user: { id: '', name: 'Test User', email: 'test@eneos.co.th', image: null },
        expires: new Date().toISOString(),
      };

      const result = await sessionCallback!({
        session: mockSession as Session,
        token: mockToken as JWT,
        user: { id: 'user-123', email: 'test@eneos.co.th', emailVerified: null },
        trigger: 'update',
        newSession: undefined,
      });

      expect((result as { expiresAt?: number }).expiresAt).toBe(mockToken.expiresAt);
    });

    it('should NOT expose accessToken to session (AC7 security)', async () => {
      const mockToken: MockToken = {
        id: 'user-123',
        accessToken: 'test-access-token',
        expiresAt: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      };
      const mockSession: MockSession = {
        user: { id: '', name: 'Test User', email: 'test@eneos.co.th', image: null },
        expires: new Date().toISOString(),
      };

      const result = await sessionCallback!({
        session: mockSession as Session,
        token: mockToken as JWT,
        user: { id: 'user-123', email: 'test@eneos.co.th', emailVerified: null },
        trigger: 'update',
        newSession: undefined,
      });

      // accessToken should NOT be exposed to client for security
      expect((result as { accessToken?: string }).accessToken).toBeUndefined();
    });

    it('should expose user.id to session', async () => {
      const mockToken: MockToken = {
        id: 'user-123',
        sub: 'user-123',
        accessToken: 'test-token',
        expiresAt: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      };
      const mockSession: MockSession = {
        user: { id: '', name: 'Test User', email: 'test@eneos.co.th', image: null },
        expires: new Date().toISOString(),
      };

      const result = await sessionCallback!({
        session: mockSession as Session,
        token: mockToken as JWT,
        user: { id: 'user-123', email: 'test@eneos.co.th', emailVerified: null },
        trigger: 'update',
        newSession: undefined,
      });

      expect((result.user as { id: string }).id).toBe('user-123');
    });
  });

  // AC2: Session Refresh Window
  describe('AC2: Session Refresh Logic', () => {
    const jwtCallback = authOptions.callbacks?.jwt;

    it('should refresh token when in refresh window (last 6 hours)', async () => {
      const now = Math.floor(Date.now() / 1000);
      const originalExpiresAt = now + 5 * 60 * 60; // 5 hours from now
      const originalIssuedAt = now - 19 * 60 * 60; // 19 hours ago

      // Token that expires in 5 hours (within refresh window)
      const existingToken = {
        id: 'user-123',
        accessToken: 'old-token',
        expiresAt: originalExpiresAt,
        issuedAt: originalIssuedAt,
        lastRefreshedAt: originalIssuedAt,
      };

      const result = await jwtCallback!({
        token: existingToken as JWT,
        account: null,
        user: undefined as unknown as User,
        trigger: 'update',
      });

      // Should have new expiresAt (refreshed) - compare against original value
      expect(result.expiresAt).toBeGreaterThan(originalExpiresAt);
      // issuedAt should be preserved (original login time)
      expect(result.issuedAt).toBe(originalIssuedAt);
      // lastRefreshedAt should be updated
      expect(result.lastRefreshedAt).toBeGreaterThan(originalIssuedAt);
    });

    it('should NOT refresh token when not in refresh window', async () => {
      const now = Math.floor(Date.now() / 1000);
      const originalExpiresAt = now + 20 * 60 * 60; // 20 hours from now
      const originalIssuedAt = now - 4 * 60 * 60; // 4 hours ago

      // Token that expires in 20 hours (not in refresh window)
      const existingToken = {
        id: 'user-123',
        accessToken: 'old-token',
        expiresAt: originalExpiresAt,
        issuedAt: originalIssuedAt,
        lastRefreshedAt: originalIssuedAt,
      };

      const result = await jwtCallback!({
        token: existingToken as JWT,
        account: null,
        user: undefined as unknown as User,
        trigger: 'update',
      });

      // Should keep same expiresAt
      expect(result.expiresAt).toBe(originalExpiresAt);
      // issuedAt should be preserved
      expect(result.issuedAt).toBe(originalIssuedAt);
      // lastRefreshedAt should not change
      expect(result.lastRefreshedAt).toBe(originalIssuedAt);
    });

    it('should set lastRefreshedAt on initial sign in', async () => {
      const mockAccount: MockAccount = {
        access_token: 'test-access-token',
      };
      const mockUser: MockUser = { id: 'user-123', email: 'test@eneos.co.th' };
      const mockToken: MockToken = {};

      const result = await jwtCallback!({
        token: mockToken as JWT,
        account: mockAccount as Account,
        user: mockUser as User,
        trigger: 'signIn',
      });

      expect(result.lastRefreshedAt).toBeDefined();
      expect(typeof result.lastRefreshedAt).toBe('number');
      // On initial sign in, issuedAt and lastRefreshedAt should be equal
      expect(result.lastRefreshedAt).toBe(result.issuedAt);
    });
  });
});
