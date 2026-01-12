import { describe, it, expect } from 'vitest';
import { config } from '@/middleware';

describe('Auth Middleware - AC5: Protected Routes', () => {
  const matcher = config.matcher[0];

  // Convert Next.js matcher pattern to actual regex for testing
  // Next.js pattern: /((?!login|api/auth|_next/static|_next/image|favicon.ico).*)
  const createMatcherRegex = (pattern: string): RegExp => {
    // Remove leading slash and create regex
    const regexStr = pattern.slice(1);
    return new RegExp(`^${regexStr}$`);
  };

  const matcherRegex = createMatcherRegex(matcher);

  // Test using actual regex matching (more accurate than helper simulation)
  const matchesMiddleware = (path: string): boolean => {
    // Remove leading slash for matching
    const pathToTest = path.startsWith('/') ? path.slice(1) : path;
    return matcherRegex.test(pathToTest);
  };

  describe('Route Matching (using actual regex)', () => {
    it('should protect dashboard routes', () => {
      expect(matchesMiddleware('/dashboard')).toBe(true);
      expect(matchesMiddleware('/dashboard/leads')).toBe(true);
      expect(matchesMiddleware('/dashboard/analytics')).toBe(true);
    });

    it('should NOT protect login page', () => {
      expect(matchesMiddleware('/login')).toBe(false);
    });

    it('should NOT protect NextAuth API routes', () => {
      expect(matchesMiddleware('/api/auth/signin')).toBe(false);
      expect(matchesMiddleware('/api/auth/callback/google')).toBe(false);
      expect(matchesMiddleware('/api/auth/session')).toBe(false);
    });

    it('should NOT protect Next.js static assets', () => {
      expect(matchesMiddleware('/_next/static/chunks/main.js')).toBe(false);
      expect(matchesMiddleware('/_next/image')).toBe(false);
    });

    it('should NOT protect favicon', () => {
      expect(matchesMiddleware('/favicon.ico')).toBe(false);
    });

    it('should protect other API routes (non-auth)', () => {
      expect(matchesMiddleware('/api/leads')).toBe(true);
      expect(matchesMiddleware('/api/dashboard')).toBe(true);
    });

    it('should protect settings routes', () => {
      expect(matchesMiddleware('/settings')).toBe(true);
      expect(matchesMiddleware('/settings/profile')).toBe(true);
    });
  });

  describe('Matcher Configuration', () => {
    it('should have correct matcher pattern', () => {
      expect(matcher).toBe('/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)');
    });

    it('should be a valid regex pattern', () => {
      expect(() => createMatcherRegex(matcher)).not.toThrow();
    });

    it('should have exactly one matcher', () => {
      expect(config.matcher).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    it('should protect root path /', () => {
      // Root path should be protected and redirected
      expect(matchesMiddleware('/')).toBe(true);
    });

    it('should NOT protect paths starting with login (exact and nested)', () => {
      expect(matchesMiddleware('/login')).toBe(false);
      expect(matchesMiddleware('/login/error')).toBe(false);
    });

    it('should protect /logout (not in exclusion list)', () => {
      // Logout is not in the exclusion list, so it should be protected
      // This forces logout to go through auth, which is correct
      expect(matchesMiddleware('/logout')).toBe(true);
    });
  });
});
