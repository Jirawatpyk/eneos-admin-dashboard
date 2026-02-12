/**
 * Sales Performance Trend API Proxy Route
 * Story 3.5: Individual Performance Trend
 *
 * Proxies requests to Backend API for individual sales trend data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionOrUnauthorized } from '@/lib/supabase/auth-helpers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Backend response types
 * Note: These types must match the backend definitions in:
 * - eneos-sales-automation/src/types/admin.types.ts
 * - @/types/sales.ts (frontend shared types)
 */
interface DailyMetric {
  date: string;      // YYYY-MM-DD format
  claimed: number;   // Leads claimed on this date
  contacted: number; // Leads contacted on this date
  closed: number;    // Leads closed on this date
  conversionRate: number; // Percentage (0-100)
}

interface BackendTrendResponse {
  success: boolean;
  data?: {
    userId: string;
    name: string;
    period: number;
    dailyData: DailyMetric[];
    teamAverage: DailyMetric[];
  };
  error?: { code: string; message: string };
}

export async function GET(request: NextRequest) {
  try {
    // Get Supabase session
    const { session, response: authResponse } = await getSessionOrUnauthorized();
    if (!session) return authResponse;

    // Forward request to Backend API with query params
    const searchParams = request.nextUrl.searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/admin/sales-performance/trend${searchParams ? `?${searchParams}` : ''}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const backendData: BackendTrendResponse = await response.json();

    // If backend returned error, pass it through
    if (!backendData.success || !backendData.data) {
      return NextResponse.json(backendData, { status: response.status });
    }

    // Pass through the data as-is (no transformation needed)
    return NextResponse.json(backendData, { status: response.status });
  } catch (error) {
    console.error('Sales Performance Trend API proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch sales performance trend data',
        },
      },
      { status: 500 }
    );
  }
}
