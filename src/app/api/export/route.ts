import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * GET /api/export
 * Proxy export requests to backend API
 * Story 6.1 Task 4: Next.js API Route Proxy
 *
 * Query params:
 * - format: xlsx | csv | pdf (required)
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 * - status: all | new | contacted | closed | lost | unreachable (optional)
 * - owner: LINE User ID or 'all' (optional)
 * - campaign: Campaign ID or 'all' (optional)
 * - claimed: boolean string (optional)
 * - grounding: boolean string (optional)
 */
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
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get Google ID token from JWT
    const idToken = token.idToken as string;

    if (!idToken) {
      return NextResponse.json(
        { success: false, message: 'Google ID token not found. Please sign out and sign in again.' },
        { status: 401 }
      );
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'xlsx';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status') || 'all';
    const owner = searchParams.get('owner') || 'all';
    const campaign = searchParams.get('campaign') || 'all';
    const claimed = searchParams.get('claimed') === 'true';
    const grounding = searchParams.get('grounding') === 'true';

    // Build backend API URL
    const apiUrl = new URL(`${BACKEND_URL}/api/admin/export`);

    // Add query params to backend request
    apiUrl.searchParams.append('type', 'leads'); // Required by backend
    apiUrl.searchParams.append('format', format);
    if (startDate) apiUrl.searchParams.append('startDate', startDate);
    if (endDate) apiUrl.searchParams.append('endDate', endDate);
    if (status !== 'all') apiUrl.searchParams.append('status', status);
    if (owner !== 'all') apiUrl.searchParams.append('owner', owner);
    if (campaign !== 'all') apiUrl.searchParams.append('campaign', campaign);
    if (claimed) apiUrl.searchParams.append('claimed', 'true');
    if (grounding) apiUrl.searchParams.append('grounding', 'true');

    // Call backend API with Google ID token
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || 'Backend export failed',
        },
        { status: response.status }
      );
    }

    // Get file blob from backend
    const blob = await response.blob();

    // Forward Content-Disposition header (filename)
    const contentDisposition = response.headers.get('Content-Disposition');

    // Determine content type based on format
    const contentTypeMap: Record<string, string> = {
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      pdf: 'application/pdf',
    };
    const contentType = contentTypeMap[format] || 'application/octet-stream';

    // Return file response
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition || `attachment; filename="leads-export.${format}"`,
      },
    });
  } catch (error) {
    console.error('Export API route error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
