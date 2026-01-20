/**
 * Health Check API Proxy
 * Story 7.5: System Health
 *
 * Proxies GET /health to backend health endpoint.
 * Returns cached health check response (30s TTL on backend).
 *
 * AC#1, AC#2: Fetch health status for System Health Card
 */
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      next: { revalidate: 30 }, // Cache for 30 seconds (matches backend TTL)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: errorData.error || 'Backend health check failed',
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
  } catch (error) {
    // Backend unreachable
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Backend unreachable',
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
