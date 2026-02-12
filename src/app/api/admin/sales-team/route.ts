/**
 * Sales Team API Proxy Route
 * Story 4.5: Filter by Owner
 * Story 7-4b: Add New Member (POST endpoint)
 *
 * Proxies requests to Backend API for sales team data
 * Used by LeadOwnerFilter dropdown and Add Member Modal
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionOrUnauthorized } from '@/lib/supabase/auth-helpers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET() {
  try {
    // Get Supabase session
    const { session, response: authResponse } = await getSessionOrUnauthorized();
    if (!session) return authResponse;

    const backendUrl = `${BACKEND_URL}/api/admin/sales-team`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const data = await response.json();

    // Transform response to match frontend expected format
    // Backend returns: { success, data: { team: [...] } }
    // Frontend expects: { success, data: [...] }
    if (data.success && data.data?.team) {
      return NextResponse.json(
        {
          success: true,
          data: data.data.team,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Sales Team API proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch sales team data',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/sales-team
 * Create a new sales team member (Story 7-4b)
 */
export async function POST(request: NextRequest) {
  try {
    // Get Supabase session
    const { session, response: authResponse } = await getSessionOrUnauthorized();
    if (!session) return authResponse;

    // Check if user is admin (AC#16: Admin-only access)
    if (session.user.app_metadata?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    const backendUrl = `${BACKEND_URL}/api/admin/sales-team`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Create Sales Team Member API proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create sales team member',
        },
      },
      { status: 500 }
    );
  }
}
