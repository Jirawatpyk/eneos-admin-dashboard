/**
 * Activity Log Container Component (Story 7-7)
 * Container component that handles data fetching and state management
 *
 * AC#1: Admin only access (handled by page)
 * AC#2: Display activity log with pagination
 * AC#4: Filter by date range (URL synced)
 * AC#5: Filter by status (URL synced)
 * AC#6: Filter by changed by (URL synced)
 * AC#7: Click row to open Lead Detail Modal
 * AC#8: Loading state
 * AC#9: Empty state
 * AC#10: Responsive design
 */
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useActivityLog } from '@/hooks/use-activity-log';
import { usePaginationParams, type ValidLimit } from '@/hooks/use-pagination-params';
import { LeadPagination } from '@/components/leads/lead-pagination';
import { LeadDetailSheet } from '@/components/leads/lead-detail-sheet';
import { ActivityLogTable } from './activity-log-table';
import { ActivityLogSkeleton } from './activity-log-skeleton';
import { ActivityLogEmpty } from './activity-log-empty';
import { ActivityLogFilters, type DateRange } from './activity-log-filters';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { LeadStatus, Lead } from '@/types/lead';

/**
 * Format date for API (YYYY-MM-DD)
 */
function formatDateForApi(date: Date | undefined): string | undefined {
  if (!date) return undefined;
  return date.toISOString().split('T')[0];
}

/**
 * Parse date from URL param (YYYY-MM-DD)
 */
function parseDateFromUrl(dateStr: string | null): Date | undefined {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? undefined : date;
}

