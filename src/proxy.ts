/**
 * Next.js Proxy (formerly Middleware)
 * Story 11-4: Frontend Auth Middleware & Session Management (AC-1)
 *
 * AC#1: Route protection via Supabase session
 * - Unauthenticated → redirect to /login
 * - Authenticated at /login → redirect to /dashboard
 * - Public routes excluded: /login, /reset-password, /update-password, /auth/callback
 * - API routes excluded (handled separately)
 */

import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { ROLES } from '@/config/roles';

// ===========================================
// Public Routes (no auth required)
// ===========================================

const PUBLIC_ROUTES = ['/login', '/reset-password', '/update-password', '/auth/callback'];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

// ===========================================
// E2E Test Bypass (Development Only)
// ===========================================

function isE2ETestBypass(req: NextRequest): boolean {
  const envBypass =
    process.env.NEXT_PUBLIC_E2E_TEST_MODE === 'true' &&
    process.env.NODE_ENV !== 'production';

  const headerBypass =
    req.headers.get('x-e2e-test-bypass') === 'true' &&
    process.env.NODE_ENV !== 'production';

  return envBypass || headerBypass;
}

// ===========================================
// Admin-Only Routes
// ===========================================

export const ADMIN_ROUTES = ['/settings'];

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

// ===========================================
// Proxy Handler (Supabase Auth)
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function proxy(req: NextRequest, _event: NextFetchEvent) {
  // E2E Test Bypass - ONLY in development with explicit flag or header
  if (isE2ETestBypass(req)) {
    return NextResponse.next();
  }

  // Refresh Supabase session (updates cookies)
  const { user, supabaseResponse } = await updateSession(req);
  const pathname = req.nextUrl.pathname;

  // Unauthenticated user accessing protected route → redirect to /login
  if (!user && !isPublicRoute(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Authenticated user accessing /login → redirect to /dashboard
  if (user && pathname.startsWith('/login')) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Admin route protection: redirect non-admin users
  if (user && isAdminRoute(pathname)) {
    const role = user.app_metadata?.role || ROLES.VIEWER;
    if (role !== ROLES.ADMIN) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('error', 'Unauthorized');
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

// ===========================================
// Route Matcher
// ===========================================

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
