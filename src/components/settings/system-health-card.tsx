/**
 * System Health Card Component
 * Story 7.5: System Health
 *
 * Displays backend service health status including Google Sheets, Gemini AI, and LINE API.
 * Shows overall system status, individual service status with latency, and system metrics.
 *
 * AC#1: System Health Card - displays on Settings page
 * AC#2: Service Status Display - shows status for each service with Up/Down indicators
 * AC#3: Last Check Timestamp - displays relative time
 * AC#4: Refresh Health Check - manual refresh with loading state
 * AC#5: System Metrics Summary - shows version, uptime, last check
 * AC#6: Error State Handling - displays error message with retry button
 */
'use client';

import { RefreshCw, Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSystemHealth, formatUptime } from '@/hooks/use-system-health';
import { SystemHealthSkeleton } from './system-health-skeleton';

// ============================================================================
// Types
// ============================================================================

type ServiceStatus = 'up' | 'down' | 'unknown';

interface ServiceStatusRowProps {
  name: string;
  status: ServiceStatus;
  latency?: number;
}

// ============================================================================
// Service Status Row Component (Task 3)
// ============================================================================

function ServiceStatusRow({ name, status, latency }: ServiceStatusRowProps) {
  return (
    <div
      className="flex items-center justify-between py-2"
      data-testid={`service-row-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center gap-2">
        {status === 'up' && (
          <CheckCircle
            className="h-4 w-4 text-green-500"
            data-testid="status-icon-up"
          />
        )}
        {status === 'down' && (
          <XCircle
            className="h-4 w-4 text-red-500"
            data-testid="status-icon-down"
          />
        )}
        {status === 'unknown' && (
          <AlertCircle
            className="h-4 w-4 text-gray-400"
            data-testid="status-icon-unknown"
          />
        )}
        <span className="text-sm">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        {latency !== undefined && status !== 'unknown' && (
          <span className="text-xs text-muted-foreground" data-testid="service-latency">
            {latency}ms
          </span>
        )}
        <Badge
          variant={
            status === 'up'
              ? 'default'
              : status === 'down'
                ? 'destructive'
                : 'secondary'
          }
          className={`text-xs ${status === 'up' ? 'bg-green-500 hover:bg-green-600' : ''}`}
          data-testid="service-status-badge"
        >
          {status === 'up' ? 'Up' : status === 'down' ? 'Down' : 'Unknown'}
        </Badge>
      </div>
    </div>
  );
}

// ============================================================================
// Overall Status Badge Component
// ============================================================================

function OverallStatusBadge({ status }: { status?: string }) {
  switch (status) {
    case 'healthy':
      return (
        <Badge
          className="bg-green-500 hover:bg-green-600"
          data-testid="status-badge-healthy"
        >
          Healthy
        </Badge>
      );
    case 'degraded':
      return (
        <Badge
          className="bg-yellow-500 hover:bg-yellow-600"
          data-testid="status-badge-degraded"
        >
          Degraded
        </Badge>
      );
    case 'unhealthy':
      return (
        <Badge variant="destructive" data-testid="status-badge-unhealthy">
          Unhealthy
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" data-testid="status-badge-unknown">
          Unknown
        </Badge>
      );
  }
}

// ============================================================================
// Main System Health Card Component
// ============================================================================

export function SystemHealthCard() {
  const { data, isLoading, isError, refetch, isRefetching } = useSystemHealth();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // Handle manual refresh with loading state (Task 4)
  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } catch {
      // Error will be shown via isError state from query
      // Silently handle - user sees error state on next render
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const isRefreshingState = isRefetching || isManualRefreshing;

  // Loading State (AC#8)
  if (isLoading) {
    return <SystemHealthSkeleton />;
  }

  // Error State (AC#6)
  if (isError) {
    return (
      <Card data-testid="system-health-card-error">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p
              className="text-sm text-muted-foreground mb-4"
              data-testid="error-message"
            >
              Unable to fetch health status
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

  // Success State
  return (
    <Card data-testid="system-health-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Health
        </CardTitle>
        {/* Refresh Button (Task 4) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshingState}
          data-testid="refresh-button"
          aria-label="Refresh health status"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshingState ? 'animate-spin' : ''}`}
          />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status (AC#1) */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Overall Status</span>
          <OverallStatusBadge status={data?.status} />
        </div>

        {/* Services Section (AC#2, Task 3) */}
        <div className="border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Services
          </p>
          <ServiceStatusRow
            name="Google Sheets"
            status={data?.services?.googleSheets?.status || 'unknown'}
            latency={data?.services?.googleSheets?.latency}
          />
          <ServiceStatusRow
            name="Gemini AI"
            status={data?.services?.geminiAI?.status || 'unknown'}
            latency={data?.services?.geminiAI?.latency}
          />
          <ServiceStatusRow
            name="LINE API"
            status={data?.services?.lineAPI?.status || 'unknown'}
            latency={data?.services?.lineAPI?.latency}
          />
        </div>

        {/* Metrics Footer - Inline display (AC#5, Task 5) */}
        <div className="border-t pt-4 text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between" data-testid="metric-version">
            <span>Version</span>
            <span>{data?.version || '-'}</span>
          </div>
          {data?.uptime !== undefined && (
            <div className="flex justify-between" data-testid="metric-uptime">
              <span>Uptime</span>
              <span>{formatUptime(data.uptime)}</span>
            </div>
          )}
          {data?.timestamp && !isNaN(new Date(data.timestamp).getTime()) && (
            <div className="flex justify-between" data-testid="metric-last-check">
              <span>Last Check</span>
              <span>
                {formatDistanceToNow(new Date(data.timestamp), {
                  addSuffix: true,
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
