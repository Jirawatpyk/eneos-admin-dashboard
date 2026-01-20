/**
 * Activity Log API Proxy Route
 * Story 7.7: Activity Log Page
 *
 * Proxies requests to Backend API with Google ID token authentication
 * AC#2: Display activity log with pagination
 * AC#3: Filter by date range
 * AC#4: Filter by status
 * AC#5: Filter by changed by
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

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
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    // Get Google ID token from JWT
    const idToken = token.idToken as string;

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_TOKEN', message: 'Google ID token not found. Please sign out and sign in again.' } },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);

    // Build backend URL with query params
    const backendParams = new URLSearchParams();

    // Forward supported query parameters
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const status = searchParams.get('status');
    const changedBy = searchParams.get('changedBy');

    if (page) backendParams.set('page', page);
    if (limit) backendParams.set('limit', limit);
    if (from) backendParams.set('from', from);
    if (to) backendParams.set('to', to);
    if (status) backendParams.set('status', status);
    if (changedBy) backendParams.set('changedBy', changedBy);

    const backendUrl = `${BACKEND_URL}/api/admin/activity-log?${backendParams.toString()}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
    });

    const data = await response.json();

    // Pass through the response directly - no transformation needed
    // Backend format already matches frontend expectations
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Activity Log API proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch activity log data',
        },
      },
      { status: 500 }
    );
  }
}
