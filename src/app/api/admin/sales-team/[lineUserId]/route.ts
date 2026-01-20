/**
 * Sales Team Member API Proxy Route (Story 7-4)
 * GET /api/admin/sales-team/[lineUserId]
 * PATCH /api/admin/sales-team/[lineUserId]
 *
 * Admin only access
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

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

    // Check if user is admin
    if (token.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const idToken = token.idToken as string;
    if (!idToken) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_TOKEN', message: 'Google ID token not found.' } },
        { status: 401 }
      );
    }

    const backendUrl = `${BACKEND_URL}/api/admin/sales-team/${lineUserId}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
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

    // Check if user is admin
    if (token.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const idToken = token.idToken as string;
    if (!idToken) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_TOKEN', message: 'Google ID token not found.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const backendUrl = `${BACKEND_URL}/api/admin/sales-team/${lineUserId}`;

    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
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
