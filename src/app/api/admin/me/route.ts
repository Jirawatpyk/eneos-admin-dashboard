/**
 * User Info API Proxy Route
 * Fetches current user info (including role) from Backend API
 *
 * Single Source of Truth: Role comes from Backend (Google Sheets)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface BackendMeResponse {
  success: boolean;
  data?: {
    email: string;
    name: string;
    role: 'admin' | 'manager' | 'viewer';
  };
  error?: { code: string; message: string };
}

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
        { success: false, error: { code: 'NO_TOKEN', message: 'Google ID token not found' } },
        { status: 401 }
      );
    }

    // Forward request to Backend API
    const backendUrl = `${BACKEND_URL}/api/admin/me`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
    });

    const data: BackendMeResponse = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('User info API proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch user info',
        },
      },
      { status: 500 }
    );
  }
}
