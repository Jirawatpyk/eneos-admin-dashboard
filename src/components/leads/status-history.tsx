/**
 * Status History Component
 * Story 4.8: Lead Detail Modal (Enhanced)
 *
 * AC#2: Status History Section
 * - Timeline of all status changes
 * - Each entry shows: Status badge, Changed by (name), Timestamp
 * - Entries sorted chronologically (newest first)
 * - Status changes use same badge colors as table
 */
'use client';

import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LeadStatusBadge } from './lead-status-badge';
import { formatLeadDateTime } from '@/lib/format-lead';
import type { StatusHistoryItem } from '@/types/lead-detail';

interface StatusHistoryProps {
  history: StatusHistoryItem[];
}

export function StatusHistory({ history }: StatusHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          No status history available
        </CardContent>
      </Card>
    );
  }

  // Sort by timestamp descending (newest first) - AC#2
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div
            className="absolute left-4 top-0 bottom-0 w-px bg-border"
            aria-hidden="true"
          />

          {sortedHistory.map((item) => (
            <div
              key={`${item.status}-${item.timestamp}`}
              className="relative pl-10"
              data-testid="status-history-item"
            >
              {/* Timeline dot */}
              <div
                className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-background border-2 border-primary"
                aria-hidden="true"
              />

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <LeadStatusBadge status={item.status} />
                  {item.by && (
                    <span className="text-sm text-muted-foreground">
                      by {item.by}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  <time dateTime={item.timestamp}>
                    {formatLeadDateTime(item.timestamp)}
                  </time>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
