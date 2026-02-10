/**
 * Campaign Detail Sheet Component
 * Story 5.7: Campaign Detail Sheet
 *
 * AC#1: Sheet opens on row click with campaign name title
 * AC#2: Campaign summary in sheet header
 * AC#9: Close on X, outside click, Escape
 * AC#10: Responsive layout (max-w-xl desktop, full-width mobile)
 */
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useState } from 'react';
import { cn, formatDateSafe } from '@/lib/utils';
import { useCampaignEvents } from '@/hooks/use-campaign-events';
import { CampaignEventsTable } from './campaign-events-table';
import { CampaignEventFilter } from './campaign-event-filter';
import { CampaignEventSearch } from './campaign-event-search';
import { CampaignDateFilter } from './campaign-date-filter';
import { CampaignEventsSkeleton } from './campaign-events-skeleton';
import { CampaignsError } from './campaigns-error';
import type { CampaignStatsItem, CampaignEventType } from '@/types/campaigns';

/** Format Date as local YYYY-MM-DD for API query params (avoids UTC shift from toISOString) */
function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Page size constant for event log pagination */
const EVENTS_PAGE_SIZE = 20;

/** Limit when email search is active — fetch all events for client-side filtering */
const SEARCH_ALL_LIMIT = 1000;

export interface CampaignDetailSheetProps {
  /** Campaign data from table row (null when no campaign selected) */
  campaign: CampaignStatsItem | null;
  /** Whether the sheet is open */
  open: boolean;
  /** Callback to control sheet open state */
  onOpenChange: (open: boolean) => void;
}

/**
 * Side sheet displaying campaign details and event log.
 * Opens when user clicks a campaign row in CampaignTable.
 */
