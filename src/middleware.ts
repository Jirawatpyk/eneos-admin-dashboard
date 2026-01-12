/**
 * Next.js Middleware
 * Story 1.5: Role-based Access Control
 *
 * AC#5: Protected routes (requires authentication)
 * AC#6: Unauthorized Access Handling - redirect viewers from admin routes
 */

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

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
 * 1. Check if user is authenticated (handled by withAuth)
 * 2. For admin routes, check if user has admin role
 * 3. Redirect viewers to dashboard with error message
 */
export const middleware = withAuth(
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
