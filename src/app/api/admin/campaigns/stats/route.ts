/**
 * Campaign Stats API Proxy Route
 * Story 5.3: Campaign Summary Cards
 *
 * Proxies requests to Backend API with Google ID token authentication
 * GET /api/admin/campaigns/stats -> Backend /api/admin/campaigns/stats
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
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '100';
    const sortBy = searchParams.get('sortBy') || 'Last_Updated';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build backend URL with all params (Story 5-4 sorting + Story 5-8 date filter)
    const backendParams = new URLSearchParams({
      page,
      limit,
      sortBy,
      sortOrder,
    });
    if (dateFrom) backendParams.set('dateFrom', dateFrom);
    if (dateTo) backendParams.set('dateTo', dateTo);

    const backendUrl = `${BACKEND_URL}/api/admin/campaigns/stats?${backendParams.toString()}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Add cache headers for performance (private = user-specific, max-age=60 = 1 minute)
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch (error) {
    console.error('[Campaign Stats API] Error:', error);
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
