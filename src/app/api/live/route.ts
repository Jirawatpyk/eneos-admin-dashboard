/**
 * Liveness Check API Proxy
 * Story 7.5: System Health
 *
 * Proxies GET /live to backend liveness endpoint.
 * Returns server uptime in seconds.
 *
 * AC#5: System Metrics Summary - provides uptime data
 */
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/live`, {
      cache: 'no-store', // Always fetch fresh uptime
    });

    if (!response.ok) {
      // Return null uptime on failure - not critical
      return NextResponse.json(
        {
          alive: false,
          uptime: null,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Backend unreachable - uptime unknown
    return NextResponse.json(
      {
        alive: false,
        uptime: null,
      },
      { status: 503 }
    );
  }
}
