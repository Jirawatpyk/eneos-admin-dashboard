/**
 * Health Refresh API Proxy
 * Story 7.5: System Health
 *
 * Proxies GET /health/refresh to backend to bypass cache.
 * Forces a fresh health check on all services.
 *
 * AC#4: Refresh Health Check - triggers fresh check bypassing cache
 */
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/health/refresh`, {
      cache: 'no-store', // Always fetch fresh
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: errorData.error || 'Backend health refresh failed',
          refreshed: true,
          services: {
            googleSheets: { status: 'unknown', latency: 0 },
            geminiAI: { status: 'unknown', latency: 0 },
            lineAPI: { status: 'unknown', latency: 0 },
          },
        },
        { status: 503 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    // Backend unreachable
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Backend unreachable',
        refreshed: true,
        services: {
          googleSheets: { status: 'unknown', latency: 0 },
          geminiAI: { status: 'unknown', latency: 0 },
          lineAPI: { status: 'unknown', latency: 0 },
        },
      },
      { status: 503 }
    );
  }
}
