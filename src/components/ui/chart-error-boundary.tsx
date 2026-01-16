/**
 * Chart Error Boundary Component
 * Story 3.5: Individual Performance Trend
 *
 * Catches rendering errors from Recharts to prevent white screen of death
 */
'use client';

import React, { Component, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ChartErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ChartErrorBoundary extends Component<
  ChartErrorBoundaryProps,
  ChartErrorBoundaryState
> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error for debugging (could be sent to error tracking service)
    console.error('[ChartErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Card data-testid="chart-error-boundary">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              {this.props.fallbackTitle || 'Chart'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-destructive/10 p-3 mb-4">
                <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                Unable to render chart
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-[200px]">
                An error occurred while displaying this chart
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReset}
                data-testid="chart-error-retry"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
