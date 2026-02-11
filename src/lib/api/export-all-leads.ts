/**
 * Export All Leads API
 * Technical Debt: Export All Feature (Story 4-10 Task 6)
 *
 * Fetches all leads matching current filters for export.
 * Uses high limit (10000) to get all data in one request.
 */

import type { Lead, LeadsQueryParams } from '@/types/lead';

const API_BASE_URL = '';

/**
 * Maximum leads to export in one request
 * Backend MAX_LIMIT is 100, but for export we use a special endpoint
 * or request multiple pages
 */
const EXPORT_PAGE_SIZE = 100;

/**
 * Maximum concurrent page fetches
 * Prevents overwhelming the server while improving performance
 */
const MAX_CONCURRENT_REQUESTS = 3;

export class ExportAllError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ExportAllError';
  }
}

/**
 * Build query string from params object (export version)
 */
function buildExportQueryString(params: Omit<LeadsQueryParams, 'page' | 'limit'>, page: number): string {
  const searchParams = new URLSearchParams();

  searchParams.set('page', String(page));
  searchParams.set('limit', String(EXPORT_PAGE_SIZE));

  if (params.status && params.status.length > 0) {
    searchParams.set('status', params.status.join(','));
  }
  if (params.owner && params.owner.length > 0) {
    searchParams.set('owner', params.owner.join(','));
  }
  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortDir) searchParams.set('sortDir', params.sortDir);
  if (params.from) searchParams.set('from', params.from);
  if (params.to) searchParams.set('to', params.to);
  if (params.leadSource) searchParams.set('leadSource', params.leadSource);

  return searchParams.toString();
}

interface FetchPageResult {
  leads: Lead[];
  total: number;
  totalPages: number;
}

/**
 * Fetch a single page of leads
 */
async function fetchLeadsPage(
  params: Omit<LeadsQueryParams, 'page' | 'limit'>,
  page: number
): Promise<FetchPageResult> {
  const queryString = buildExportQueryString(params, page);
  const url = `${API_BASE_URL}/api/admin/leads?${queryString}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new ExportAllError(
      `Failed to fetch leads: ${response.statusText}`,
      response.status
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new ExportAllError(result.error?.message || 'Unknown error');
  }

  return {
    leads: result.data.leads,
    total: result.data.pagination.total,
    totalPages: result.data.pagination.totalPages,
  };
}

/**
 * Fetch all leads matching filters for export
 * Fetches pages in parallel batches for better performance
 *
 * @param params - Filter parameters (no pagination)
 * @param onProgress - Optional callback for progress updates
 * @returns All leads matching filters
 */
export async function fetchAllLeadsForExport(
  params: Omit<LeadsQueryParams, 'page' | 'limit'>,
  onProgress?: (loaded: number, total: number) => void
): Promise<{ leads: Lead[]; total: number }> {
  // First fetch to get total count
  const firstPage = await fetchLeadsPage(params, 1);
  const { total, totalPages } = firstPage;
  const allLeads: Lead[] = [...firstPage.leads];

  onProgress?.(allLeads.length, total);

  // If only one page, we're done
  if (totalPages <= 1) {
    return { leads: allLeads, total };
  }

  // Fetch remaining pages in parallel batches
  const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);

  for (let i = 0; i < remainingPages.length; i += MAX_CONCURRENT_REQUESTS) {
    const batch = remainingPages.slice(i, i + MAX_CONCURRENT_REQUESTS);
    const batchResults = await Promise.all(
      batch.map((page) => fetchLeadsPage(params, page))
    );

    // Use push for better performance (avoids creating new arrays)
    for (const result of batchResults) {
      allLeads.push(...result.leads);
    }

    onProgress?.(allLeads.length, total);
  }

  return { leads: allLeads, total };
}
