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
import { NextResponse } from 'next/server';
import { getSessionOrUnauthorized } from '@/lib/supabase/auth-helpers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET() {
  try {
    // Get Supabase session
    const { session, response: authResponse } = await getSessionOrUnauthorized();
    if (!session) return authResponse;

    // Check admin authentication (AC#1 requirement)
    if (session.user.app_metadata?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
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
          'Authorization': `Bearer ${session.access_token}`,
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
          { success: false, error: { code: 'TIMEOUT', message: 'Request timeout - backend took too long to respond' } },
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
        error: {
          code: 'PROXY_ERROR',
          message: error instanceof Error ? error.message : 'Backend unreachable',
        },
      },
      { status: 503 }
    );
  }
}