export function CampaignDetailSheet({
  campaign,
  open,
  onOpenChange,
}: CampaignDetailSheetProps) {
  // Pagination
  const [page, setPage] = useState(1);

  // Filters
  const [eventFilter, setEventFilter] = useState<CampaignEventType>('all');
  const [searchEmail, setSearchEmail] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  // When email search is active, fetch all events for complete client-side filtering
  const isSearching = searchEmail.length > 0;

  // Fetch events via TanStack Query
  const { data, isLoading, isFetching, isError, error, refetch } = useCampaignEvents({
    campaignId: campaign?.campaignId ?? 0,
    page: isSearching ? 1 : page,
    limit: isSearching ? SEARCH_ALL_LIMIT : EVENTS_PAGE_SIZE,
    event: eventFilter === 'all' ? undefined : eventFilter,
    dateFrom: dateFrom ? toLocalDateString(dateFrom) : undefined,
    dateTo: dateTo ? toLocalDateString(dateTo) : undefined,
  });

  // Reset all filters when sheet opens with new campaign (AC#9)
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setPage(1);
      setEventFilter('all');
      setSearchEmail('');
      setDateFrom(null);
      setDateTo(null);
    }
    onOpenChange(newOpen);
  };

  // Reset pagination when filter changes
  const handleEventFilterChange = (type: CampaignEventType) => {
    setEventFilter(type);
    setPage(1);
  };

  const handleDateFromChange = (date: Date | null) => {
    setDateFrom(date);
    setPage(1);
  };

  const handleDateToChange = (date: Date | null) => {
    setDateTo(date);
    setPage(1);
  };

  if (!campaign) return null;

  // Get events and apply client-side email search filter (AC#11)
  const allEvents = data?.data?.data ?? [];
  const filteredEvents = searchEmail
    ? allEvents.filter((e) =>
        e.email.toLowerCase().includes(searchEmail.toLowerCase())
      )
    : allEvents;

  // Client-side pagination for search results (Fix #3: prevent rendering 1000+ rows)
  const searchTotal = filteredEvents.length;
  const searchTotalPages = Math.max(1, Math.ceil(searchTotal / EVENTS_PAGE_SIZE));
  const events = isSearching
    ? filteredEvents.slice((page - 1) * EVENTS_PAGE_SIZE, page * EVENTS_PAGE_SIZE)
    : filteredEvents;

  const pagination = data?.data?.pagination;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {/* AC#10: Responsive width - full on mobile, max-w-xl on sm+ */}
      <SheetContent
        className="w-full sm:max-w-xl overflow-y-auto"
        data-testid="campaign-detail-sheet"
      >
        <SheetHeader>
          {/* AC#1: Campaign name as title */}
          <SheetTitle className="text-xl" data-testid="sheet-campaign-name">
            {campaign.campaignName}
          </SheetTitle>
          <SheetDescription>Campaign event details and metrics</SheetDescription>
        </SheetHeader>

        {/* AC#2: Campaign Summary Header */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-b"
          data-testid="campaign-summary"
        >
          <div>
            <p className="text-sm text-muted-foreground">Delivered</p>
            <p className="text-lg font-semibold" data-testid="summary-delivered" suppressHydrationWarning>
              {campaign.delivered.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Opened</p>
            <p className="text-lg font-semibold" data-testid="summary-opened" suppressHydrationWarning>
              {campaign.uniqueOpens.toLocaleString()}
              <span className="text-sm text-muted-foreground ml-1">
                ({campaign.openRate.toFixed(1)}%)
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Clicked</p>
            <p className="text-lg font-semibold" data-testid="summary-clicked" suppressHydrationWarning>
              {campaign.uniqueClicks.toLocaleString()}
              <span className="text-sm text-muted-foreground ml-1">
                ({campaign.clickRate.toFixed(1)}%)
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">First Event</p>
            <p className="text-lg font-semibold" data-testid="summary-first-event" suppressHydrationWarning>
              {campaign.firstEvent
                ? formatDateSafe(campaign.firstEvent)
                : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <p className="text-lg font-semibold" data-testid="summary-last-updated" suppressHydrationWarning>
              {formatDateSafe(campaign.lastUpdated)}
            </p>
          </div>
        </div>

        {/* Filters Row */}
        <div className="space-y-3 py-3">
          {/* AC#4: Event Type Filter */}
          <CampaignEventFilter
            selected={eventFilter}
            onSelect={handleEventFilterChange}
          />

          {/* AC#11: Email Search + AC#13: Date Range */}
          <div className="flex flex-wrap items-center gap-2">
            <CampaignEventSearch
              value={searchEmail}
              onChange={setSearchEmail}
            />
            <CampaignDateFilter
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={handleDateFromChange}
              onDateToChange={handleDateToChange}
            />
          </div>
        </div>

        {/* Event Log Content */}
        <div className={cn("min-h-[300px]", isFetching && !isLoading && "opacity-70 transition-opacity")} data-testid="event-log-content">
          {/* AC#6: Loading State */}
          {isLoading && <CampaignEventsSkeleton />}

          {/* AC#7: Error State */}
          {isError && (
            <CampaignsError
              message={error?.message}
              onRetry={refetch}
            />
          )}

          {/* AC#8: Empty State — check filteredEvents for search, events for normal */}
          {!isLoading && !isError && (isSearching ? filteredEvents.length === 0 : events.length === 0) && (
            <div
              className="text-center py-12 text-muted-foreground"
              data-testid="events-empty-state"
            >
              <p className="text-lg font-medium">No events found</p>
              <p className="text-sm">
                {searchEmail
                  ? `No events matching "${searchEmail}"`
                  : eventFilter === 'all'
                    ? 'No events recorded for this campaign yet'
                    : `No ${eventFilter} events found`}
              </p>
            </div>
          )}

          {/* AC#3, AC#5: Event Log Table with Pagination */}
          {!isLoading && !isError && events.length > 0 && (
            <CampaignEventsTable
              events={events}
              page={page}
              pageSize={EVENTS_PAGE_SIZE}
              total={isSearching ? searchTotal : (pagination?.total ?? 0)}
              totalPages={isSearching ? searchTotalPages : (pagination?.totalPages ?? 1)}
              onPageChange={setPage}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
