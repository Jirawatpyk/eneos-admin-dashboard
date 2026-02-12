/**
 * Campaign Events API Proxy Route
 * Story 5.7: Campaign Detail Sheet
 *
 * Proxies requests to Backend API with Supabase auth
 * GET /api/admin/campaigns/:id/events -> Backend /api/admin/campaigns/:id/events
 *
 * Query params: page, limit, event, dateFrom, dateTo
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionOrUnauthorized } from '@/lib/supabase/auth-helpers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate campaign ID is a numeric string
    if (!/^\d+$/.test(id)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ID', message: 'Invalid campaign ID' } },
        { status: 400 }
      );
    }

    // Get Supabase session
    const { session, response: authResponse } = await getSessionOrUnauthorized();
    if (!session) return authResponse;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const event = searchParams.get('event');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build backend query string
    const backendParams = new URLSearchParams({ page, limit });
    if (event) backendParams.set('event', event);
    if (dateFrom) backendParams.set('dateFrom', dateFrom);
    if (dateTo) backendParams.set('dateTo', dateTo);

    // Forward request to Backend API
    const backendUrl = `${BACKEND_URL}/api/admin/campaigns/${id}/events?${backendParams.toString()}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch (error) {
    console.error('[Campaign Events API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}
