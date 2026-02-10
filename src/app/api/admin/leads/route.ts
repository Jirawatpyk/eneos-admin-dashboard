/**
 * Leads API Proxy Route
 * Story 4.1: Lead List Table
 * Story 4.3: Search - Passes search query parameter to backend (AC#3)
 * Story 4.5: Owner Filter - Passes owner query parameter to backend (AC#4)
 * Story 4.6: Date Filter - Passes from/to query parameters to backend (AC#5)
 * Story 4.14: Lead Source Filter - Passes leadSource parameter to backend (AC#4)
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
    // Note: Frontend uses different param names, map to backend names
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');
    const owner = searchParams.get('owner'); // Story 4.5: Multi-value owner filter
    const salesOwnerId = searchParams.get('salesOwnerId'); // Legacy: Frontend name
    const leadSource = searchParams.get('leadSource'); // Story 4.14: Lead source filter
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy');
    const sortDir = searchParams.get('sortDir'); // Frontend name
    const from = searchParams.get('from'); // Story 4.6: Date filter start (YYYY-MM-DD)
    const to = searchParams.get('to'); // Story 4.6: Date filter end (YYYY-MM-DD)

    if (page) backendParams.set('page', page);
    if (limit) backendParams.set('limit', limit);
    if (status) backendParams.set('status', status);
    // Story 4.5: Prefer owner param (supports multi-select), fallback to salesOwnerId
    if (owner) {
      backendParams.set('owner', owner); // Already comma-separated
    } else if (salesOwnerId) {
      backendParams.set('owner', salesOwnerId); // Legacy single owner support
    }
    if (search) backendParams.set('search', search);
    if (sortBy) backendParams.set('sortBy', sortBy); // Backend accepts: date, createdAt, company, status
    if (sortDir) backendParams.set('sortOrder', sortDir); // Backend expects 'sortOrder'
    // Story 4.6 AC#5: Date filter params (backend filters by createdAt)
    // Note: Frontend uses 'from'/'to', Backend expects 'startDate'/'endDate'
    if (from) backendParams.set('startDate', from);
    if (to) backendParams.set('endDate', to);
    // Story 4.14: Lead source filter (AC#4)
    if (leadSource) backendParams.set('leadSource', leadSource);

    const backendUrl = `${BACKEND_URL}/api/admin/leads?${backendParams.toString()}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
    });

    const data = await response.json();

    // Transform backend response to match frontend expected format
    // Backend returns: { success, data: { data: leads[], pagination, filters } }
    // Frontend expects: { success, data: { leads, pagination, availableFilters } }
    if (data.success && data.data?.data) {
      try {
        // Transform each lead to match frontend interface
        // Note: Some fields are set to null/defaults because:
        // - Backend doesn't provide these fields in list response (optimization)
        // - These fields are available in detail endpoint (/api/admin/leads/[id])
        const transformedLeads = data.data.data.map((lead: Record<string, unknown>) => {
          // Safely extract nested objects with type guards
          const owner = lead.owner as { id?: string; name?: string } | null | undefined;
          const campaign = lead.campaign as { id?: string; name?: string } | null | undefined;

          return {
            // Core fields from backend
            row: lead.row,
            date: lead.date,
            customerName: lead.customerName,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            industryAI: lead.industry ?? null, // Backend uses 'industry'
            website: lead.website ?? null,
            capital: lead.capital ?? null,
            status: lead.status,
            source: lead.source ?? null,
            clickedAt: lead.clickedAt ?? null,
            talkingPoint: lead.talkingPoint ?? null,
            closedAt: lead.closedAt ?? null,

            // Nested object transformations (backend uses different structure)
            salesOwnerId: owner?.id ?? null,
            salesOwnerName: owner?.name ?? null,
            campaignId: campaign?.id ?? '',
            campaignName: campaign?.name ?? '',

            // Additional lead fields from backend
            leadSource: (lead.leadSource as string) ?? null,
            jobTitle: (lead.jobTitle as string) ?? null,
            city: (lead.city as string) ?? null,

            // Google Search Grounding fields (2026-01-26)
            juristicId: (lead.juristicId as string) ?? null,
            dbdSector: (lead.dbdSector as string) ?? null,
            province: (lead.province as string) ?? null,
            fullAddress: (lead.fullAddress as string) ?? null,

            // UUID — primary identifier from Supabase
            leadUuid: (lead.leadUuid as string) ?? '',

            // Fields not provided in list response (available in detail endpoint)
            emailSubject: null,
            leadId: null,
            eventId: null,
            lostAt: null,
            unreachableAt: null,
            version: 1, // Default version for optimistic locking
            createdAt: lead.date as string, // Use date as createdAt (same value)
            updatedAt: null,
          };
        });

        const transformedData = {
          success: true,
          data: {
            leads: transformedLeads,
            pagination: data.data.pagination,
            // Story 4.14: Include available filters for Lead Source dropdown
            availableFilters: data.data.filters?.available,
          },
        };
        return NextResponse.json(transformedData, { status: response.status });
      } catch (transformError) {
        console.error('Lead data transformation error:', transformError);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'TRANSFORM_ERROR',
              message: 'Failed to transform lead data from backend',
            },
          },
          { status: 500 }
        );
      }
    }

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
