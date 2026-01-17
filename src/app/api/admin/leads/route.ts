/**
 * Leads API Proxy Route
 * Story 4.1: Lead List Table
 *
 * Proxies requests to Backend API with Google ID token authentication
 * Follows pattern from dashboard API route
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
    const status = searchParams.get('status');
    const salesOwnerId = searchParams.get('salesOwnerId');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy');
    const sortDir = searchParams.get('sortDir');

    if (page) backendParams.set('page', page);
    if (limit) backendParams.set('limit', limit);
    if (status) backendParams.set('status', status);
    if (salesOwnerId) backendParams.set('salesOwnerId', salesOwnerId);
    if (search) backendParams.set('search', search);
    if (sortBy) backendParams.set('sortBy', sortBy);
    if (sortDir) backendParams.set('sortDir', sortDir);

    const backendUrl = `${BACKEND_URL}/api/admin/leads?${backendParams.toString()}`;

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
    console.error('Leads API proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch leads data',
        },
      },
      { status: 500 }
    );
  }
}
