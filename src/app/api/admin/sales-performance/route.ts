/**
 * Sales Performance API Proxy Route
 * Story 3.1: Sales Team Performance Table
 *
 * Proxies requests to Backend API with Supabase auth
 * Transforms backend response to match frontend expected format
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionOrUnauthorized } from '@/lib/supabase/auth-helpers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Backend response types
interface BackendTeamMember {
  id: string;
  name: string;
  stats: {
    claimed: number;
    contacted: number;
    closed: number;
    lost: number;
    unreachable: number;
    conversionRate: number;
    avgResponseTime: number;
    avgClosingTime: number;
  };
}

interface BackendTotals {
  claimed: number;
  contacted: number;
  closed: number;
  lost: number;
  unreachable: number;
  conversionRate: number;
  avgResponseTime: number;
  avgClosingTime: number;
}

interface BackendResponse {
  success: boolean;
  data?: {
    period: { start: string; end: string };
    team: BackendTeamMember[];
    totals: BackendTotals;
    comparison: unknown;
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
    const backendUrl = `${BACKEND_URL}/api/admin/sales-performance${searchParams ? `?${searchParams}` : ''}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const backendData: BackendResponse = await response.json();

    // If backend returned error, pass it through
    if (!backendData.success || !backendData.data) {
      return NextResponse.json(backendData, { status: response.status });
    }

    // Transform backend response to frontend expected format
    const { team, totals } = backendData.data;

    const transformedData = {
      success: true,
      data: {
        teamPerformance: team.map((member) => ({
          userId: member.id,
          name: member.name,
          // Email not available from sales-performance endpoint - use /api/admin/me for user info
          email: '',
          claimed: member.stats.claimed,
          contacted: member.stats.contacted,
          closed: member.stats.closed,
          lost: member.stats.lost,
          unreachable: member.stats.unreachable,
          conversionRate: member.stats.conversionRate,
          avgResponseTime: member.stats.avgResponseTime,
        })),
        summary: {
          totalClaimed: totals.claimed,
          totalContacted: totals.contacted,
          totalClosed: totals.closed,
          avgConversionRate: totals.conversionRate,
          avgResponseTime: totals.avgResponseTime,
        },
      },
    };

    return NextResponse.json(transformedData, { status: response.status });
  } catch (error) {
    console.error('Sales Performance API proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch sales performance data',
        },
      },
      { status: 500 }
    );
  }
}
