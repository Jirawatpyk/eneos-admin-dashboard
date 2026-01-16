/**
 * Performance Table Error State Component
 * Story 3.1: Sales Team Performance Table
 *
 * AC#8: Error shows retry button with error message
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, AlertCircle, RefreshCw } from 'lucide-react';

interface PerformanceTableErrorProps {
  message: string;
  onRetry: () => void;
}

export function PerformanceTableError({
  message,
  onRetry,
}: PerformanceTableErrorProps) {
  return (
    <Card data-testid="performance-table-error">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" aria-hidden="true" />
          Sales Team Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle
            className="h-12 w-12 text-destructive mb-4"
            aria-hidden="true"
          />
          <h3 className="text-lg font-medium text-destructive">
            Failed to load data
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mb-6">
            {message}
          </p>
          <Button
            onClick={onRetry}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="retry-button"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
