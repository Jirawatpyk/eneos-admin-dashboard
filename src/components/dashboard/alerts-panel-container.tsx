/**
 * Alerts Panel Container
 * Story 2.6: Alerts Panel
 *
 * Container component that fetches data from dashboard API
 * and renders AlertsPanel with the alerts data
 */
'use client';

import { useDashboardData } from '@/hooks/use-dashboard-data';
import { AlertsPanel } from './alerts-panel';
import { DashboardError } from './dashboard-error';

/**
 * Alerts Panel Container Component
 * Fetches dashboard data and renders AlertsPanel with alerts
 */
export function AlertsPanelContainer() {
  const { data, isLoading, isError, error, refetch } = useDashboardData();

  // Error state
  if (isError && error) {
    return (
      <DashboardError
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  // Pass alerts directly - API format matches component props
  const alerts = data?.alerts ?? [];

  return (
    <AlertsPanel
      alerts={alerts}
      isLoading={isLoading}
    />
  );
}
