/**
 * Sales Team List API Proxy Route (Story 7-4)
 * GET /api/admin/sales-team/list
 *
 * Proxies to Backend: GET /api/admin/sales-team/list?status=active&role=all
 * Admin only access
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionOrUnauthorized } from '@/lib/supabase/auth-helpers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    // Get Supabase session
    const { session, response: authResponse } = await getSessionOrUnauthorized();
    if (!session) return authResponse;

    // Check if user is admin (AC#10: Viewers cannot access team management)
    if (session.user.app_metadata?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    // Build backend URL with query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const role = searchParams.get('role') || 'all';

    const backendUrl = `${BACKEND_URL}/api/admin/sales-team/list?status=${status}&role=${role}`;

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
    console.error('Sales Team List API proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch team list',
        },
      },
      { status: 500 }
    );
  }
}
