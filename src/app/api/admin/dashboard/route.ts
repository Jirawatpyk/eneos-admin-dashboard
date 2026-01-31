/**
 * Dashboard API Proxy Route
 * Proxies requests to Backend API with Google ID token authentication
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

    console.log('[Dashboard API] Token exists:', !!token);
    console.log('[Dashboard API] Token keys:', token ? Object.keys(token) : 'no token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    // Get Google ID token from JWT
    const idToken = token.idToken as string;

    console.log('[Dashboard API] idToken exists:', !!idToken);

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_TOKEN', message: 'Google ID token not found. Please sign out and sign in again.' } },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Forward request to Backend API
    let backendUrl = `${BACKEND_URL}/api/admin/dashboard?period=${period}`;
    if (startDate) backendUrl += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) backendUrl += `&endDate=${encodeURIComponent(endDate)}`;

    console.log('[Dashboard API] Calling backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
    });

    console.log('[Dashboard API] Backend response status:', response.status);

    const data = await response.json();

    console.log('[Dashboard API] Backend response success:', data.success);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Dashboard API proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
        },
      },
      { status: 500 }
    );
  }
}
