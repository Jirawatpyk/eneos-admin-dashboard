/**
 * Unlinked LINE Accounts API Proxy Route (Story 7-4b Task 13.2)
 * AC#9, AC#10, AC#13: Get unlinked LINE accounts for linking
 *
 * Proxies GET request to Backend API
 */

import { NextResponse } from 'next/server';
import { getSessionOrUnauthorized } from '@/lib/supabase/auth-helpers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET() {
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

    const backendUrl = `${BACKEND_URL}/api/admin/sales-team/unlinked-line-accounts`;

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
    console.error('Unlinked LINE Accounts API proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch unlinked LINE accounts',
        },
      },
      { status: 500 }
    );
  }
}