export function ActivityLogContainer() {
  // URL state management
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Pagination state (uses its own URL sync)
  const { page, limit, setPage, setLimit } = usePaginationParams();

  // Read filter values from URL
  const statusFilter = useMemo<LeadStatus[]>(() => {
    const statusParam = searchParams.get('status');
    if (!statusParam) return [];
    return statusParam.split(',').filter((s): s is LeadStatus =>
      ['new', 'claimed', 'contacted', 'closed', 'lost', 'unreachable'].includes(s)
    );
  }, [searchParams]);

  const dateRange = useMemo<DateRange | null>(() => {
    const from = parseDateFromUrl(searchParams.get('from'));
    const to = parseDateFromUrl(searchParams.get('to'));
    if (!from && !to) return null;
    return { from, to };
  }, [searchParams]);

  const changedBy = searchParams.get('changedBy');

  // Helper to update URL params
  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      // Reset to page 1 when filters change
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  // Filter handlers that update URL
  const setStatusFilter = useCallback(
    (statuses: LeadStatus[]) => {
      updateUrlParams({ status: statuses.length > 0 ? statuses.join(',') : null });
    },
    [updateUrlParams]
  );

  const setDateRange = useCallback(
    (range: DateRange | null) => {
      updateUrlParams({
        from: range?.from ? formatDateForApi(range.from) || null : null,
        to: range?.to ? formatDateForApi(range.to) || null : null,
      });
    },
    [updateUrlParams]
  );

  const setChangedBy = useCallback(
    (value: string | null) => {
      updateUrlParams({ changedBy: value });
    },
    [updateUrlParams]
  );

  // Lead detail modal state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Build query params
  const queryParams = useMemo(
    () => ({
      page,
      limit,
      from: formatDateForApi(dateRange?.from),
      to: formatDateForApi(dateRange?.to),
      status: statusFilter.length > 0 ? statusFilter.join(',') : undefined,
      changedBy: changedBy || undefined,
    }),
    [page, limit, dateRange, statusFilter, changedBy]
  );

  // Fetch activity log data
  const { data, isLoading, isFetching, isError, refetch } = useActivityLog(queryParams);

  // Handlers
  // Create a minimal Lead object for the detail sheet - it will fetch the full details
  const handleRowClick = useCallback(
    (rowNumber: number) => {
      // Find the entry to get company name for the sheet
      const entry = data?.entries.find((e) => e.rowNumber === rowNumber);
      if (entry) {
        // Create minimal Lead object - LeadDetailSheet will fetch full details via useLead
        const minimalLead: Lead = {
          row: rowNumber,
          date: entry.timestamp,
          customerName: '',
          email: '',
          phone: '',
          company: entry.companyName,
          industryAI: null,
          website: null,
          capital: null,
          status: entry.status,
          salesOwnerId: null,
          salesOwnerName: null,
          campaignId: '',
          campaignName: '',
          emailSubject: null,
          source: '',
          leadId: null,
          eventId: null,
          clickedAt: null,
          talkingPoint: null,
          closedAt: null,
          lostAt: null,
          unreachableAt: null,
          version: 1,
          leadSource: null,
          jobTitle: null,
          city: null,
          leadUuid: entry.leadUUID,
          createdAt: entry.timestamp,
          updatedAt: null,
        };
        setSelectedLead(minimalLead);
        setSheetOpen(true);
      }
    },
    [data?.entries]
  );

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      setLimit(newLimit as ValidLimit);
    },
    [setLimit]
  );

  const handleClearAllFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('status');
    params.delete('from');
    params.delete('to');
    params.delete('changedBy');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  // Check if any filter is active
  const hasAnyFilter = statusFilter.length > 0 || dateRange !== null || changedBy !== null;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="activity-log-loading">
        <ActivityLogFilters
          statusValue={statusFilter}
          dateRangeValue={dateRange}
          changedByValue={changedBy}
          changedByOptions={[]}
          onStatusChange={setStatusFilter}
          onDateRangeChange={setDateRange}
          onChangedByChange={setChangedBy}
          onClearAll={handleClearAllFilters}
          isLoading
        />
        <ActivityLogSkeleton />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-4" data-testid="activity-log-error">
        <ActivityLogFilters
          statusValue={statusFilter}
          dateRangeValue={dateRange}
          changedByValue={changedBy}
          changedByOptions={[]}
          onStatusChange={setStatusFilter}
          onDateRangeChange={setDateRange}
          onChangedByChange={setChangedBy}
          onClearAll={handleClearAllFilters}
        />
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive">Error loading activity log</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Failed to fetch activity log data. Please try again.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!data?.entries || data.entries.length === 0) {
    return (
      <div className="space-y-4" data-testid="activity-log-empty-state">
        <ActivityLogFilters
          statusValue={statusFilter}
          dateRangeValue={dateRange}
          changedByValue={changedBy}
          changedByOptions={data?.changedByOptions || []}
          onStatusChange={setStatusFilter}
          onDateRangeChange={setDateRange}
          onChangedByChange={setChangedBy}
          onClearAll={handleClearAllFilters}
        />
        <ActivityLogEmpty hasFilters={hasAnyFilter} onClearFilters={handleClearAllFilters} />
      </div>
    );
  }

  // Success state with data
  return (
    <div className="space-y-4" data-testid="activity-log-container">
      {/* Filters */}
      <ActivityLogFilters
        statusValue={statusFilter}
        dateRangeValue={dateRange}
        changedByValue={changedBy}
        changedByOptions={data.changedByOptions}
        onStatusChange={setStatusFilter}
        onDateRangeChange={setDateRange}
        onChangedByChange={setChangedBy}
        onClearAll={handleClearAllFilters}
        disabled={isFetching}
      />

      {/* Table */}
      <ActivityLogTable entries={data.entries} onRowClick={handleRowClick} isFetching={isFetching} />

      {/* Pagination */}
      <LeadPagination
        page={page}
        limit={limit}
        total={data.pagination.total}
        totalPages={data.pagination.totalPages}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
        isFetching={isFetching}
      />

      {/* Lead Detail Sheet - reuse from leads */}
      <LeadDetailSheet open={sheetOpen} onOpenChange={setSheetOpen} lead={selectedLead} />
    </div>
  );
}
