/**
 * Campaign Events Table Component
 * Story 5.7: Campaign Detail Sheet
 *
 * AC#3: Event log table with Email, Event Type, Timestamp, URL columns
 * AC#5: Pagination controls (20 per page)
 */
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { CopyEmailButton } from './copy-email-button';
import type { CampaignEventItem } from '@/types/campaigns';

export interface CampaignEventsTableProps {
  /** Array of event items to display */
  events: CampaignEventItem[];
  /** Current page number (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total number of events */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
}

/** Validate URL protocol to prevent XSS via javascript: or data: URIs */
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/** Badge variant mapping for event types */
const eventBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  delivered: 'secondary',
  opened: 'outline',
  click: 'default',
};

export function CampaignEventsTable({
  events,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
}: CampaignEventsTableProps) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="space-y-4" data-testid="campaign-events-table">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="w-[120px]">Event</TableHead>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>URL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={`${event.eventId}-${event.event}`} data-testid={`event-row-${event.eventId}-${event.event}`}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <span className="truncate max-w-[200px]">{event.email}</span>
                    <CopyEmailButton email={event.email} />
                  </div>
                </TableCell>
                <TableCell data-testid={`event-name-${event.eventId}-${event.event}`}>
                  {event.firstname || event.lastname
                    ? `${event.firstname} ${event.lastname}`.trim()
                    : '-'}
                </TableCell>
                <TableCell data-testid={`event-company-${event.eventId}-${event.event}`}>
                  {event.company || '-'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={eventBadgeVariant[event.event] ?? 'secondary'}
                    data-testid={`event-badge-${event.event}`}
                  >
                    {event.event}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {format(new Date(event.eventAt), 'yyyy-MM-dd HH:mm:ss')}
                </TableCell>
                <TableCell>
                  {event.url && isSafeUrl(event.url) ? (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline max-w-[200px] truncate"
                    >
                      <span className="truncate">{event.url}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* AC#5: Pagination */}
      <div
        className="flex items-center justify-between px-2"
        data-testid="events-pagination"
      >
        <div className="text-sm text-muted-foreground" data-testid="events-pagination-range">
          Showing {start} to {end} of {total} events
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Go to previous page"
            data-testid="events-pagination-previous"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </Button>
          <span className="text-sm" data-testid="events-pagination-info">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Go to next page"
            data-testid="events-pagination-next"
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
