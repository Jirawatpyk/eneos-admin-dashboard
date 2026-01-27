/**
 * Sales Team API Proxy Route
 * Story 4.5: Filter by Owner
 * Story 7-4b: Add New Member (POST endpoint)
 *
 * Proxies requests to Backend API for sales team data
 * Used by LeadOwnerFilter dropdown and Add Member Modal
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

/**
 * POST /api/admin/sales-team
 * Create a new sales team member (Story 7-4b)
 */
export async function POST(request: NextRequest) {
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

    // Check if user is admin (AC#16: Admin-only access)
    if (token.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
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

    // Parse request body
    const body = await request.json();

    const backendUrl = `${BACKEND_URL}/api/admin/sales-team`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Create Sales Team Member API proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create sales team member',
        },
      },
      { status: 500 }
    );
  }
}
