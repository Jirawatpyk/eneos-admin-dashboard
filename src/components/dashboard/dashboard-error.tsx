/**
 * Dashboard Error Component
 * Story 2.1: KPI Cards
 *
 * AC#6: Error state with retry button
 * Logs error for debugging
 */
'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardErrorProps {
  message?: string;
  onRetry: () => void;
}

/**
 * Error state component with retry functionality
 */
export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  // Log error for debugging (AC#6) - only in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Dashboard error:', message);
    }
    // In production, errors should be sent to error tracking service (e.g., Sentry)
  }, [message]);

  return (
    <Card className="border-destructive" data-testid="dashboard-error">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle
          className="h-10 w-10 text-destructive mb-4"
          aria-hidden="true"
        />
        <h3 className="font-semibold text-lg mb-2">Failed to load dashboard</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {message || 'An unexpected error occurred. Please try again.'}
        </p>
        <Button onClick={onRetry} variant="outline" data-testid="btn-retry">
          <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}
