/**
 * Invite Team Member API Proxy Route (Story 13-1 AC-4)
 * POST /api/admin/sales-team/invite
 *
 * Proxies invite request to Backend API
 * Admin-only: creates sales_team record + sends Supabase Auth invite email
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionOrUnauthorized } from '@/lib/supabase/auth-helpers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    // Get Supabase session
    const { session, response: authResponse } = await getSessionOrUnauthorized();
    if (!session) return authResponse;

    // Admin-only access
    if (session.user.app_metadata?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    const backendUrl = `${BACKEND_URL}/api/admin/sales-team/invite`;

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
    console.error('Invite Team Member API proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to invite team member',
        },
      },
      { status: 500 }
    );
  }
}
