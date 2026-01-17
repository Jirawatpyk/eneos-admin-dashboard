/**
 * Lead Table Empty State Component
 * Story 4.1: Lead List Table
 * Story 4.3: Search - AC#6 Empty Search Results
 *
 * AC#6: Empty state shows "No leads found" with helpful message
 * Story 4.3 AC#6: When searching, shows "No leads found for '[search]'"
 *                 with suggestion to clear search or try different keywords
 */
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Inbox, SearchX } from 'lucide-react';

export interface LeadTableEmptyProps {
  /** Custom message to display */
  message?: string;
  /** Search term that returned no results (Story 4.3 AC#6) */
  searchTerm?: string;
  /** Callback to clear search (Story 4.3 AC#6) */
  onClearSearch?: () => void;
}

export function LeadTableEmpty({
  message,
  searchTerm,
  onClearSearch,
}: LeadTableEmptyProps) {
  // Story 4.3 AC#6: Show search-specific empty state when search term is provided
  if (searchTerm) {
    return (
      <Card data-testid="lead-table-empty">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <SearchX
              className="h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <h3 className="text-lg font-semibold mb-2" data-testid="empty-search-title">
            No leads found for &quot;{searchTerm}&quot;
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            Try a different search term or clear the search to see all leads
          </p>
          {onClearSearch && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={onClearSearch}
              data-testid="clear-search-button"
            >
              Clear search
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default empty state (no search)
  return (
    <Card data-testid="lead-table-empty">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Inbox className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Leads Found</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {message || 'No leads found in the system'}
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" aria-hidden="true" />
          <span>Leads will appear here once they are created from campaigns</span>
        </div>
      </CardContent>
    </Card>
  );
}
