/**
 * Lead Processing Status Card Component
 * Story 0-16: Lead Processing Status Monitoring (Admin)
 * AC#3: Lead Processing Status Card (UI)
 *
 * Displays active lead processing status for admin monitoring.
 * Shows overall count, individual status, progress bars, and refresh capability.
 *
 * AC#3: Admin-only visibility, auto-refresh every 5s, status badges, progress bars
 */
'use client';

import { RefreshCw, Activity, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllLeadStatus } from '@/hooks/use-lead-status';
import type { LeadStatusData } from '@/hooks/use-lead-status';

// ============================================================================
// Status Row Component (AC#3 requirement)
// ============================================================================

interface StatusRowProps {
  lead: LeadStatusData;
}

function StatusRow({ lead }: StatusRowProps) {
  // AC#3: Status badge colors
  const statusBadgeVariant = {
    pending: 'secondary' as const,
    processing: 'default' as const,
    completed: 'default' as const, // Will use green via className
    failed: 'destructive' as const,
  }[lead.status];

  const statusClassName = {
    pending: '',
    processing: 'bg-blue-500 hover:bg-blue-600',
    completed: 'bg-green-500 hover:bg-green-600',
    failed: '',
  }[lead.status];

  // AC#3: Truncate correlation ID for display
  const shortId = lead.correlationId.slice(0, 8) + '...';

  return (
    <div
      className="py-3 border-b last:border-b-0"
      data-testid={`status-row-${lead.correlationId}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-mono text-muted-foreground"
            title={lead.correlationId}
          >
            {shortId}
          </span>
          <Badge
            variant={statusBadgeVariant}
            className={`text-xs ${statusClassName}`}
            data-testid="status-badge"
          >
            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground" data-testid="status-time" suppressHydrationWarning>
          {!isNaN(new Date(lead.updatedAt).getTime())
            ? formatDistanceToNow(new Date(lead.updatedAt), { addSuffix: true })
            : '-'}
        </span>
      </div>

      {/* AC#3: Progress bar */}
      {lead.status !== 'completed' && lead.status !== 'failed' && (
        <>
          <Progress
            value={lead.progress}
            className="h-2 mb-1"
            data-testid="status-progress"
          />
          {lead.currentStep && (
            <span className="text-xs text-muted-foreground" data-testid="status-step">
              {lead.currentStep}
            </span>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// Loading Skeleton (AC#3 requirement)
// ============================================================================

function LeadProcessingStatusSkeleton() {
  return (
    <Card data-testid="lead-processing-status-skeleton">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function LeadProcessingStatusCard() {
  const { data, total, isLoading, isError, refetch } = useAllLeadStatus();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // AC#3: Handle manual refresh with loading state
  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('[LeadProcessingStatus] Manual refetch failed:', error);
      // Error will be shown via isError state from query
    } finally {
      setIsManualRefreshing(false);
    }
  };

  // AC#3: Loading State
  if (isLoading) {
    return <LeadProcessingStatusSkeleton />;
  }

  // AC#4: Error State with retry button
  if (isError) {
    return (
      <Card data-testid="lead-processing-status-error">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Lead Processing Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p
              className="text-sm text-muted-foreground mb-4"
              data-testid="error-message"
            >
              Unable to fetch processing status
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isManualRefreshing}
              data-testid="retry-button"
            >
              {isManualRefreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                'Retry'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // AC#3: Empty State
  if (data.length === 0) {
    return (
      <Card data-testid="lead-processing-status-empty">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Lead Processing Status
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isManualRefreshing}
            data-testid="refresh-button"
            aria-label="Refresh processing status"
          >
            <RefreshCw
              className={`h-4 w-4 ${isManualRefreshing ? 'animate-spin' : ''}`}
            />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8" data-testid="empty-state">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p className="text-sm font-medium mb-1">No active lead processing</p>
            <p className="text-xs text-muted-foreground">
              All leads processed successfully
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // AC#3: Success State with data
  return (
    <Card data-testid="lead-processing-status-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Lead Processing Status
          </CardTitle>
          {/* AC#3: Total count badge */}
          <Badge variant="secondary" data-testid="total-count-badge">
            {total} active
          </Badge>
        </div>
        {/* AC#3: Refresh button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isManualRefreshing}
          data-testid="refresh-button"
          aria-label="Refresh processing status"
        >
          <RefreshCw
            className={`h-4 w-4 ${isManualRefreshing ? 'animate-spin' : ''}`}
          />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {data.map((lead) => (
            <StatusRow key={lead.correlationId} lead={lead} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
