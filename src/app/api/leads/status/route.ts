/**
 * Lead Status API Proxy - List All Processing Status
 * Story 0-16: Lead Processing Status Monitoring (Admin)
 * AC#1: API Proxy Routes
 *
 * Proxies GET /api/leads/status to backend status endpoint.
 * Returns list of all active lead processing status (admin only).
 *
 * Admin-only endpoint - requires authentication.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isAdmin, type Role } from '@/config/roles';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from NextAuth session
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check admin authentication (AC#1 requirement)
    const userRole = token.role as Role;
    if (!userRole || !isAdmin(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get Google ID token from JWT
    const idToken = token.idToken as string;

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'Google ID token not found. Please sign out and sign in again.' },
        { status: 401 }
      );
    }

    // AC#1: Handle network timeouts gracefully (5 second timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${BACKEND_URL}/api/leads/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        // Don't cache - status changes frequently (AC#1 requirement)
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          success: false,
          error: `Backend error: ${response.status} ${response.statusText}`,
        }));
        return NextResponse.json(errorData, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Handle timeout specifically
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Request timeout - backend took too long to respond' },
          { status: 504 }
        );
      }

      // Re-throw to be caught by outer catch block
      throw fetchError;
    }

  } catch (error) {
    // AC#1: Handle backend unreachable (503 Service Unavailable)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Backend unreachable',
      },
      { status: 503 }
    );
  }
}
