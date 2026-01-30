/**
 * Campaigns Error Component
 * Story 5.3: Campaign Summary Cards
 *
 * AC#5: Error state with retry button
 * Logs error for debugging
 */
'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CampaignsErrorProps {
  message?: string;
  onRetry: () => void;
}

/**
 * Error state component with retry functionality
 * AC#5: Show error message with Retry button
 */
export function CampaignsError({ message, onRetry }: CampaignsErrorProps) {
  // Log error for debugging
  useEffect(() => {
    // Development: log to console for debugging
    // Production: consider integrating error tracking service (Sentry, etc.)
    console.error('Campaigns error:', message);
  }, [message]);

  return (
    <Card className="border-destructive" data-testid="campaigns-error">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle
          className="h-10 w-10 text-destructive mb-4"
          aria-hidden="true"
        />
        <h3 className="font-semibold text-lg mb-2">Failed to load campaigns</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {message || 'An unexpected error occurred. Please try again.'}
        </p>
        <Button onClick={onRetry} variant="outline" data-testid="btn-campaigns-retry">
          <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}
