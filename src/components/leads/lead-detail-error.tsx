/**
 * Lead Detail Error Component
 * Story 4.8: Lead Detail Modal (Enhanced)
 *
 * AC#6: Error Handling
 * - Error message appears with retry button
 * - Styled consistently with other error components
 */
'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LeadDetailErrorProps {
  onRetry: () => void;
  message?: string;
}

export function LeadDetailError({
  onRetry,
  message = 'Failed to load lead details',
}: LeadDetailErrorProps) {
  return (
    <Card
      className="border-destructive/50"
      data-testid="lead-detail-error"
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-3 rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-destructive">{message}</p>
            <p className="text-sm text-muted-foreground">
              Please try again or check your connection
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onRetry}
            className="gap-2"
            aria-label="Retry loading lead details"
            data-testid="retry-button"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
