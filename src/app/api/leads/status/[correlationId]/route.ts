/**
 * Lead Status API Proxy - Get Specific Lead Status
 * Story 0-16: Lead Processing Status Monitoring (Admin)
 * AC#1: API Proxy Routes
 *
 * Proxies GET /api/leads/status/:correlationId to backend status endpoint.
 * Returns real-time lead processing status by correlation ID.
 *
 * Public endpoint - anyone with correlation ID can check status.
 */
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ correlationId: string }> }
) {
  try {
    const { correlationId } = await params;

    // AC#1: Validate correlationId exists
    if (!correlationId) {
      return NextResponse.json(
        { success: false, error: 'Correlation ID is required' },
        { status: 400 }
      );
    }

    // AC#1: Handle network timeouts gracefully (5 second timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${BACKEND_URL}/api/leads/status/${correlationId}`, {
        // Don't cache - status changes frequently (AC#1 requirement)
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          success: false,
          error: `Backend error: ${response.status} ${response.statusText}`,
        }));
        return NextResponse.json(errorData, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Handle timeout specifically
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Request timeout - backend took too long to respond' },
          { status: 504 }
        );
      }

      // Re-throw to be caught by outer catch block
      throw fetchError;
    }
  } catch (error) {
    // AC#1: Handle backend unreachable (503 Service Unavailable)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Backend unreachable',
      },
      { status: 503 }
    );
  }
}
