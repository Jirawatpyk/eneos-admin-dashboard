/**
 * Activity Log Empty State Component (Story 7-7)
 * AC#8: Empty state when no entries match filters
 */
'use client';

import { FileQuestion, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActivityLogEmptyProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export function ActivityLogEmpty({ hasFilters, onClearFilters }: ActivityLogEmptyProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 border rounded-md bg-muted/20"
      data-testid="activity-log-empty"
    >
      {hasFilters ? (
        <>
          <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No matching activities</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
            No activity log entries match your current filters. Try adjusting your filter criteria.
          </p>
          {onClearFilters && (
            <Button variant="outline" onClick={onClearFilters} data-testid="clear-filters-btn">
              Clear all filters
            </Button>
          )}
        </>
      ) : (
        <>
          <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No activity yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Activity log entries will appear here when leads are created or status changes occur.
          </p>
        </>
      )}
    </div>
  );
}
