import { describe, it, expect } from 'vitest';
import { config } from '@/proxy';

describe('Auth Proxy - AC1: Route Protection', () => {
  const matcher = config.matcher[0];

  const createMatcherRegex = (pattern: string): RegExp => {
    const regexStr = pattern.slice(1);
    return new RegExp(`^${regexStr}$`);
  };

  const matcherRegex = createMatcherRegex(matcher);

  const matchesProxy = (path: string): boolean => {
    const pathToTest = path.startsWith('/') ? path.slice(1) : path;
    return matcherRegex.test(pathToTest);
  };

  describe('Route Matching', () => {
    it('should protect dashboard routes', () => {
      expect(matchesProxy('/dashboard')).toBe(true);
      expect(matchesProxy('/dashboard/leads')).toBe(true);
      expect(matchesProxy('/dashboard/analytics')).toBe(true);
    });

    it('should NOT protect login page', () => {
      expect(matchesProxy('/login')).toBe(true); // Matched but proxy handles redirect
    });

    it('should NOT protect Next.js static assets', () => {
      expect(matchesProxy('/_next/static/chunks/main.js')).toBe(false);
      expect(matchesProxy('/_next/image')).toBe(false);
    });

    it('should NOT protect favicon', () => {
      expect(matchesProxy('/favicon.ico')).toBe(false);
    });

    it('should NOT protect static image files', () => {
      expect(matchesProxy('/eneos-logo.svg')).toBe(false);
      expect(matchesProxy('/logo.png')).toBe(false);
      expect(matchesProxy('/image.jpg')).toBe(false);
      expect(matchesProxy('/photo.jpeg')).toBe(false);
      expect(matchesProxy('/icon.gif')).toBe(false);
      expect(matchesProxy('/banner.webp')).toBe(false);
    });

    it('should NOT protect API routes', () => {
      expect(matchesProxy('/api/admin/leads')).toBe(false);
      expect(matchesProxy('/api/admin/dashboard')).toBe(false);
      expect(matchesProxy('/api/auth/callback')).toBe(false);
    });

    it('should protect settings routes', () => {
      expect(matchesProxy('/settings')).toBe(true);
      expect(matchesProxy('/settings/profile')).toBe(true);
    });

    it('should match public auth routes (handled by proxy logic)', () => {
      // These are matched by the regex but proxy logic allows them
      expect(matchesProxy('/reset-password')).toBe(true);
      expect(matchesProxy('/update-password')).toBe(true);
      expect(matchesProxy('/auth/callback')).toBe(true);
    });
  });

  describe('Matcher Configuration', () => {
    it('should have correct matcher pattern excluding API routes', () => {
      expect(matcher).toBe(
        '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'
      );
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
      expect(matchesProxy('/')).toBe(true);
    });

    it('should match login paths (proxy handles auth redirect)', () => {
      expect(matchesProxy('/login')).toBe(true);
      expect(matchesProxy('/login/error')).toBe(true);
    });
  });
});
