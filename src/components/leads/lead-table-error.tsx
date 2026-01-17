/**
 * Lead Table Error State Component
 * Story 4.1: Lead List Table
 *
 * AC#6: Error state shows retry button with error message
 */
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface LeadTableErrorProps {
  message?: string;
  onRetry: () => void;
}

export function LeadTableError({
  message = 'Failed to load leads data',
  onRetry,
}: LeadTableErrorProps) {
  return (
    <Card data-testid="lead-table-error">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-red-100 p-4 mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Error Loading Leads</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {message}
        </p>
        <Button
          onClick={onRetry}
          variant="outline"
          className="flex items-center gap-2"
          data-testid="lead-table-retry-button"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}
