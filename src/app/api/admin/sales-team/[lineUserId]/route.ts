/**
 * Sales Team Member API Proxy Route (Story 7-4)
 * GET /api/admin/sales-team/[lineUserId]
 * PATCH /api/admin/sales-team/[lineUserId]
 *
 * Admin only access
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionOrUnauthorized } from '@/lib/supabase/auth-helpers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface RouteParams {
  params: Promise<{ lineUserId: string }>;
}

/**
 * GET /api/admin/sales-team/[lineUserId]
 * Fetch single team member by LINE User ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { lineUserId } = await params;

    // Get Supabase session
    const { session, response: authResponse } = await getSessionOrUnauthorized();
    if (!session) return authResponse;

    // Check if user is admin
    if (session.user.app_metadata?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const backendUrl = `${BACKEND_URL}/api/admin/sales-team/${lineUserId}`;

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
    console.error('Sales Team Member GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'PROXY_ERROR', message: 'Failed to fetch team member' },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/sales-team/[lineUserId]
 * Update team member details
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { lineUserId } = await params;

    // Get Supabase session
    const { session, response: authResponse } = await getSessionOrUnauthorized();
    if (!session) return authResponse;

    // Check if user is admin
    if (session.user.app_metadata?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const backendUrl = `${BACKEND_URL}/api/admin/sales-team/${lineUserId}`;

    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Sales Team Member PATCH error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'PROXY_ERROR', message: 'Failed to update team member' },
      },
      { status: 500 }
    );
  }
}
