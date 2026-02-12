/**
 * User Info API Proxy Route
 * Fetches current user info (including role) from Backend API
 *
 * Single Source of Truth: Role comes from Backend (Supabase)
 */

import { NextResponse } from 'next/server';
import { getSessionOrUnauthorized } from '@/lib/supabase/auth-helpers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface BackendMeResponse {
  success: boolean;
  data?: {
    email: string;
    name: string;
    role: 'admin' | 'viewer';
  };
  error?: { code: string; message: string };
}

export async function GET() {
  try {
    // Get Supabase session
    const { session, response: authResponse } = await getSessionOrUnauthorized();
    if (!session) return authResponse;

    // Forward request to Backend API
    const backendUrl = `${BACKEND_URL}/api/admin/me`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
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
