/**
 * Next.js Middleware
 * Story 1.5: Role-based Access Control
 *
 * AC#5: Protected routes (requires authentication)
 * AC#6: Unauthorized Access Handling - redirect viewers from admin routes
 */

import { withAuth } from 'next-auth/middleware';
import type { NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse, NextRequest, NextFetchEvent } from 'next/server';

// ===========================================
// E2E Test Bypass (Development Only)
// ===========================================

/**
 * Check if E2E test bypass is enabled
 * SECURITY: Only works when NEXT_PUBLIC_E2E_TEST_MODE=true AND NODE_ENV !== 'production'
 * Also supports header-based bypass for Playwright tests
 */
function isE2ETestBypass(req: NextRequest): boolean {
  // Method 1: Environment variable (for direct dev:e2e mode)
  const envBypass =
    process.env.NEXT_PUBLIC_E2E_TEST_MODE === 'true' &&
    process.env.NODE_ENV !== 'production';

  // Method 2: Request header (for Playwright tests)
  const headerBypass =
    req.headers.get('x-e2e-test-bypass') === 'true' &&
    process.env.NODE_ENV !== 'production';

  return envBypass || headerBypass;
}

// ===========================================
// Admin-Only Routes
// ===========================================

/**
 * Routes that require admin role
 * AC#6: Viewers trying to access these routes will be redirected
 */
export const ADMIN_ROUTES = ['/settings'];

/**
 * Check if a path is an admin-only route
 */
function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

// ===========================================
// Middleware Function
// ===========================================

/**
 * Auth middleware with role-based access control
 *
 * Flow:
 * 1. Check if E2E test bypass is enabled (dev only)
 * 2. Check if user is authenticated (handled by withAuth)
 * 3. For admin routes, check if user has admin role
 * 4. Redirect viewers to dashboard with error message
 */
const authMiddleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Check if accessing admin-only route
    if (isAdminRoute(pathname)) {
      const role = token?.role || 'viewer';

      // AC#6: Redirect viewers away from admin routes
      if (role !== 'admin') {
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        url.searchParams.set('error', 'Unauthorized');
        return NextResponse.redirect(url);
      }
    }

    // Allow access
    return NextResponse.next();
  },
  {
    callbacks: {
      // Only proceed to middleware if user is authenticated
      authorized: ({ token }) => !!token,
    },
  }
);

/**
 * Main middleware export
 * Uses E2E bypass in test mode, normal auth otherwise
 */
export function middleware(req: NextRequest, event: NextFetchEvent) {
  // E2E Test Bypass - ONLY in development with explicit flag or header
  if (isE2ETestBypass(req)) {
    return NextResponse.next();
  }

  // Normal authentication flow - cast req to NextRequestWithAuth
  // The withAuth wrapper will add the nextauth property
  return authMiddleware(req as NextRequestWithAuth, event);
}

// ===========================================
// Route Matcher
// ===========================================

export const config = {
  // Match all routes except:
  // - /login (auth page)
  // - /api/auth/* (NextAuth endpoints)
  // - /_next/static/* (static files)
  // - /_next/image/* (image optimization)
  // - /favicon.ico
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)'],
};
