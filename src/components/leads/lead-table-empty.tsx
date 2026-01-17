/**
 * Lead Table Empty State Component
 * Story 4.1: Lead List Table
 *
 * AC#6: Empty state shows "No leads found" with helpful message
 */
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { FileText, Inbox } from 'lucide-react';

interface LeadTableEmptyProps {
  message?: string;
}

export function LeadTableEmpty({
  message = 'No leads found in the system',
}: LeadTableEmptyProps) {
  return (
    <Card data-testid="lead-table-empty">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Inbox className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Leads Found</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {message}
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" aria-hidden="true" />
          <span>Leads will appear here once they are created from campaigns</span>
        </div>
      </CardContent>
    </Card>
  );
}
