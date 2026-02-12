/**
 * Lead Detail API Proxy Route
 * Story 4.1: Lead List Table
 *
 * Proxies requests to Backend API for single lead details
 * ID is the Supabase UUID
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

    // Get Supabase session
    const { session, response: authResponse } = await getSessionOrUnauthorized();
    if (!session) return authResponse;

    const backendUrl = `${BACKEND_URL}/api/admin/leads/${id}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Lead detail API proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch lead details',
        },
      },
      { status: 500 }
    );
  }
}
