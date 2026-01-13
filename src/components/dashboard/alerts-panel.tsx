/**
 * Alerts Panel Component
 * Story 2.6: Alerts Panel
 *
 * AC#1: Alerts Panel Display - panel with actionable warnings
 * AC#5: Alert Count Badge - red/orange badge showing warning count
 * AC#6: No Alerts State - green checkmark, "All clear!"
 */
'use client';

import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertItem } from './alert-item';
import { AlertsPanelSkeleton } from './alerts-panel-skeleton';
import type { ApiAlert } from '@/types/dashboard';

interface AlertsPanelProps {
  alerts: ApiAlert[];
  isLoading?: boolean;
}

/**
 * Alerts Panel Component
 * Displays actionable warnings and info alerts for leads needing attention
 */
export function AlertsPanel({ alerts, isLoading }: AlertsPanelProps) {
  // Count only warning-severity alerts for the badge
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;

  // Loading state
  if (isLoading) {
    return <AlertsPanelSkeleton />;
  }

  return (
    <Card data-testid="alerts-panel" aria-labelledby="alerts-panel-title">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          <span id="alerts-panel-title">Alerts</span>
        </CardTitle>
        {warningCount > 0 && (
          <Badge
            variant="destructive"
            data-testid="alert-count-badge"
          >
            {warningCount}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <NoAlertsState />
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * No Alerts State Component
 * AC#6: Green checkmark with "All clear!" message
 */
function NoAlertsState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-6 text-green-600"
      data-testid="no-alerts-state"
    >
      <CheckCircle2
        className="h-10 w-10 mb-2"
        data-testid="no-alerts-icon"
        aria-hidden="true"
      />
      <p className="font-medium">All clear!</p>
      <p className="text-sm text-muted-foreground">No alerts at this time</p>
    </div>
  );
}
