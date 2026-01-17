/**
 * Sales Team API Proxy Route
 * Story 4.5: Filter by Owner
 *
 * Proxies requests to Backend API for sales team data
 * Used by LeadOwnerFilter dropdown
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

    const backendUrl = `${BACKEND_URL}/api/admin/sales-team`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
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
