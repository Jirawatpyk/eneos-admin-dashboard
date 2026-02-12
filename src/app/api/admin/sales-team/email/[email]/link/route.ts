/**
 * Link LINE Account API Proxy Route (Story 7-4b Task 13.3)
 * AC#11, AC#12, AC#15: Link LINE account to dashboard member
 *
 * Proxies PATCH request to Backend API
 * Uses email as identifier since dashboard members may not have lineUserId yet
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionOrUnauthorized } from '@/lib/supabase/auth-helpers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface RouteParams {
  params: Promise<{
    email: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    // Get email from dynamic route params
    const { email } = await params;

    // Parse request body
    const body = await request.json();

    const backendUrl = `${BACKEND_URL}/api/admin/sales-team/email/${encodeURIComponent(email)}/link`;

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
    console.error('Link LINE Account API proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to link LINE account',
        },
      },
      { status: 500 }
    );
  }
}
